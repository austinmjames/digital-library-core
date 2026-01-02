"use client";

import { cn } from "@/lib/utils/utils";
import { WidgetID } from "@/types/dashboard";
import {
  Calendar,
  Clock,
  Flame,
  Plus,
  Share2,
  Target,
  Trophy,
  X,
} from "lucide-react";
import React from "react";

/**
 * WidgetSelector Component (v2.0 - Synchronized Registry)
 * Filepath: components/dashboard/WidgetSelector.tsx
 * Role: Registry for modular dashboard units.
 * Fix: Updated names and icons to match implemented component headers exactly.
 */

interface WidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (id: WidgetID) => void;
  activeWidgetIds: WidgetID[];
}

interface WidgetRegistryItem {
  id: WidgetID;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

// Unified Registry: This is the Source of Truth for the Selector.
// Names match component headers (e.g., 'Torah Time', 'Communal Pulse').
const REGISTRY: WidgetRegistryItem[] = [
  {
    id: "daily_portions",
    name: "Daily Portions",
    description: "Temporal study tracks and obligations.",
    icon: Target,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    id: "zmanim",
    name: "Torah Time",
    description: "Solar and liturgical precision (Sunrise/Shabbat).",
    icon: Clock,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    id: "calendar",
    name: "Calendar",
    description: "Traditional date engine and holiday tracking.",
    icon: Calendar,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    id: "stats_xp",
    name: "Scholar Stats",
    description: "Gamified XP and level progression metrics.",
    icon: Flame,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    id: "community_feed",
    name: "Communal Pulse",
    description: "Real-time insights from the scholarly guild.",
    icon: Share2,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    id: "trophy_case",
    name: "Trophy Case",
    description: "Showcase your earned scholarly honors.",
    icon: Trophy,
    color: "text-amber-400",
    bg: "bg-zinc-50",
  },
];

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({
  isOpen,
  onClose,
  onAdd,
  activeWidgetIds,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-6 sm:p-12">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl bg-white rounded-[4rem] shadow-2xl p-12 animate-in slide-in-from-bottom-20 duration-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-16 shrink-0 relative z-10">
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic text-zinc-900">
              The Fragment Registry
            </h2>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
              Assemble your modular Beit Midrash.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-5 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-all active:scale-90"
          >
            <X size={28} />
          </button>
        </div>

        {/* Scrollable Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto pr-4 custom-scrollbar relative z-10 pb-10">
          {REGISTRY.map((item) => {
            const isActive = activeWidgetIds.includes(item.id);
            return (
              <button
                key={item.id}
                disabled={isActive}
                onClick={() => onAdd(item.id)}
                className={cn(
                  "group text-left rounded-[3rem] border-2 transition-all flex flex-col h-[320px] overflow-hidden bg-white relative",
                  isActive
                    ? "opacity-30 grayscale cursor-not-allowed border-zinc-100"
                    : "border-zinc-50 hover:border-zinc-950 hover:shadow-3xl hover:-translate-y-1"
                )}
              >
                {/* Minimalist Preview Panel */}
                <div
                  className={cn(
                    "h-40 flex items-center justify-center relative overflow-hidden transition-colors",
                    item.bg
                  )}
                >
                  <item.icon
                    size={64}
                    className={cn(
                      "opacity-10 group-hover:scale-110 transition-transform duration-1000",
                      item.color
                    )}
                  />

                  {/* Abstract Content Placeholder */}
                  <div className="absolute bottom-6 px-10 w-full space-y-2 opacity-20">
                    <div className="h-1 w-2/3 bg-current rounded-full" />
                    <div className="h-1 w-full bg-current rounded-full" />
                  </div>
                </div>

                <div className="p-8 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="font-black text-2xl tracking-tighter uppercase text-zinc-900 leading-none">
                      {item.name}
                    </h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {!isActive ? (
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 group-hover:translate-x-1 transition-transform">
                      <Plus size={14} strokeWidth={3} /> Initialize Fragment
                    </div>
                  ) : (
                    <div className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">
                      Fragment Active
                    </div>
                  )}
                </div>

                {/* Visual Accent for Hover */}
                {!isActive && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-zinc-950 rounded-bl-[2rem] translate-x-12 -translate-y-12 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      </div>
    </div>
  );
};
