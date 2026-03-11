"use client";

import { useState, useRef, useEffect } from "react";
import { chat, ChatResponse } from "@/lib/api";
import { Send, Bot, User, RefreshCw } from "lucide-react";
import MarkdownContent from "@/components/MarkdownContent";
import clsx from "clsx";

interface Message {
  role: "user" | "assistant";
  content: string;
  intent?: string;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="w-2 h-2 bg-slate-400 rounded-full dot1"></span>
      <span className="w-2 h-2 bg-slate-400 rounded-full dot2"></span>
      <span className="w-2 h-2 bg-slate-400 rounded-full dot3"></span>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm CuraSense AI. Ask me anything about medicines, symptoms, drug interactions, or health topics. I'll do my best to help — though I always recommend consulting a doctor for personal medical advice.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res: ChatResponse = await chat(text, sessionId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.response, intent: res.intent },
      ]);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([
      {
        role: "assistant",
        content: "Session reset. How can I help you?",
      },
    ]);
    setInput("");
    setError(null);
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-800">AI Chat</h1>
          <p className="text-xs text-slate-400">Session: {sessionId.slice(-8)}</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"
        >
          <RefreshCw size={12} /> New chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx("flex items-start gap-3 fade-in-up", msg.role === "user" ? "flex-row-reverse" : "")}
          >
            {/* Avatar */}
            <div
              className={clsx(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                msg.role === "assistant" ? "bg-blue-100" : "bg-slate-200"
              )}
            >
              {msg.role === "assistant" ? (
                <Bot size={15} className="text-blue-600" />
              ) : (
                <User size={15} className="text-slate-500" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={clsx(
                "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "assistant"
                  ? "bg-white border border-slate-200 text-slate-700 shadow-sm"
                  : "bg-blue-600 text-white"
              )}
            >
              {msg.role === "assistant" ? (
                <MarkdownContent content={msg.content} />
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.intent && (
                <span className="mt-1.5 inline-block text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full">
                  intent: {msg.intent}
                </span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3 fade-in-up">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot size={15} className="text-blue-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask about a medicine, symptom, or interaction..."
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Press Enter to send · Not a substitute for professional medical advice
        </p>
      </div>
    </div>
  );
}
