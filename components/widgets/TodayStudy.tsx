"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Loader2,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

/**
 * TodayStudy Component (v2.1 - Cleaned Types)
 * Filepath: components/widgets/TodayStudy.tsx
 * Role: The central "command center" for a user's daily study obligations.
 * Alignment: PRD Section 3.1 (Time Engine) & 2.4 (Gamification).
 */

interface Portion {
  id: string;
  study_date: string;
  type: "DAF_YOMI" | "PARASHAH" | "MISHNAH_YOMI" | "HALAKHAH";
  ref: string;
  he_ref: string;
  label?: string;
  xp_value: number;
  is_completed?: boolean;
}

// Utility type for raw database response before adding UI-state fields
type RawPortion = Omit<Portion, "xp_value" | "is_completed">;

interface TodayStudyProps {
  className?: string;
}

export const TodayStudy: React.FC<TodayStudyProps> = ({ className }) => {
  const [portions, setPortions] = useState<Portion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const supabase = createClient();

  // 1. Time Engine Logic: Determine the current period of the study day
  const timeContext = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12)
      return {
        label: "Morning (Shacharit)",
        sub: "Focus on concentration and clarity.",
      };
    if (hour < 18)
      return {
        label: "Afternoon (Mincha)",
        sub: "A moment of synthesis amidst the day.",
      };
    return {
      label: "Evening (Ma'ariv)",
      sub: "Reflecting on the wisdom gathered.",
    };
  }, []);

  useEffect(() => {
    const fetchTodayPortions = async () => {
      try {
        setIsLoading(true);
        setErrorState(null);

        const today = new Date().toISOString().split("T")[0];

        // Fetch real daily schedules
        const { data, error: supabaseError } = await supabase
          .from("daily_schedules")
          .select("*")
          .eq("study_date", today);

        if (supabaseError) throw supabaseError;

        // Map data and inject XP values/defaults while ensuring type safety
        const mappedPortions = ((data as RawPortion[]) || []).map(
          (p: RawPortion) => ({
            ...p,
            xp_value: p.type === "DAF_YOMI" ? 50 : 25,
            is_completed: false, // Logic would eventually link to a user_progress table
          })
        );

        setPortions(mappedPortions as Portion[]);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to sync calendar";
        console.error("[TodayStudy] Sync error:", err);
        setErrorState(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayPortions();
  }, [supabase]);

  const handleMarkComplete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setCompletingId(id);

    // Simulate completion logic & XP award
    setTimeout(() => {
      setPortions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_completed: true } : p))
      );
      setCompletingId(null);
    }, 800);
  };

  // UI Helpers
  const getPortionStyle = (type: string) => {
    switch (type) {
      case "DAF_YOMI":
        return {
          icon: Flame,
          color: "text-orange-600",
          bg: "bg-orange-50",
          border: "hover:border-orange-200",
        };
      case "PARASHAH":
        return {
          icon: BookOpen,
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "hover:border-blue-200",
        };
      case "HALAKHAH":
        return {
          icon: Clock,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "hover:border-emerald-200",
        };
      default:
        return {
          icon: Calendar,
          color: "text-zinc-600",
          bg: "bg-zinc-50",
          border: "hover:border-zinc-200",
        };
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Enhanced Header with Time Engine Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Calendar size={14} /> The Daily Briefing
          </h2>
          <p className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            {timeContext.label}
            {isLoading && (
              <Loader2 size={16} className="animate-spin text-zinc-200" />
            )}
          </p>
          <p className="text-xs text-zinc-500 italic">{timeContext.sub}</p>
        </div>

        <Link
          href="/library/schedules"
          className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-orange-600 flex items-center gap-1.5 transition-colors"
        >
          View Full Cycle <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* Main Portion Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] animate-pulse"
            />
          ))
        ) : errorState ? (
          <div className="col-span-full p-12 text-center bg-rose-50 border border-rose-100 rounded-[2.5rem] space-y-4">
            <AlertCircle size={32} className="text-rose-500 mx-auto" />
            <div>
              <p className="text-sm font-bold text-rose-900 uppercase tracking-widest">
                Temporal Desync
              </p>
              <p className="text-xs text-rose-600 mt-1">{errorState}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-rose-600 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-rose-700 transition-all"
            >
              Retry Sync
            </button>
          </div>
        ) : portions.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] opacity-50 space-y-4">
            <Clock size={40} className="mx-auto text-zinc-200" />
            <p className="text-sm text-zinc-400 italic">
              No specific portions identified for this date.
            </p>
          </div>
        ) : (
          portions.map((portion) => {
            const style = getPortionStyle(portion.type);
            const Icon = style.icon;

            return (
              <Link
                key={portion.id}
                href={`/read/${portion.ref.replace(/\s+/g, ".")}`}
                className={cn(
                  "relative group bg-white p-7 rounded-[2.5rem] border border-zinc-100 shadow-sm transition-all overflow-hidden",
                  style.border,
                  portion.is_completed
                    ? "bg-zinc-50/50 grayscale-[0.5]"
                    : "hover:shadow-2xl hover:-translate-y-1"
                )}
              >
                {/* Visual Background Decoration */}
                <Icon className="absolute -bottom-6 -right-6 w-24 h-24 text-zinc-50 opacity-20 group-hover:rotate-12 transition-transform duration-700" />

                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-2 rounded-xl", style.bg)}>
                        <Icon size={16} className={style.color} />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        {portion.type.replace("_", " ")}
                      </span>
                    </div>

                    {/* Progress / Completion Toggle */}
                    <button
                      onClick={(e) => handleMarkComplete(e, portion.id)}
                      disabled={
                        portion.is_completed || completingId === portion.id
                      }
                      className={cn(
                        "p-2 rounded-full transition-all",
                        portion.is_completed
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-zinc-50 text-zinc-300 hover:bg-white hover:shadow-md hover:text-emerald-500"
                      )}
                    >
                      {completingId === portion.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <CheckCircle2
                          size={16}
                          fill={portion.is_completed ? "currentColor" : "none"}
                        />
                      )}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 group-hover:text-orange-600 transition-colors">
                      {portion.label || portion.ref}
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-1">
                      {portion.ref}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                    <p className="font-hebrew text-xl text-zinc-400" dir="rtl">
                      {portion.he_ref}
                    </p>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-[9px] font-bold uppercase">
                      <Trophy size={10} />+{portion.xp_value} XP
                    </div>
                  </div>
                </div>

                {/* Progress Overlay */}
                {portion.is_completed && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-white px-4 py-2 rounded-full shadow-xl border border-zinc-100 flex items-center gap-2 animate-in zoom-in-95 duration-300">
                      <CheckCircle2 className="text-emerald-500" size={14} />
                      <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">
                        Complete
                      </span>
                    </div>
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-sm font-bold">Daily Goal Progress</p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              {portions.filter((p) => p.is_completed).length} /{" "}
              {portions.length} Portions Mastered Today
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {portions.map((p, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-8 rounded-full transition-all duration-500",
                p.is_completed
                  ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                  : "bg-zinc-800"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
