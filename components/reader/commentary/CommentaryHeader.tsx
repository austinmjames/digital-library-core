"use client";

import React from "react";
import { MessageSquare, Languages } from "lucide-react";

interface CommentaryHeaderProps {
  title: string;
  languageMode: "en" | "he" | "bilingual";
  setLanguageMode: (mode: "en" | "he" | "bilingual") => void;
  // Options for potential extensions, though panel handles the conditional hide now
  showBack?: boolean;
  onBack?: () => void;
  showIcon?: boolean;
}

/**
 * components/reader/commentary/CommentaryHeader.tsx
 * Branded header for the main Commentary Sidebar browsing view.
 * Updated: Focused metrics and styling to match the established iOS design tokens.
 */
export function CommentaryHeader({
  title,
  languageMode,
  setLanguageMode,
  showIcon = true,
}: CommentaryHeaderProps) {
  return (
    <div className="flex flex-col bg-paper/95 backdrop-blur border-b border-pencil/10 shrink-0 z-30">
      <div className="flex items-center justify-between pl-6 pr-20 md:pr-6 py-5 h-20">
        <div className="flex items-center gap-4 text-left overflow-hidden">
          {showIcon && (
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
          )}
          <h3 className="text-xl text-ink font-sans font-bold tracking-tight truncate">
            {title}
          </h3>
        </div>

        {/* Tactile 3-Way Toggle */}
        <div className="flex bg-slate-200/40 p-1 rounded-2xl shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.08)] border border-black/[0.02]">
          <button
            onClick={() => setLanguageMode("he")}
            className={`px-3 py-1.5 rounded-xl transition-all duration-300 flex items-center justify-center min-w-[40px] ${
              languageMode === "he"
                ? "bg-white text-ink shadow-sm scale-[1.02]"
                : "text-pencil/30 hover:text-pencil"
            }`}
          >
            <span className="text-[15px] font-semibold leading-none pt-0.5">
              אב
            </span>
          </button>

          <button
            onClick={() => setLanguageMode("bilingual")}
            className={`px-4 py-1.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 min-w-[60px] ${
              languageMode === "bilingual"
                ? "bg-white text-ink shadow-sm scale-[1.02]"
                : "text-pencil/30 hover:text-pencil"
            }`}
          >
            <Languages className="w-4 h-4" />
          </button>

          <button
            onClick={() => setLanguageMode("en")}
            className={`px-3 py-1.5 rounded-xl transition-all duration-300 flex items-center justify-center min-w-[40px] ${
              languageMode === "en"
                ? "bg-white text-ink shadow-sm scale-[1.02]"
                : "text-pencil/60 hover:text-pencil"
            }`}
          >
            <span className="text-[12px] font-semibold leading-none">Aa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
