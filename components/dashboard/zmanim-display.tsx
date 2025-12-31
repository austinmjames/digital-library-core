import { Clock } from "lucide-react";

interface ZmanimDisplayProps {
  nextZman: string;
  time: string;
  isAfterSunset?: boolean;
}

/**
 * DrashX ZmanimDisplay
 * Role: High-contrast temporal context widget.
 * PRD Ref: Section 1.3 (Time-Aware Study - Torah Time).
 * Design: Inverse Theme (zinc-950) with orange-400 accents.
 */
export const ZmanimDisplay = ({
  nextZman,
  time,
  isAfterSunset,
}: ZmanimDisplayProps) => (
  <div className="px-5 py-3 bg-zinc-950 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 relative overflow-hidden group">
    {/* Subtle glow effect for "Torah Time" */}
    <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

    <Clock
      className={`w-5 h-5 text-orange-400 ${
        isAfterSunset ? "animate-pulse" : ""
      }`}
    />
    <div className="flex flex-col relative z-10">
      <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
        Next Zman
      </span>
      <span className="text-xs font-bold">
        {nextZman} • {time}
      </span>
    </div>
  </div>
);
