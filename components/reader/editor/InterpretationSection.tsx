"use client";

import { Type, Info, Lock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterpretationSectionProps {
  content: string;
  setContent: (val: string) => void;
  hasPermission: boolean;
  isChecking: boolean;
  errorMessage: string | null;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function InterpretationSection({
  content,
  setContent,
  hasPermission,
  isChecking,
  errorMessage,
  textareaRef,
}: InterpretationSectionProps) {
  return (
    <section className="space-y-4 pb-20">
      <div className="flex items-center justify-between px-2">
        <label className="text-[11px] font-black text-gold uppercase tracking-[0.3em] flex items-center gap-2">
          <Type className="w-4 h-4" /> Your Interpretation
        </label>
        <div className="h-px bg-gold/10 flex-1 ml-4 mr-4" />
        <span className="text-[10px] text-gold/40 font-bold uppercase tracking-widest">
          {hasPermission ? "Live Drafting" : "View Mode"}
        </span>
      </div>

      <div className="relative group">
        <textarea
          ref={textareaRef}
          value={content}
          readOnly={!hasPermission || isChecking}
          onChange={(e) => setContent(e.target.value)}
          className={cn(
            "w-full min-h-[320px] p-8 rounded-[2.5rem] bg-white border-2 outline-none transition-all font-serif text-2xl md:text-3xl leading-relaxed resize-none shadow-xl shadow-black/[0.02] placeholder:text-pencil/20",
            hasPermission
              ? "border-pencil/5 focus:border-gold/30 focus:ring-[12px] focus:ring-gold/5 group-hover:border-pencil/10"
              : "border-transparent bg-pencil/[0.01] cursor-not-allowed italic text-ink/60"
          )}
          placeholder={
            hasPermission
              ? "Listen to the text... capture its depth here."
              : "This layer is read-only."
          }
        />

        {hasPermission && (
          <div className="absolute bottom-6 left-8 flex items-center gap-2 opacity-30 group-focus-within:opacity-100 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-pencil uppercase">
              {content.length} characters
            </span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs font-bold uppercase tracking-wide">
            {errorMessage}
          </p>
        </div>
      )}

      {!hasPermission && !isChecking && (
        <div className="flex items-center gap-4 p-5 bg-pencil/5 rounded-[1.8rem] border border-pencil/10">
          <Lock className="w-4 h-4 text-pencil shrink-0" />
          <p className="text-[11px] text-pencil/70 leading-relaxed font-medium italic">
            You are viewing this Sovereignty layer as a witness. Invitations are
            managed by the project owner.
          </p>
        </div>
      )}

      {hasPermission && (
        <div className="flex items-center gap-4 p-5 bg-indigo-50/40 rounded-[1.8rem] border border-indigo-100/50">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <p className="text-[11px] text-indigo-900/50 leading-relaxed font-medium italic">
            Collaborative updates are synced to the community layer in
            real-time.
          </p>
        </div>
      )}
    </section>
  );
}
