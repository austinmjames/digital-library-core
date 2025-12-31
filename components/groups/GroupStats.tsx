import { Trophy, Users } from "lucide-react";

interface GroupStatsProps {
  memberCount: number;
  maxMembers: number;
}

/**
 * GroupStats Component
 * Role: Displays the "Scholarly Strength" metrics.
 */
export const GroupStats = ({ memberCount, maxMembers }: GroupStatsProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
        Scholarly Strength
      </h3>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-zinc-500 font-bold">
          <Users size={18} />
          <span className="text-xs uppercase tracking-widest">Members</span>
        </div>
        <span className="font-mono text-sm font-black bg-zinc-100 px-3 py-1 rounded-lg text-zinc-900">
          {memberCount}/{maxMembers}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-zinc-500 font-bold">
          <Trophy size={18} />
          <span className="text-xs uppercase tracking-widest">Rank</span>
        </div>
        <span className="text-xs font-black uppercase tracking-tighter text-amber-600">
          Top 5%
        </span>
      </div>
    </div>
  );
};
