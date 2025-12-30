"use client";

import {
  useAIExplanation,
  useAISuggestions,
} from "@/lib/hooks/useAISuggestions";
import { cn } from "@/lib/utils/utils";
import {
  BookOpen,
  BrainCircuit,
  ExternalLink,
  Loader2,
  Lock,
  Search,
  Send,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";

/**
 * AISidebar Component (v5.1 - Type Safe & Clean)
 * Filepath: components/reader/AISidebar.tsx
 * Role: Advanced conceptual discovery and AI-driven synthesis.
 * Alignment: PRD Section 4.2 (Semantic Discovery) & Tiered Access.
 */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface SemanticMatch {
  id: string;
  ref: string;
  similarity: number;
  hebrew_text: string;
  english_text: string;
}

interface AISidebarProps {
  activeRef: string;
  activeText: string;
  onClose: () => void;
  onJump: (ref: string) => void;
  userTier?: "free" | "pro";
  className?: string;
}

// --- Specialized Components ---

const LockedState = memo(() => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-6 animate-in fade-in duration-500">
    <div className="relative">
      <div className="absolute inset-0 bg-orange-100 rounded-full blur-xl opacity-50 animate-pulse" />
      <div className="relative w-16 h-16 bg-white border border-zinc-100 rounded-2xl flex items-center justify-center shadow-lg">
        <Lock size={24} className="text-orange-500" />
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">
        Chaver Tier Feature
      </h3>
      <p className="text-xs text-zinc-400 leading-relaxed max-w-[240px] mx-auto">
        AI-powered semantic threads and lateral conceptual discovery require a{" "}
        <strong>Chaver Subscription</strong>.
      </p>
    </div>
    <button
      onClick={() => (window.location.href = "/settings")}
      className="flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-zinc-800 transition-all shadow-lg"
    >
      <Zap size={12} className="fill-white" />
      Upgrade Your Seat
    </button>
  </div>
));
LockedState.displayName = "LockedState";

const ThreadCard = memo(
  ({
    match,
    sourceText,
    onJump,
  }: {
    match: SemanticMatch;
    sourceText: string;
    onJump: (ref: string) => void;
  }) => {
    const [showExplanation, setShowExplanation] = useState(false);
    const { data: explanation, isLoading } = useAIExplanation(
      sourceText,
      match.english_text
    );

    return (
      <div className="p-5 bg-white border border-zinc-100 rounded-3xl hover:border-orange-200 transition-all group shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-zinc-400" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {match.ref}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 text-orange-700 rounded-lg text-[9px] font-bold">
            {Math.round(match.similarity * 100)}% Conceptual Fit
          </div>
        </div>

        <p
          className="font-hebrew text-right text-lg leading-relaxed mb-4 text-zinc-900"
          dir="rtl"
        >
          {match.hebrew_text}
        </p>

        <div className="space-y-4">
          {showExplanation ? (
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-[9px] font-bold text-orange-600 uppercase mb-2">
                <BrainCircuit size={10} /> AI Synthesis
              </div>
              {isLoading ? (
                <Loader2 size={12} className="animate-spin text-zinc-300" />
              ) : (
                <p className="text-[11px] text-zinc-600 leading-relaxed font-medium italic">
                  {explanation}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowExplanation(true)}
              className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 uppercase hover:text-zinc-900 transition-colors"
            >
              <Sparkles size={12} className="text-orange-500" />
              Explain Connection
            </button>
          )}

          <button
            onClick={() => onJump(match.ref)}
            className="w-full py-3 bg-zinc-900 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            Open in Library <ExternalLink size={12} />
          </button>
        </div>
      </div>
    );
  }
);
ThreadCard.displayName = "ThreadCard";

export default function AISidebar({
  activeRef,
  activeText,
  onClose,
  onJump,
  userTier = "free",
  className,
}: AISidebarProps) {
  const [mode, setMode] = useState<"discovery" | "chat">("discovery");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: suggestions, isLoading: suggestionsLoading } = useAISuggestions(
    activeText,
    activeRef
  );

  const isLocked = userTier === "free";

  const globalSearchUrl = useMemo(
    () =>
      `/library/semantic-search?q=${encodeURIComponent(
        activeText.substring(0, 50)
      )}`,
    [activeText]
  );

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, mode]);

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-l border-zinc-200 w-80 md:w-96 shadow-2xl relative z-50",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-zinc-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-xl">
              <Sparkles className="text-orange-600" size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">
                Drash AI
              </h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                Context: {activeRef}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        {!isLocked && (
          <div className="flex bg-zinc-100 p-1 rounded-xl">
            <button
              onClick={() => setMode("discovery")}
              className={cn(
                "flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                mode === "discovery"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Discovery
            </button>
            <button
              onClick={() => setMode("chat")}
              className={cn(
                "flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                mode === "chat"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Synthesis Chat
            </button>
          </div>
        )}
      </div>

      {/* Main Panel Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-200"
      >
        {isLocked ? (
          <LockedState />
        ) : mode === "discovery" ? (
          <div className="space-y-6">
            {suggestionsLoading ? (
              <div className="py-20 flex flex-col items-center gap-4 text-zinc-400">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-center">
                  Scanning three millennia <br /> of conceptual links...
                </p>
              </div>
            ) : suggestions && suggestions.length > 0 ? (
              <>
                <div className="space-y-4">
                  {(suggestions as SemanticMatch[]).map((match) => (
                    <ThreadCard
                      key={match.id}
                      match={match}
                      sourceText={activeText}
                      onJump={onJump}
                    />
                  ))}
                </div>
                <button
                  onClick={() => (window.location.href = globalSearchUrl)}
                  className="w-full py-8 px-4 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center gap-2 group hover:bg-white hover:border-orange-200 transition-all"
                >
                  <Search
                    size={16}
                    className="text-zinc-300 group-hover:text-orange-500"
                  />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900">
                    View Global Concept Matches
                  </span>
                </button>
              </>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-3xl opacity-50">
                <p className="text-xs text-zinc-400 italic font-medium leading-relaxed">
                  No strong semantic threads found for this specific passage.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col",
                  msg.role === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed",
                    msg.role === "user"
                      ? "bg-zinc-900 text-white rounded-tr-none"
                      : "bg-zinc-100 text-zinc-900 rounded-tl-none"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Synthesis Input (Chat Mode) */}
      {!isLocked && mode === "chat" && (
        <div className="p-6 border-t border-zinc-100 bg-zinc-50/30">
          <form onSubmit={handleChat} className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Deep dive into this concept..."
              className="w-full pl-4 pr-12 py-4 bg-white border border-zinc-200 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all shadow-md"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

AISidebar.displayName = "AISidebar";
