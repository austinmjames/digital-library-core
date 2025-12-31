"use client";

import { cn } from "@/lib/utils/utils";
import {
  Activity,
  BookMarked,
  ChevronRight,
  Hash,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import React, { useMemo } from "react";

/**
 * AnnotationLayer Component (v2.0)
 * Filepath: components/reader/AnnotationLayer.tsx
 * Role: Visual "Radar" and navigation for scholarship density.
 * PRD Alignment: Section 2.3 (Knowledge Management) & 3.2 (Discovery).
 */

export interface AnnotationMarker {
  id: string;
  ref: string;
  note_count: number;
  type: "personal" | "community" | "ai";
}

interface AnnotationLayerProps {
  markers: AnnotationMarker[];
  activeRef: string;
  onMarkerClick: (ref: string) => void;
  className?: string;
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  markers,
  activeRef,
  onMarkerClick,
  className,
}) => {
  // 1. Prioritization Logic: Active Ref first, then intensity (note_count)
  const displayMarkers = useMemo(() => {
    return [...markers].sort((a, b) => {
      if (a.ref === activeRef) return -1;
      if (b.ref === activeRef) return 1;
      return b.note_count - a.note_count;
    });
  }, [markers, activeRef]);

  if (displayMarkers.length === 0) {
    return (
      <div
        className={cn(
          "p-12 text-center border-2 border-dashed border-zinc-100 rounded-[2.5rem] bg-zinc-50/30",
          className
        )}
      >
        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">
          No active anchors in this section
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* 1. Scholarly Header */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black text-zinc-950 uppercase tracking-[0.3em] flex items-center gap-2">
          <Activity size={14} className="text-amber-500" />
          Discovery Radar
        </h3>
        <div className="px-2 py-0.5 bg-zinc-950 text-white rounded text-[9px] font-black uppercase tracking-widest">
          {markers.length} Signals
        </div>
      </div>

      {/* 2. Marker Stack (DrashCard Token Implementation) */}
      <div className="space-y-3">
        {displayMarkers.map((marker) => {
          const isActive = marker.ref === activeRef;

          return (
            <button
              key={marker.id}
              onClick={() => onMarkerClick(marker.ref)}
              className={cn(
                "w-full flex items-center gap-5 p-5 rounded-[2rem] border transition-all duration-500 group text-left relative overflow-hidden",
                isActive
                  ? "bg-white border-zinc-950 shadow-2xl ring-8 ring-zinc-950/5 scale-[1.02] z-10"
                  : "bg-white border-zinc-100 hover:border-zinc-300 hover:shadow-lg"
              )}
            >
              {/* Type-Specific Identity */}
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0",
                  isActive
                    ? "bg-zinc-950 text-white shadow-xl"
                    : "bg-zinc-50 text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white"
                )}
              >
                {marker.type === "ai" ? (
                  <Sparkles
                    size={20}
                    className={isActive ? "text-amber-400" : ""}
                  />
                ) : marker.type === "personal" ? (
                  <BookMarked size={20} />
                ) : (
                  <MessageSquare size={20} />
                )}
              </div>

              {/* Discovery Metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Hash size={10} className="text-amber-500" />
                  <h4
                    className={cn(
                      "text-sm font-black uppercase tracking-tight truncate",
                      isActive ? "text-zinc-900" : "text-zinc-500"
                    )}
                  >
                    {marker.ref}
                  </h4>
                  {isActive && (
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </div>

                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    isActive ? "text-zinc-400" : "text-zinc-300"
                  )}
                >
                  {marker.type === "ai"
                    ? "Synthetic Logic"
                    : marker.type === "personal"
                    ? "Private Reflection"
                    : "Community Insight"}
                  {marker.note_count > 0 && ` • ${marker.note_count} Entries`}
                </p>
              </div>

              <ChevronRight
                size={18}
                className={cn(
                  "transition-all duration-500 shrink-0",
                  isActive
                    ? "text-zinc-950 translate-x-1"
                    : "text-zinc-200 group-hover:text-zinc-950 group-hover:translate-x-1"
                )}
              />

              {/* Passive Glow for Active Marker */}
              {isActive && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-[40px] -mr-8 -mt-8 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Global Status Legend */}
      <div className="pt-6 border-t border-zinc-100 flex items-center justify-center gap-8 opacity-40">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <span className="text-[8px] font-black text-zinc-900 uppercase tracking-[0.2em]">
            Live Anchor
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">
            Passive Segment
          </span>
        </div>
      </div>
    </div>
  );
};
