"use client";

import { useScholarStats } from "@/lib/hooks/useScholarStats";
import { cn } from "@/lib/utils/utils";
import {
  Award,
  BookOpen,
  Crown,
  Loader2,
  Medal,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import React from "react";

/**
 * TrophyCaseWidget (v3.0 - Resizable Logic)
 * Filepath: components/dashboard/widgets/TrophyCaseWidget.tsx
 * Role: Showcases scholarly achievements based on layout dimensions.
 * Updates:
 * - Replaced legacy 'WidgetSize' with numeric 'width' and 'height' units.
 * - Implemented area-based density logic (Limit = w * h * 2).
 * - Fixed TypeScript 'any' indexing error.
 */

interface Badge {
  id: string;
  name: string;
  requirement: string;
  icon: React.ElementType;
  color: string;
  isUnlocked: boolean;
}

interface TrophyCaseWidgetProps {
  width?: number;
  height?: number;
}

export const TrophyCaseWidget = ({
  width = 2,
  height = 2,
}: TrophyCaseWidgetProps) => {
  const { data: stats, isLoading } = useScholarStats();

  if (isLoading) {
    return (
      <div className="bg-white border border-zinc-100 p-8 rounded-[3rem] shadow-sm h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-200" size={32} />
      </div>
    );
  }

  // Achievement Registry
  const allBadges: Badge[] = [
    {
      id: "spark",
      name: "Spark of Logic",
      requirement: "First note",
      icon: Zap,
      color: "text-amber-500 bg-amber-50",
      isUnlocked: (stats?.total_notes || 0) > 0,
    },
    {
      id: "streak",
      name: "Devoted Mind",
      requirement: "7 day streak",
      icon: Star,
      color: "text-blue-500 bg-blue-50",
      isUnlocked: (stats?.current_streak || 0) >= 7,
    },
    {
      id: "shelf",
      name: "Library Architect",
      requirement: "5 books",
      icon: BookOpen,
      color: "text-emerald-500 bg-emerald-50",
      isUnlocked: (stats?.shelf_count || 0) >= 5,
    },
    {
      id: "pro",
      name: "Chaver Status",
      requirement: "Pro tier",
      icon: Crown,
      color: "text-purple-500 bg-purple-50",
      isUnlocked: stats?.tier === "pro",
    },
    {
      id: "deep",
      name: "Deep Ingester",
      requirement: "100 verses read",
      icon: Sparkles,
      color: "text-rose-500 bg-rose-50",
      isUnlocked: (stats?.current_xp || 0) > 500,
    },
    {
      id: "guard",
      name: "Logic Guardian",
      requirement: "10 community replies",
      icon: Shield,
      color: "text-indigo-500 bg-indigo-50",
      isUnlocked: false,
    },
    {
      id: "master",
      name: "Canon Master",
      requirement: "Level 10 reached",
      icon: Medal,
      color: "text-orange-500 bg-orange-50",
      isUnlocked: (stats?.current_level || 0) >= 10,
    },
    {
      id: "scribe",
      name: "Great Scribe",
      requirement: "50 notebooks",
      icon: Award,
      color: "text-cyan-500 bg-cyan-50",
      isUnlocked: false,
    },
  ];

  /**
   * Density Calculation:
   * We calculate the visible limit based on the grid units allocated to the widget.
   * A 1x1 shows 1 badge. A 2x2 shows 4. A 5x2 shows 8.
   */
  const area = width * height;
  const limit = Math.min(allBadges.length, Math.max(1, area));
  const badges = allBadges.slice(0, limit);

  return (
    <div className="bg-white border border-zinc-100 p-8 rounded-[3rem] shadow-sm h-full w-full flex flex-col group overflow-hidden relative">
      <div className="flex justify-between items-start mb-8 relative z-10 shrink-0">
        <div className="space-y-1">
          <h3 className="text-xl font-black tracking-tight uppercase italic">
            Trophy Case
          </h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Trophy size={12} className="text-amber-500" /> Earned Honors
          </p>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-3 flex-grow relative z-10 min-h-0 overflow-y-auto custom-scrollbar pb-2",
          width === 1 ? "grid-cols-1" : "grid-cols-2"
        )}
      >
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={cn(
              "p-4 rounded-2xl border transition-all duration-500 flex flex-col items-center text-center justify-center gap-2 h-fit",
              badge.isUnlocked
                ? "bg-zinc-50 border-zinc-200 shadow-sm"
                : "bg-white border-zinc-50 opacity-20 grayscale"
            )}
          >
            <div
              className={cn(
                "p-2.5 rounded-xl",
                badge.isUnlocked ? badge.color : "bg-zinc-100 text-zinc-300"
              )}
            >
              <badge.icon size={18} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-tight text-zinc-900 leading-none truncate w-full">
                {badge.name}
              </p>
              <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-tighter">
                {badge.requirement}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer visibility gated by height units */}
      {height > 1 && (
        <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between shrink-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 italic">
            {allBadges.filter((b) => b.isUnlocked).length} Unlocked
          </span>
          <button className="text-[9px] font-black text-blue-600 hover:text-blue-900 uppercase tracking-widest transition-colors">
            View All
          </button>
        </div>
      )}
    </div>
  );
};
