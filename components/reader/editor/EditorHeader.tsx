"use client";

import { X, Sparkles, Loader2, UserCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  verseRef: string;
  isChecking: boolean;
  hasPermission: boolean;
  role: string;
  onClose: () => void;
}

export function EditorHeader({
  verseRef,
  isChecking,
  hasPermission,
  role,
  onClose,
}: EditorHeaderProps) {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-pencil/5 bg-paper/80 backdrop-blur-md z-20 shrink-0">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center shadow-inner group">
          <Sparkles className="w-7 h-7 text-gold transition-transform group-hover:rotate-12 duration-500" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="font-serif font-bold text-2xl text-ink tracking-tight">
              Sovereignty Editor
            </h2>
            {!isChecking && (
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                  hasPermission
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-pencil/5 text-pencil/60 border-pencil/10"
                )}
              >
                {hasPermission ? (
                  <>
                    <UserCheck className="w-2.5 h-2.5" /> {role}
                  </>
                ) : (
                  <>
                    <Lock className="w-2.5 h-2.5" /> Read Only
                  </>
                )}
              </div>
            )}
            {isChecking && (
              <Loader2 className="w-3 h-3 animate-spin text-pencil/20" />
            )}
          </div>
          <span className="text-[10px] text-gold uppercase font-black tracking-[0.25em] bg-gold/5 px-3 py-1 rounded-full border border-gold/10">
            {verseRef}
          </span>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-4 rounded-full hover:bg-pencil/10 text-pencil transition-all active:scale-75 group"
      >
        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </header>
  );
}
