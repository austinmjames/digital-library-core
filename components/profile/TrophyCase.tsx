"use client";

import { cn } from "@/lib/utils/utils";
import { LucideIcon, Moon, Sword } from "lucide-react";

interface TrophyProps {
  tier: "free" | "pro";
  level: number;
}

interface AchievementBadgeProps {
  icon: LucideIcon;
  name: string;
  description: string;
  unlocked: boolean;
  tier: "gold" | "silver";
}

/**
 * TrophyCase
 * Filepath: components/profile/TrophyCase.tsx
 * Role: Showcases scholarly achievements and badges.
 * Fix: Removed unused imports (Trophy, ShieldCheck) and replaced 'any' with strict props.
 */
export const TrophyCase = ({ tier, level }: TrophyProps) => {
  const achievements: (AchievementBadgeProps & { id: string })[] = [
    {
      id: "night-watchman",
      icon: Moon,
      name: "Night Watchman",
      description: "Studied between 2am and 5am.",
      unlocked: level >= 5,
      tier: "silver",
    },
    {
      id: "daf-warrior",
      icon: Sword,
      name: "Daf Warrior",
      description: "30 consecutive days of Gemara.",
      unlocked: tier === "pro",
      tier: "gold",
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">
        Trophy Case
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {achievements.map((item) => (
          <AchievementBadge key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};

const AchievementBadge = ({
  icon: Icon,
  name,
  description,
  unlocked,
  tier,
}: AchievementBadgeProps) => (
  <div
    className={cn(
      "p-5 rounded-[2rem] border transition-all flex flex-col items-center text-center gap-2",
      unlocked
        ? "bg-white border-zinc-100 shadow-sm"
        : "bg-zinc-50 border-transparent opacity-40 grayscale"
    )}
  >
    <div
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center mb-1",
        tier === "gold"
          ? "bg-amber-50 text-amber-600"
          : "bg-zinc-100 text-zinc-500"
      )}
    >
      <Icon size={20} />
    </div>
    <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-tighter">
      {name}
    </h4>
    <p className="text-[9px] text-zinc-400 leading-tight font-medium">
      {description}
    </p>
  </div>
);
