"use client";

import { useState, useCallback, useRef, useEffect, useSyncExternalStore } from "react";

// useSyncExternalStore helpers for online status
function getOnlineSnapshot(): boolean {
  return navigator.onLine;
}

function getOnlineServerSnapshot(): boolean {
  return true; // Assume online on server
}

function subscribeOnline(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/**
 * Error Recovery Hook
 * Implements retry logic with exponential backoff for API calls
 * Provides clear error states and recovery options
 */

export interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

export interface ErrorState {
  message: string;
  code?: string;
  retryCount: number;
  canRetry: boolean;
  isOffline: boolean;
  timestamp: Date;
}

export interface UseErrorRecoveryResult<T> {
  // State
  data: T | null;
  error: ErrorState | null;
  isLoading: boolean;
  isRetrying: boolean;
  retryCount: number;
  
  // Actions
  execute: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
  
  // Utils
  canRetry: boolean;
  nextRetryIn: number | null;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
};

function calculateBackoff(
  retryCount: number, 
  config: Required<RetryConfig>
): number {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, retryCount);
  return Math.min(delay, config.maxDelay);
}

function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Handle common error types with user-friendly messages
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      return "Unable to connect to the server. Please check your internet connection.";
    }
    if (error.message.includes("timeout") || error.message.includes("AbortError")) {
      return "The request took too long. Please try again.";
    }
    if (error.message.includes("413")) {
      return "The file is too large. Please try a smaller file.";
    }
    if (error.message.includes("429")) {
      return "Too many requests. Please wait a moment and try again.";
    }
    if (error.message.includes("500") || error.message.includes("502") || error.message.includes("503")) {
      return "The server is experiencing issues. Please try again in a few minutes.";
    }
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}

export function useErrorRecovery<T>(
  asyncFn: () => Promise<T>,
  config: RetryConfig = {}
): UseErrorRecoveryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [nextRetryIn, setNextRetryIn] = useState<number | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const execute = useCallback(async () => {
    // Reset state
    setIsLoading(true);
    setError(null);
    setData(null);
    setRetryCount(0);
    setNextRetryIn(null);
    
    // Cancel any pending operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const result = await asyncFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError({
        message: parseErrorMessage(err),
        code: err instanceof Error ? err.name : undefined,
        retryCount: 0,
        canRetry: true,
        isOffline: !navigator.onLine,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn]);

  const retry = useCallback(async () => {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    
    if (retryCount >= mergedConfig.maxRetries) {
      setError(prev => prev ? { ...prev, canRetry: false } : null);
      return;
    }

    setIsRetrying(true);
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);

    // Calculate backoff delay
    const delay = calculateBackoff(retryCount, mergedConfig);
    
    // Countdown timer
    setNextRetryIn(delay);
    const countdownInterval = setInterval(() => {
      setNextRetryIn(prev => prev ? Math.max(0, prev - 100) : null);
    }, 100);

    // Wait for backoff delay
    await new Promise(resolve => {
      retryTimeoutRef.current = setTimeout(resolve, delay);
    });
    
    clearInterval(countdownInterval);
    setNextRetryIn(null);

    try {
      const result = await asyncFn();
      setData(result);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      setError({
        message: parseErrorMessage(err),
        code: err instanceof Error ? err.name : undefined,
        retryCount: newRetryCount,
        canRetry: newRetryCount < mergedConfig.maxRetries,
        isOffline: !navigator.onLine,
        timestamp: new Date(),
      });
    } finally {
      setIsRetrying(false);
    }
  }, [asyncFn, retryCount, config]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsRetrying(false);
    setRetryCount(0);
    setNextRetryIn(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  return {
    data,
    error,
    isLoading,
    isRetrying,
    retryCount,
    execute,
    retry,
    reset,
    canRetry: error?.canRetry ?? false,
    nextRetryIn,
  };
}

/**
 * Queue for offline requests
 * Stores failed requests and retries when back online
 */
interface QueuedRequest {
  id: string;
  fn: () => Promise<unknown>;
  timestamp: Date;
  retryCount: number;
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineServerSnapshot);
  const processQueueRef = useRef<(() => Promise<void>) | null>(null);
  const prevOnlineRef = useRef(isOnline);

  const processQueue = useCallback(async () => {
    if (isProcessing || queue.length === 0) return;
    
    setIsProcessing(true);
    
    for (const request of queue) {
      try {
        await request.fn();
        // Remove successful request
        setQueue(prev => prev.filter(r => r.id !== request.id));
      } catch {
        // Increment retry count
        setQueue(prev => prev.map(r => 
          r.id === request.id 
            ? { ...r, retryCount: r.retryCount + 1 }
            : r
        ));
      }
    }
    
    setIsProcessing(false);
  }, [isProcessing, queue]);

  // Keep ref updated in useEffect (cannot assign during render)
  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  // Process queue when coming back online
  useEffect(() => {
    // Only react when transitioning from offline to online
    if (isOnline && !prevOnlineRef.current) {
      processQueueRef.current?.();
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  const addToQueue = useCallback((id: string, fn: () => Promise<unknown>) => {
    setQueue(prev => [
      ...prev,
      { id, fn, timestamp: new Date(), retryCount: 0 }
    ]);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(r => r.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    queue,
    queueLength: queue.length,
    isProcessing,
    isOnline,
    addToQueue,
    processQueue,
    removeFromQueue,
    clearQueue,
  };
}
