"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// ============================================
// TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  avatarUrl: string | null;
  status: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
  refreshToken: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  continueAsGuest: () => void;
  exitGuestMode: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  expiresAt: number | null;
}

// ============================================
// CONSTANTS
// ============================================

const AUTH_STORAGE_KEY = "curasense_auth";
const GUEST_STORAGE_KEY = "curasense_guest";
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    expiresAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Guest mode functions
  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(GUEST_STORAGE_KEY, "true");
    }
  }, []);

  const exitGuestMode = useCallback(() => {
    setIsGuest(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    }
  }, []);

  // Check for guest mode on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const guestMode = localStorage.getItem(GUEST_STORAGE_KEY);
      if (guestMode === "true") {
        setIsGuest(true);
      }
    }
  }, []);

  // Persist auth state to localStorage
  const persistAuth = useCallback((state: AuthState) => {
    if (typeof window !== "undefined") {
      if (state.user && state.accessToken) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  // Clear auth state
  const clearAuth = useCallback(() => {
    setAuthState({ user: null, accessToken: null, expiresAt: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  // Refresh access token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Include cookies
      });

      if (!response.ok) {
        clearAuth();
        return false;
      }

      const data = await response.json();
      const expiresAt = Date.now() + data.expiresIn * 1000;

      setAuthState((prev) => ({
        ...prev,
        accessToken: data.accessToken,
        expiresAt,
      }));

      return true;
    } catch {
      clearAuth();
      return false;
    }
  }, [clearAuth]);

  // Verify and restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) {
        setIsLoading(false);
        return;
      }

      try {
        const parsed: AuthState = JSON.parse(stored);
        
        // Check if token is expired
        if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
          // Try to refresh
          const refreshed = await refreshToken();
          if (!refreshed) {
            clearAuth();
          }
        } else if (parsed.accessToken) {
          // Verify token with server
          const response = await fetch("/api/auth/verify", {
            headers: {
              Authorization: `Bearer ${parsed.accessToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setAuthState({
              user: data.user,
              accessToken: parsed.accessToken,
              expiresAt: parsed.expiresAt,
            });
          } else {
            // Try refresh
            const refreshed = await refreshToken();
            if (!refreshed) {
              clearAuth();
            }
          }
        }
      } catch {
        clearAuth();
      }

      setIsLoading(false);
    };

    initAuth();
  }, [clearAuth, refreshToken]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!authState.expiresAt || !authState.accessToken) return;

    const timeUntilExpiry = authState.expiresAt - Date.now();
    const refreshTime = timeUntilExpiry - TOKEN_REFRESH_THRESHOLD;

    if (refreshTime <= 0) {
      refreshToken();
      return;
    }

    const timeout = setTimeout(() => {
      refreshToken();
    }, refreshTime);

    return () => clearTimeout(timeout);
  }, [authState.expiresAt, authState.accessToken, refreshToken]);

  // Login
  const login = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      const expiresAt = Date.now() + data.expiresIn * 1000;
      const newState: AuthState = {
        user: data.user,
        accessToken: data.accessToken,
        expiresAt,
      };

      setAuthState(newState);
      persistAuth(newState);

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      return { success: false, error: message };
    }
  }, [persistAuth]);

  // Register
  const register = useCallback(async (
    data: RegisterData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || "Registration failed" };
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      return { success: false, error: message };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore logout errors
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  // Forgot Password
  const forgotPassword = useCallback(async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Failed to send reset email" };
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      return { success: false, error: message };
    }
  }, []);

  // Reset Password
  const resetPassword = useCallback(async (
    token: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Failed to reset password" };
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      return { success: false, error: message };
    }
  }, []);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    if (!authState.accessToken) return;

    try {
      const response = await fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${authState.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState((prev) => ({
          ...prev,
          user: data.user,
        }));
        
        // Also update localStorage
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(AUTH_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.user = data.user;
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
          }
        }
      }
    } catch {
      // Ignore refresh errors
    }
  }, [authState.accessToken]);

  // Update user profile
  const updateProfile = useCallback(async (
    data: Partial<User>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!authState.accessToken) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || "Failed to update profile" };
      }

      // Update local state with new user data
      if (result.user) {
        setAuthState((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, ...result.user } : null,
        }));
        
        // Also update localStorage
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(AUTH_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.user = { ...parsed.user, ...result.user };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
          }
        }
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      return { success: false, error: message };
    }
  }, [authState.accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: !!authState.user,
        isGuest,
        isLoading,
        accessToken: authState.accessToken,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        refreshToken,
        refreshUser,
        updateProfile,
        continueAsGuest,
        exitGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ============================================
// UTILITY: Authenticated Fetch
// ============================================

export function useAuthenticatedFetch() {
  const { accessToken, refreshToken, logout } = useAuth();

  return useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const headers = new Headers(options.headers);
      
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      let response = await fetch(url, { ...options, headers });

      // If unauthorized, try to refresh and retry
      if (response.status === 401 && accessToken) {
        const refreshed = await refreshToken();
        if (refreshed) {
          headers.set("Authorization", `Bearer ${accessToken}`);
          response = await fetch(url, { ...options, headers });
        } else {
          await logout();
        }
      }

      return response;
    },
    [accessToken, refreshToken, logout]
  );
}
