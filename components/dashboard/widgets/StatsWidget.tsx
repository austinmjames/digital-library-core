"use client";

import { useScholarStats } from "@/lib/hooks/useScholarStats";
import { Flame, Loader2, Target, Trophy, Zap } from "lucide-react";

/**
 * StatsWidget (v1.2 - Bug Fix)
 * Filepath: components/dashboard/widgets/StatsWidget.tsx
 * Role: Gamification tracker for Scholar XP and Levels.
 * Fix: Resolved ReferenceError for 'nextLevelLevelXPThreshold'.
 */

export const StatsWidget = () => {
  const { data: stats, isLoading } = useScholarStats();

  if (isLoading) {
    return (
      <div className="bg-zinc-50 p-8 rounded-[3rem] shadow-inner h-full border border-zinc-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-300" size={32} />
      </div>
    );
  }

  // Logic: Calculate XP progress towards next level
  // Formula based on generated column: floor(sqrt(current_xp / 100))
  const currentLevel = stats?.current_level || 0;
  const nextLevel = currentLevel + 1;
  const currentXP = stats?.current_xp || 0;
  const nextLevelXPThreshold = Math.pow(nextLevel, 2) * 100;
  const prevLevelXPThreshold = Math.pow(currentLevel, 2) * 100;

  const xpInCurrentLevel = currentXP - prevLevelXPThreshold;
  const xpNeededForNextLevel = nextLevelXPThreshold - prevLevelXPThreshold;
  const progressPercent = Math.min(
    (xpInCurrentLevel / xpNeededForNextLevel) * 100,
    100
  );

  const tierName = stats?.tier === "pro" ? "Chaver" : "Talmid";

  return (
    <div className="bg-zinc-50 p-8 rounded-[3rem] shadow-inner h-full border border-zinc-100 flex flex-col justify-between group overflow-hidden relative">
      {/* Decorative corner glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/5 blur-[50px] pointer-events-none" />

      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <h3 className="text-xl font-black tracking-tight uppercase italic">
            Scholar Stats
          </h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Growth Metrics
          </p>
        </div>
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-100 group-hover:scale-110 transition-all group-hover:rotate-12">
          <Flame className="text-orange-500" size={24} fill="currentColor" />
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/50 rounded-2xl border border-zinc-100 space-y-2 transition-all group-hover:border-zinc-200">
            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              Rank
            </p>
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-amber-500" />
              <p className="text-xs font-black uppercase tracking-tight">
                {tierName}
              </p>
            </div>
          </div>
          <div className="p-4 bg-white/50 rounded-2xl border border-zinc-100 space-y-2 transition-all group-hover:border-zinc-200">
            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              Consistency
            </p>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-orange-500" />
              <p className="text-xs font-black uppercase tracking-tight">
                {stats?.current_streak || 0} Day Streak
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Level
              </span>
              <p className="text-4xl font-black tracking-tighter leading-none italic uppercase text-zinc-900">
                {currentLevel}
              </p>
            </div>
            <span className="text-[9px] font-mono text-zinc-400 font-bold tracking-tighter">
              {currentXP.toLocaleString()} XP
            </span>
          </div>

          <div className="h-3 w-full bg-white rounded-full overflow-hidden p-1 border border-zinc-200/50 shadow-inner">
            <div
              className="h-full bg-zinc-950 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.2)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Next Target HUD */}
      <div className="mt-8 flex items-center gap-3 opacity-30 group-hover:opacity-100 transition-opacity">
        <Target size={12} className="text-zinc-400" />
        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
          Next Milestone: {(nextLevelXPThreshold - currentXP).toLocaleString()}{" "}
          XP Remaining
        </p>
      </div>
    </div>
  );
};
