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
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

// Canvas Integration: Using the premium Skeleton component for ingestion states
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * TodayStudy Component (v2.2 - High Fidelity)
 * Filepath: components/widgets/TodayStudy.tsx
 * Role: Daily briefing and study obligation command center.
 * PRD Alignment: Section 3.1 (Time Engine) & 2.4 (Gamification).
 * Fixes: Integrated Skeleton component, updated color tokens, and refined HUD typography.
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

  const timeContext = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12)
      return {
        label: "Morning (Shacharit)",
        sub: "Concentration and clarity of mind.",
      };
    if (hour < 18)
      return {
        label: "Afternoon (Mincha)",
        sub: "Synthesize the wisdom of the day.",
      };
    return {
      label: "Evening (Ma'ariv)",
      sub: "Reflecting on the gathered light.",
    };
  }, []);

  useEffect(() => {
    const fetchTodayPortions = async () => {
      try {
        setIsLoading(true);
        setErrorState(null);
        const today = new Date().toISOString().split("T")[0];

        const { data, error: supabaseError } = await supabase
          .from("daily_schedules")
          .select("*")
          .eq("study_date", today);

        if (supabaseError) throw supabaseError;

        const mappedPortions = ((data as RawPortion[]) || []).map(
          (p: RawPortion) => ({
            ...p,
            xp_value: p.type === "DAF_YOMI" ? 50 : 25,
            is_completed: false,
          })
        );

        setPortions(mappedPortions as Portion[]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Temporal Desync";
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

    // Simulation of PRD 2.4 XP Ingestion
    setTimeout(() => {
      setPortions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_completed: true } : p))
      );
      setCompletingId(null);
    }, 800);
  };

  const getPortionStyle = (type: string) => {
    switch (type) {
      case "DAF_YOMI":
        return {
          icon: Flame,
          color: "text-amber-500", // Gold Signature
          bg: "bg-amber-50",
          border: "hover:border-amber-400/50",
        };
      case "PARASHAH":
        return {
          icon: BookOpen,
          color: "text-zinc-950", // Ink Signature
          bg: "bg-zinc-50",
          border: "hover:border-zinc-950/20",
        };
      default:
        return {
          icon: Calendar,
          color: "text-zinc-400",
          bg: "bg-zinc-50",
          border: "hover:border-zinc-200",
        };
    }
  };

  return (
    <div className={cn("space-y-10", className)}>
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] flex items-center gap-2.5">
            <Sparkles size={14} className="text-amber-500" /> Daily Briefing
          </h2>
          <div className="flex items-center gap-4">
            <p className="text-2xl font-black text-zinc-950 tracking-tight uppercase">
              {timeContext.label}
            </p>
            {isLoading && (
              <Loader2 size={16} className="animate-spin text-zinc-200" />
            )}
          </div>
          <p className="text-xs text-zinc-400 font-medium italic opacity-70">
            {timeContext.sub}
          </p>
        </div>

        <Link
          href="/library/schedules"
          className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-950 flex items-center gap-2 transition-all group"
        >
          Full Cycle{" "}
          <ArrowUpRight
            size={12}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </Link>
      </div>

      {/* 2. Grid (Portion Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          // Using the Canvas Skeleton primitive for high-fidelity loading
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-56" />
          ))
        ) : errorState ? (
          <div className="col-span-full p-12 text-center bg-rose-50 border border-rose-100 rounded-[3rem] space-y-5 animate-in fade-in duration-500">
            <AlertCircle
              size={32}
              className="text-rose-500 mx-auto"
              strokeWidth={1.5}
            />
            <div>
              <p className="text-[10px] font-black text-rose-950 uppercase tracking-[0.3em]">
                Manuscript Desync
              </p>
              <p className="text-xs text-rose-400 mt-2 font-medium">
                {errorState}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-rose-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-900 transition-all active:scale-95"
            >
              Retry Sync
            </button>
          </div>
        ) : portions.length === 0 ? (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-100 rounded-[4rem] opacity-40 space-y-4">
            <Clock
              size={48}
              className="mx-auto text-zinc-200"
              strokeWidth={1}
            />
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
              The Daily Scroll is Silent
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
                  "relative group bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm transition-all duration-500 overflow-hidden",
                  style.border,
                  portion.is_completed
                    ? "bg-zinc-50/50 grayscale-[0.8] opacity-60"
                    : "hover:shadow-2xl hover:-translate-y-1.5"
                )}
              >
                <Icon className="absolute -bottom-6 -right-6 w-28 h-28 text-zinc-50 opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none" />

                <div className="relative z-10 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-3 rounded-2xl transition-all shadow-sm group-hover:shadow-md",
                          style.bg
                        )}
                      >
                        <Icon size={18} className={style.color} />
                      </div>
                      <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.25em]">
                        {portion.type.replace("_", " ")}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleMarkComplete(e, portion.id)}
                      disabled={
                        portion.is_completed || completingId === portion.id
                      }
                      className={cn(
                        "p-2.5 rounded-full transition-all active:scale-95",
                        portion.is_completed
                          ? "bg-emerald-50 text-emerald-600 shadow-inner"
                          : "bg-zinc-50 text-zinc-300 hover:bg-zinc-950 hover:text-white"
                      )}
                    >
                      {completingId === portion.id ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <CheckCircle2
                          size={18}
                          fill={portion.is_completed ? "currentColor" : "none"}
                        />
                      )}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-zinc-950 tracking-tighter leading-tight uppercase group-hover:text-amber-500 transition-colors">
                      {portion.label || portion.ref}
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mt-2">
                      {portion.ref}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-zinc-50">
                    <p
                      className="font-serif-hebrew text-2xl text-zinc-300 group-hover:text-zinc-500 transition-colors"
                      dir="rtl"
                    >
                      {portion.he_ref}
                    </p>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm border border-amber-100/50">
                      <Trophy size={10} /> +{portion.xp_value} XP
                    </div>
                  </div>
                </div>

                {/* Mastery Overlay */}
                {portion.is_completed && (
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-700">
                    <div className="bg-zinc-950 px-6 py-3 rounded-full shadow-2xl border border-white/10 flex items-center gap-3 animate-in zoom-in-95 duration-500">
                      <CheckCircle2 className="text-amber-500" size={16} />
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                        Mastered
                      </span>
                    </div>
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>

      {/* 3. Summary Pulse */}
      <div className="bg-zinc-950 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[60px] -mr-16 -mt-16 pointer-events-none" />

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-amber-500 rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
            <Trophy size={32} className="text-zinc-950" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-black uppercase tracking-tight">
              Daily Progress
            </p>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">
              {portions.filter((p) => p.is_completed).length} /{" "}
              {portions.length} Portion Fragments Mastered
            </p>
          </div>
        </div>

        <div className="flex gap-2 relative z-10">
          {portions.map((p, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-10 rounded-full transition-all duration-700",
                p.is_completed
                  ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                  : "bg-zinc-800"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
