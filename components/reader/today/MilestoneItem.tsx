"use client";

import React from "react";
import {
  Loader2,
  ExternalLink,
  CheckCircle2,
  Circle,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScheduleItem } from "@/lib/types/library";

interface MilestoneItemProps {
  item: ScheduleItem;
  scheduleType: "calendar" | "sequence";
  isProcessing: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onNavigate: (ref: string) => void;
  onRemove: (e: React.MouseEvent) => void;
}

/**
 * MilestoneItem
 * Segmented component representing a single study milestone.
 */
export function MilestoneItem({
  item,
  scheduleType,
  isProcessing,
  onToggle,
  onNavigate,
  onRemove,
}: MilestoneItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-xl border transition-all group/item",
        item.is_completed
          ? "bg-emerald-50/50 border-emerald-100/50"
          : "bg-pencil/5 border-transparent hover:border-gold/20 hover:bg-white"
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          onClick={onToggle}
          className={cn(
            "p-1 rounded-md transition-colors",
            item.is_completed
              ? "text-emerald-600"
              : "text-pencil/20 hover:text-gold"
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : item.is_completed ? (
            <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </button>
        <span
          className={cn(
            "text-xs font-serif font-bold truncate transition-colors",
            item.is_completed ? "text-emerald-900/50 line-through" : "text-ink"
          )}
        >
          {scheduleType === "sequence" && (
            <span className="text-[10px] font-mono text-pencil/40 mr-2">
              {item.day_number}
            </span>
          )}
          {item.marker?.label || "Unknown Reference"}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
        <button
          onClick={() => item.marker?.label && onNavigate(item.marker.label)}
          className="p-1.5 text-gold hover:bg-gold/10 rounded-lg"
          title="Read Now"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 text-pencil/40 hover:text-red-500 hover:bg-red-50 rounded-lg"
          title="Remove Milestone"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
