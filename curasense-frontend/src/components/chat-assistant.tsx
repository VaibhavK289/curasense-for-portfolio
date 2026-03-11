"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { sendChatMessage } from "@/lib/api";
import { springPresets, microInteractions } from "@/styles/tokens/animations";

export function ChatAssistant() {
  const {
    isChatOpen,
    toggleChat,
    chatHistory,
    addChatMessage,
    currentReport,
  } = useAppStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedMessageIndex, setFocusedMessageIndex] = useState<number | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isChatOpen]);

  // Keyboard shortcut to open/close chat (Ctrl/Cmd + /)
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      // Open/close chat with Ctrl+/ or Cmd+/
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleChat();
      }
      // Close with Escape when open
      if (e.key === 'Escape' && isChatOpen) {
        toggleChat();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isChatOpen, toggleChat]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    addChatMessage({ role: "user", content: userMessage });
    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        userMessage,
        currentReport?.content,
        chatHistory.map((m) => ({ role: m.role, content: m.content }))
      );
      addChatMessage({ role: "assistant", content: response.response });
    } catch {
      addChatMessage({
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please try again.",
      });
    } finally {
      setIsLoading(false);
      // Re-focus input after sending
      inputRef.current?.focus();
    }
  };

  // Keyboard navigation within chat
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const messages = chatHistory;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (focusedMessageIndex === null) {
          setFocusedMessageIndex(messages.length - 1);
        } else if (focusedMessageIndex > 0) {
          setFocusedMessageIndex(focusedMessageIndex - 1);
        }
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (focusedMessageIndex !== null) {
          if (focusedMessageIndex < messages.length - 1) {
            setFocusedMessageIndex(focusedMessageIndex + 1);
          } else {
            setFocusedMessageIndex(null);
            inputRef.current?.focus();
          }
        }
        break;
        
      case 'Home':
        e.preventDefault();
        if (messages.length > 0) {
          setFocusedMessageIndex(0);
        }
        break;
        
      case 'End':
        e.preventDefault();
        setFocusedMessageIndex(null);
        inputRef.current?.focus();
        break;
        
      case 'Tab':
        // Let default tab behavior work for accessibility
        break;
    }
  }, [chatHistory, focusedMessageIndex]);

  // Clear focus when clicking elsewhere
  const handleMessagesClick = () => {
    setFocusedMessageIndex(null);
  };

  return (
    <>
      {/* Toggle Button with keyboard hint */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        aria-label="Open chat assistant (Ctrl+/)"
        aria-expanded={isChatOpen}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 focus-ring",
          "bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white",
          "hover:shadow-xl hover:shadow-[hsl(var(--brand-primary)/0.3)]",
          isChatOpen && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--color-success))] opacity-75"></span>
          <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--color-success))] text-[10px] font-bold text-white">
            AI
          </span>
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={springPresets.smooth}
            role="dialog"
            aria-label="Chat with CuraSense AI"
            aria-modal="true"
            onKeyDown={handleKeyDown}
            className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.98)] shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">CuraSense AI</h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/80">
                    <span className="flex h-2 w-2 rounded-full bg-[hsl(var(--color-success))] animate-pulse" />
                    Always here to help
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Keyboard shortcut hint */}
                <div className="hidden sm:flex items-center gap-1 text-xs text-white/60 bg-white/10 px-2 py-1 rounded-md">
                  <Keyboard className="h-3 w-3" />
                  <span>Esc to close</span>
                </div>
                <Button
                  ref={closeButtonRef}
                  variant="ghost"
                  size="icon"
                  onClick={toggleChat}
                  className="text-white hover:bg-white/20 focus-ring"
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div 
                className="space-y-4" 
                ref={messagesRef}
                onClick={handleMessagesClick}
                role="log"
                aria-label="Chat messages"
                aria-live="polite"
              >
                {/* Welcome Message */}
                {chatHistory.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-gradient-to-br from-[hsl(var(--brand-primary)/0.1)] to-[hsl(var(--brand-secondary)/0.1)] p-4"
                  >
                    <div className="flex items-center gap-2 text-[hsl(var(--brand-primary))]">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Welcome to CuraSense AI
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                      I can help you understand your medical reports, answer
                      questions about diagnoses, and provide information about
                      medications. How can I assist you today?
                    </p>
                    {/* Keyboard navigation hint */}
                    <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                      <Keyboard className="h-3 w-3" />
                      <span>Use ↑↓ arrows to navigate messages</span>
                    </div>
                  </motion.div>
                )}

                {/* Chat Messages */}
                {chatHistory.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className={cn(
                      "flex gap-3 outline-none",
                      message.role === "user" && "flex-row-reverse",
                      focusedMessageIndex === index && "ring-2 ring-[hsl(var(--brand-primary))] ring-offset-2 rounded-2xl"
                    )}
                    tabIndex={0}
                    role="article"
                    aria-label={`${message.role === "user" ? "You" : "AI"} said: ${message.content}`}
                    onFocus={() => setFocusedMessageIndex(index)}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        message.role === "user"
                          ? "bg-[hsl(var(--muted))]"
                          : "bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className={cn(
                        "max-w-[280px] rounded-2xl px-4 py-2.5 text-sm",
                        message.role === "user"
                          ? "bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white shape-soft"
                          : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] shape-asymmetric"
                      )}
                    >
                      {message.content}
                    </motion.div>
                  </motion.div>
                ))}

                {/* Loading */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                    aria-live="assertive"
                    aria-label="AI is thinking"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-[hsl(var(--muted))] px-4 py-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--brand-primary))]" />
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">Thinking...</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-[hsl(var(--border))] p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 focus-ring-primary"
                  disabled={isLoading}
                  aria-label="Type your message"
                />
                <motion.div
                  whileTap={microInteractions.buttonPress}
                >
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="shrink-0 shape-sharp focus-ring"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
              <p className="mt-2 text-center text-xs text-[hsl(var(--muted-foreground))]">
                Powered by Groq AI • Always consult a healthcare professional
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
