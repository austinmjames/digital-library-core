"use client";

import { X, MessageSquare, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export type CommentaryTab =
  | "MY_COMMENTARIES"
  | "MARKETPLACE"
  | "DISCUSSION"
  | "MANAGE_BOOKS";

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
 * Clean iOS-style header focused on display settings and verse metadata.
 * Navigation logic has been moved to CommentaryTabs for cleaner segmentation.
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
          <h3 className="font-serif font-bold text-xl text-ink tracking-tight">
            Commentary
          </h3>
          <p className="text-[10px] text-gold font-black uppercase tracking-[0.2em] mt-0.5">
            {verseRef}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Footnotes/Inline Notes */}
          <button
            onClick={() => setShowFootnotes(!showFootnotes)}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-75",
              showFootnotes
                ? "bg-gold text-white shadow-lg shadow-gold/20"
                : "bg-pencil/5 text-pencil hover:bg-pencil/10"
            )}
            title="Toggle Footnotes"
          >
            <MessageSquare className="w-4.5 h-4.5" />
          </button>

          {/* Language Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 px-3 rounded-full bg-pencil/5 hover:bg-pencil/10 transition-colors text-[10px] font-black text-pencil uppercase flex items-center gap-1.5 outline-none">
                {languageMode === "bilingual"
                  ? "Bilingual"
                  : languageMode === "en"
                  ? "English"
                  : "Hebrew"}
                <ChevronDown className="w-3 h-3 opacity-40" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-36 rounded-2xl p-1.5 shadow-xl border-pencil/10 bg-paper/95 backdrop-blur-xl"
            >
              {(["en", "he", "bilingual"] as const).map((m) => (
                <DropdownMenuItem
                  key={m}
                  onClick={() => setLanguageMode(m)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2.5 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors",
                    languageMode === m
                      ? "bg-pencil/10 text-ink"
                      : "text-pencil/60 hover:bg-pencil/5"
                  )}
                >
                  {m === "en" ? "English" : m === "he" ? "Hebrew" : "Bilingual"}
                  {languageMode === m && (
                    <Check className="w-3 h-3 text-gold" />
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
