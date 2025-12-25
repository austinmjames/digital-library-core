"use client";

import { X, MessageSquare, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface CommentaryHeaderProps {
  verseRef: string;
  languageMode: "en" | "he" | "bilingual";
  setLanguageMode: (mode: "en" | "he" | "bilingual") => void;
  showFootnotes: boolean;
  setShowFootnotes: (show: boolean) => void;
  onClose: () => void;
}

/**
 * components/reader/commentary/CommentaryHeader.tsx
 * Adheres to the unified style guide: Segoe/Inter typography and imprinted buttons.
 */
export function CommentaryHeader({
  verseRef,
  languageMode,
  setLanguageMode,
  showFootnotes,
  setShowFootnotes,
  onClose,
}: CommentaryHeaderProps) {
  return (
    <div className="flex flex-col bg-paper/95 backdrop-blur border-b border-pencil/10 shrink-0 z-30">
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex flex-col text-left">
          <h3 className="text-xl text-ink leading-none">Commentary</h3>
          <p className="text-[10px] text-accent-foreground font-black uppercase tracking-[0.25em] mt-2 bg-accent/20 px-2.5 py-1 rounded-full w-fit imprint-sm">
            {verseRef}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Footnotes - Imprinted Style */}
          <button
            onClick={() => setShowFootnotes(!showFootnotes)}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95",
              showFootnotes
                ? "bg-accent text-accent-foreground shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.1)] border border-accent/20"
                : "bg-slate-100 text-pencil hover:bg-slate-200 imprint-sm"
            )}
            title="Toggle Footnotes"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Language Selector - Imprinted Style */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-[10px] font-black text-pencil uppercase flex items-center gap-2 outline-none imprint-sm active:scale-95">
                {languageMode}
                <ChevronDown className="w-3 h-3 opacity-40" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-36 rounded-2xl p-1.5 shadow-2xl border-pencil/10 bg-paper/95 backdrop-blur-xl"
            >
              {(["en", "he", "bilingual"] as const).map((m) => (
                <DropdownMenuItem
                  key={m}
                  onClick={() => setLanguageMode(m)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2.5 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors",
                    languageMode === m
                      ? "bg-accent/10 text-ink"
                      : "text-pencil/60"
                  )}
                >
                  {m}
                  {languageMode === m && (
                    <Check className="w-3 h-3 text-accent-foreground" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-4 bg-pencil/10 mx-1" />

          {/* Close Sidebar */}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-pencil/10 transition-all active:scale-75 group"
          >
            <X className="w-5 h-5 text-pencil group-hover:text-ink" />
          </button>
        </div>
      </div>
    </div>
  );
}
