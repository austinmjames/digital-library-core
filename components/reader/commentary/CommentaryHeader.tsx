"use client";

import { X, MessageSquare, ChevronDown, Check, Settings } from "lucide-react";
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
  activeTab: CommentaryTab;
  setActiveTab: (tab: CommentaryTab) => void;
  languageMode: "en" | "he" | "bilingual";
  setLanguageMode: (mode: "en" | "he" | "bilingual") => void;
  showFootnotes: boolean;
  setShowFootnotes: (show: boolean) => void;
  onClose: () => void;
  hasUser: boolean;
}

export function CommentaryHeader({
  verseRef,
  activeTab,
  setActiveTab,
  languageMode,
  setLanguageMode,
  showFootnotes,
  setShowFootnotes,
  onClose,
  hasUser,
}: CommentaryHeaderProps) {
  return (
    <div className="flex flex-col bg-paper/95 backdrop-blur border-b border-pencil/10 shrink-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-col text-left">
          <h3 className="font-serif font-bold text-xl text-ink">Commentary</h3>
          <p className="text-xs text-pencil font-mono mt-0.5">{verseRef}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFootnotes(!showFootnotes)}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
              showFootnotes ? "bg-gold text-white" : "bg-pencil/5 text-pencil"
            )}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-3 py-1.5 rounded-full bg-pencil/5 text-xs font-bold text-pencil uppercase flex items-center gap-1.5">
                {languageMode === "bilingual"
                  ? "Bi"
                  : languageMode === "en"
                  ? "En"
                  : "He"}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["en", "he", "bilingual"] as const).map((m) => (
                <DropdownMenuItem
                  key={m}
                  onClick={() => setLanguageMode(m)}
                  className="text-xs font-medium cursor-pointer uppercase"
                >
                  {m}{" "}
                  {languageMode === m && <Check className="w-3 h-3 ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-pencil/10 transition-colors"
          >
            <X className="w-5 h-5 text-pencil" />
          </button>
        </div>
      </div>
      <div className="flex px-6 pb-0 gap-6">
        {(["MY_COMMENTARIES", "MARKETPLACE", "DISCUSSION"] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-sm font-bold border-b-2 transition-all",
                activeTab === tab
                  ? "text-ink border-gold"
                  : "text-pencil border-transparent hover:text-ink/70"
              )}
            >
              {tab === "MY_COMMENTARIES"
                ? "Library"
                : tab === "DISCUSSION"
                ? "Groups"
                : "Explore"}
            </button>
          )
        )}
        {hasUser && (
          <button
            onClick={() => setActiveTab("MANAGE_BOOKS")}
            className={cn(
              "pb-3 text-sm font-bold border-b-2 transition-all ml-auto",
              activeTab === "MANAGE_BOOKS"
                ? "text-ink border-gold"
                : "text-pencil border-transparent"
            )}
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
