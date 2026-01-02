"use client";

import { useDailyPortions } from "@/lib/hooks/useDailyPortions";
import { cn } from "@/lib/utils/utils";
import { BookOpen, Calendar, ChevronRight, Target } from "lucide-react";
import Link from "next/link";

/**
 * PortionsWidget (v1.0)
 * Filepath: components/dashboard/widgets/PortionsWidget.tsx
 * Role: Real-time temporal study obligations.
 * Integration: Wired to useDailyPortions hook for live schedule data.
 */

export const PortionsWidget = () => {
  const { data: portions, isLoading } = useDailyPortions();

  return (
    <div className="bg-white border border-zinc-100 p-8 rounded-[3rem] shadow-sm h-full flex flex-col group overflow-hidden relative">
      {/* Subtle Paper Grain */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="space-y-1">
          <h3 className="text-xl font-black tracking-tight uppercase italic">
            Daily Portions
          </h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Target size={12} className="text-amber-500" /> Temporal Tracks
          </p>
        </div>
        <div className="p-3 bg-zinc-950 text-white rounded-2xl shadow-xl transition-transform group-hover:-rotate-6">
          <BookOpen size={20} />
        </div>
      </div>

      <div className="space-y-3 flex-grow relative z-10">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-zinc-50 rounded-2xl animate-pulse"
            />
          ))
        ) : portions && portions.length > 0 ? (
          portions.map((portion) => (
            <Link
              key={portion.id}
              href={`/read/${portion.ref.replace(/\s+/g, ".")}`}
              className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl group/item hover:bg-zinc-950 hover:text-white transition-all shadow-sm active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-1.5 h-6 rounded-full",
                    portion.is_completed
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "bg-zinc-200"
                  )}
                />
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-50 group-hover/item:opacity-70">
                    {portion.label}
                  </p>
                  <p className="text-sm font-bold truncate max-w-[180px]">
                    {portion.en_title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono opacity-20 group-hover/item:opacity-40">
                  {portion.ref}
                </span>
                <ChevronRight
                  size={14}
                  className="opacity-20 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all"
                />
              </div>
            </Link>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-10 grayscale">
            <Calendar size={48} strokeWidth={1} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">
              No Portions Found
            </p>
          </div>
        )}
      </div>

      {/* Progress HUD */}
      <div className="mt-8 pt-6 border-t border-zinc-50 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black text-zinc-900 uppercase">
            Mastery
          </span>
          <div className="flex gap-1">
            {portions?.map((p, i) => (
              <div
                key={i}
                className={cn(
                  "w-4 h-1 rounded-full",
                  p.is_completed ? "bg-emerald-500" : "bg-zinc-100"
                )}
              />
            ))}
          </div>
        </div>
        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest italic">
          Cycles Resuming
        </span>
      </div>
    </div>
  );
};
