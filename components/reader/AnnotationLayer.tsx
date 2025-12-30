"use client";

import { cn } from "@/lib/utils/utils";
import {
  BookMarked,
  ChevronRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import React, { useMemo } from "react";

/**
 * AnnotationLayer Component (v1.0 - Implementation)
 * Filepath: components/reader/AnnotationLayer.tsx
 * Role: Visual summary and navigation layer for notes, community insights, and AI markers.
 * Alignment: PRD Section 2.3 (Knowledge Management).
 * Fixes: Resolves 'unused' errors by implementing the UI logic for markers and interactions.
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
  // 1. Prioritization Logic: Use 'markers' to create a sorted display view
  const displayMarkers = useMemo(() => {
    return [...markers].sort((a, b) => {
      // Always prioritize the currently active reference
      if (a.ref === activeRef) return -1;
      if (b.ref === activeRef) return 1;
      // Secondary sort by contribution density
      return b.note_count - a.note_count;
    });
  }, [markers, activeRef]);

  if (displayMarkers.length === 0) {
    return (
      <div
        className={cn(
          "p-10 text-center border-2 border-dashed border-zinc-100 rounded-[2rem] opacity-50",
          className
        )}
      >
        <p className="text-xs text-zinc-400 italic">
          No scholarship or notes linked to this section.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Header Context */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <BookMarked size={12} className="text-orange-500" />
          Anchored Discovery
        </h3>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-50 rounded text-[9px] font-bold text-zinc-500 uppercase">
          {markers.length} Points
        </div>
      </div>

      {/* Interactive Marker List */}
      <div className="space-y-2.5">
        {displayMarkers.map((marker) => {
          const isActive = marker.ref === activeRef;

          return (
            <button
              key={marker.id}
              onClick={() => onMarkerClick(marker.ref)} // Resolved: Handled marker selection
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group text-left",
                isActive
                  ? "bg-orange-50 border-orange-200 shadow-md ring-1 ring-orange-100/50"
                  : "bg-white border-zinc-100 hover:border-zinc-300 hover:shadow-sm"
              )}
            >
              {/* Type-Specific Iconography */}
              <div
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-orange-500 text-white scale-110 shadow-lg"
                    : "bg-zinc-50 text-zinc-400 group-hover:bg-white group-hover:text-zinc-600"
                )}
              >
                {marker.type === "ai" ? (
                  <Sparkles size={16} />
                ) : marker.type === "personal" ? (
                  <BookMarked size={16} />
                ) : (
                  <MessageSquare
                    size={16}
                    fill={
                      marker.note_count > 0 && !isActive
                        ? "currentColor"
                        : "none"
                    }
                    className={isActive ? "fill-white" : ""}
                  />
                )}
              </div>

              {/* Data Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4
                    className={cn(
                      "text-xs font-bold truncate tracking-tight",
                      isActive ? "text-orange-900" : "text-zinc-900"
                    )}
                  >
                    {marker.ref}
                  </h4>
                  {isActive && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                  )}
                </div>

                <p
                  className={cn(
                    "text-[10px] font-medium",
                    isActive ? "text-orange-700/60" : "text-zinc-500"
                  )}
                >
                  {marker.type === "ai"
                    ? "AI Synthesis Anchor"
                    : marker.type === "personal"
                    ? "Your Reflection"
                    : "Community Debate"}
                  {marker.note_count > 0 && ` • ${marker.note_count} entry`}
                </p>
              </div>

              {/* Visual Interaction Clue */}
              <ChevronRight
                size={14}
                className={cn(
                  "transition-all duration-300",
                  isActive
                    ? "text-orange-400 translate-x-1"
                    : "text-zinc-200 group-hover:text-zinc-900 group-hover:translate-x-0.5"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Interactive Legend */}
      <div className="pt-4 mt-2 border-t border-zinc-100 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5 opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest font-sans">
            Active
          </span>
        </div>
        <div className="flex items-center gap-1.5 opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest font-sans">
            Passive
          </span>
        </div>
      </div>
    </div>
  );
};
