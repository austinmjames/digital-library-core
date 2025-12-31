"use client";

import { cn } from "@/lib/utils/utils";
import { Verse } from "@/types/reader";
import {
  BookOpen,
  ChevronDown,
  Copy,
  Database,
  ExternalLink,
  History,
  Info,
  Search,
  Share2,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

interface ResourceTabProps {
  activeVerse?: Verse; // Changed to optional to resolve 'missing in type {}' errors
}

/**
 * ResourceTab (v2.2)
 * Filepath: components/reader/ResourceTab.tsx
 * Role: Displays traditional commentaries (Rashi, etc.) and cross-references.
 * Fix: Resolved 'activeVerse.he' potentially undefined error using optional chaining.
 */

interface CommentaryItem {
  id: string;
  source: string;
  type: "SYSTEM" | "COMMUNITY";
  text: string;
  isExpanded: boolean;
}

export const ResourceTab = ({ activeVerse }: ResourceTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Using activeVerse to derive dynamic mocked commentary
  const sources = useMemo<CommentaryItem[]>(() => {
    if (!activeVerse) return [];

    // Safety check for Hebrew text before processing
    const firstWord = activeVerse.he?.split(" ")[0] || "בראשית";

    return [
      {
        id: `rashi_${activeVerse.ref}`,
        source: "RASHI",
        type: "SYSTEM",
        text: `ד״ה ${firstWord}: אמר רבי יצחק לא היה צריך להתחיל את התורה אלא מהחודש הזה לכם, שהיא מצוה ראשונה שנצטוו בה ישראל...`,
        isExpanded: true,
      },
      {
        id: `ramban_${activeVerse.ref}`,
        source: "RAMBAN",
        type: "SYSTEM",
        text: `בראשית ברא אלהים. כתב רש\"י אמר רבי יצחק לא היה צריך להתחיל את התורה אלא מהחודש הזה לכם...`,
        isExpanded: false,
      },
    ];
  }, [activeVerse]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(sources.filter((s) => s.isExpanded).map((s) => s.id))
  );

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  // Guard clause for missing active verse
  if (!activeVerse) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-4 opacity-50">
        <div className="p-4 bg-zinc-100 rounded-full">
          <Info size={24} className="text-zinc-400" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
          Select a segment to load sources
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
      {/* 1. Source Filter Bar */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-zinc-300 group-focus-within:text-zinc-950 transition-colors">
          <Search size={14} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Filter sources for ${activeVerse.ref}...`}
          className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs font-medium outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-300 transition-all placeholder:text-zinc-300"
        />
      </div>

      {/* 2. Source Count & Logic Check */}
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <Database size={12} className="text-amber-500" /> Sources for{" "}
          {activeVerse.ref}
        </h4>
        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
          {sources.length} Anchors
        </span>
      </div>

      {/* 3. Commentary Rail */}
      <div className="space-y-4">
        {sources.map((item) => {
          const isExpanded = expandedIds.has(item.id);
          return (
            <div
              key={item.id}
              className={cn(
                "bg-white border transition-all duration-500 rounded-[2rem] overflow-hidden group",
                isExpanded
                  ? "border-zinc-950 shadow-2xl scale-[1.02]"
                  : "border-zinc-100 hover:border-zinc-300 hover:shadow-lg"
              )}
            >
              {/* Source Header */}
              <div className="p-5 flex items-center justify-between bg-zinc-50/50 border-b border-zinc-50">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      isExpanded
                        ? "bg-zinc-950 text-white"
                        : "bg-white text-zinc-400"
                    )}
                  >
                    <BookOpen size={14} />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-zinc-900 uppercase tracking-tighter">
                      {item.source}
                    </h5>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                      {item.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-zinc-300 hover:text-zinc-950 transition-colors">
                    <Share2 size={14} />
                  </button>
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className={cn(
                      "p-2 text-zinc-300 hover:text-zinc-950 transition-all",
                      isExpanded && "rotate-180"
                    )}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>

              {/* Source Content */}
              <div
                className={cn(
                  "px-6 transition-all duration-500 overflow-hidden",
                  isExpanded
                    ? "py-8 opacity-100 max-h-[500px]"
                    : "py-0 opacity-0 max-h-0"
                )}
              >
                <p
                  className="font-serif-hebrew text-xl leading-[2.2] text-zinc-900 text-right selection:bg-amber-100"
                  dir="rtl"
                >
                  {item.text}
                </p>

                {/* Action Toolbar (PRD 2.3 - Forking) */}
                <div className="mt-8 pt-6 border-t border-zinc-50 flex items-center justify-between">
                  <button className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors group/btn">
                    <Copy
                      size={12}
                      className="group-hover/btn:scale-110 transition-transform"
                    />
                    Fork to Notes
                  </button>
                  <div className="flex gap-4">
                    <button className="text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-950 transition-colors">
                      Cite Ref
                    </button>
                    <button className="text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-950 transition-colors flex items-center gap-1">
                      Open <ExternalLink size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Cross-Reference Preview (PRD 3.2) */}
      <div className="pt-4 space-y-4">
        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
          <History size={12} className="text-blue-500" /> Semantic Links
        </h4>
        <div className="p-5 bg-zinc-950 text-white rounded-[2rem] shadow-xl relative overflow-hidden group cursor-pointer">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-amber-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                AI Discovery
              </span>
            </div>
            <p className="text-xs font-bold leading-relaxed group-hover:text-amber-100 transition-colors">
              Compare {activeVerse.ref} with Genesis 2:4 (The Generations of
              Heavens)
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 rounded-bl-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};
