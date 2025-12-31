"use client";

import { Verse } from "@/types/reader";
import { ChevronRight, Lock, Sparkles, Wand2 } from "lucide-react";

interface AITabProps {
  activeVerse: Verse;
  isPro: boolean;
}

/**
 * AITab (v1.1)
 * Role: Interface for AI Semantic Analysis and Logic Extraction.
 * PRD Alignment: Section 4.3 (AI Synthesis) & Section 5.0 (Pro Features).
 * Fixes: Resolved unused 'cn' and 'activeVerse' linting errors.
 */
export const AITab = ({ activeVerse, isPro }: AITabProps) => {
  if (!isPro) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center relative">
          <Sparkles size={32} className="text-amber-400" />
          <div className="absolute -top-2 -right-2 p-1.5 bg-zinc-950 text-white rounded-lg shadow-xl">
            <Lock size={12} />
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-lg font-black text-zinc-900 uppercase tracking-tight">
            Sage Insights
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
            AI Semantic Analysis for{" "}
            <span className="text-zinc-600 font-bold">{activeVerse.ref}</span>{" "}
            is reserved for <br />
            <span className="text-zinc-950 font-bold">Chaver Tier</span>{" "}
            scholars.
          </p>
        </div>
        <button className="w-full py-4 bg-zinc-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-zinc-800 active:scale-95 transition-all">
          Upgrade to Chaver
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
      {/* AI Analysis Status */}
      <div className="p-5 bg-amber-50/50 rounded-[2rem] border border-amber-100/50 flex items-start gap-4">
        <Wand2 size={20} className="text-amber-600 shrink-0 mt-1" />
        <p className="text-xs text-amber-900 leading-relaxed italic font-serif">
          &ldquo;Sage is currently analyzing the linguistic roots of{" "}
          <span className="font-bold">{activeVerse.ref}</span> against the 13
          Hermeneutic Principles.&rdquo;
        </p>
      </div>

      {/* Logic Extraction Result */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-1">
          Logic Extraction
        </h4>
        <div className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Active Themes
            </p>
            <div className="flex flex-wrap gap-2">
              {["Ontological Bounds", "Temporal Logic", "Divine Intent"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white border border-zinc-200 rounded-full text-[9px] font-black text-zinc-600 uppercase tracking-tighter"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <button className="w-full py-5 bg-zinc-950 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.25em] shadow-2xl flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-95">
        Generate Full Synthesis{" "}
        <ChevronRight size={14} className="text-amber-400" />
      </button>
    </div>
  );
};
