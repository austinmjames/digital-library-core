import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  description?: string;
}

/**
 * DrashX StatCard
 * Role: Displays gamification and contribution metrics.
 * Design: Minimalist Paper card with dynamic icon accents.
 */
export const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  description,
}: StatCardProps) => (
  <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md group">
    <div
      className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}
    >
      <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
    </div>
    <div>
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-0.5">
        {label}
      </p>
      <p className="text-2xl font-black text-zinc-900 leading-none">{value}</p>
      {description && (
        <p className="text-[10px] text-zinc-400 mt-1.5 font-medium tracking-tight">
          {description}
        </p>
      )}
    </div>
  </div>
);
