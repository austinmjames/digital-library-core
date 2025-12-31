"use client";

import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Flame,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

// Modular Component Imports (PRD Modular Architecture)
import { ActivityItem } from "@/components/dashboard/activity-item";
import { StatCard } from "@/components/dashboard/stat-card";
import { ZmanimDisplay } from "@/components/dashboard/zmanim-display";

/**
 * DrashX Dashboard Page
 * Filepath: app/(dashboard)/page.tsx
 * Role: The central "Home" feed for the DrashX Beit Midrash.
 * Logic: Merges user stats, reading history, and temporal (Zmanim) context.
 * PRD Ref: Section 1.3 (Temporal), 2.2 (Library), 2.4 (Gamification).
 */

// Strict Interfaces for Type Safety (Resolving 'any' linting errors)
interface DashboardUserStats {
  display_name: string;
  tier: "free" | "pro";
  current_xp: number;
  current_level: number;
  current_streak: number;
  total_notes: number;
  shelf_count: number;
}

interface UserHistoryItem {
  id: string;
  book_id: string;
  last_ref: string;
  updated_at: string;
  library_books: {
    en_title: string;
  } | null;
}

// Internal helper for Today's Study tiles
const DailyStudyTile = ({
  type,
  title,
  refStr,
}: {
  type: string;
  title: string;
  refStr: string;
}) => (
  <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:border-zinc-300 transition-all cursor-pointer group">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[9px] font-black px-2 py-1 bg-zinc-100 rounded-md uppercase tracking-widest text-zinc-500">
        {type}
      </span>
      <Zap
        size={14}
        className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
    <h4 className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
      {title}
    </h4>
    <p className="text-xs font-mono text-zinc-400 mt-1">{refStr}</p>
    <div className="mt-4 flex items-center justify-between">
      <div className="flex -space-x-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-5 h-5 rounded-full border-2 border-white bg-zinc-200"
          />
        ))}
      </div>
      <ArrowRight
        size={14}
        className="text-zinc-200 group-hover:text-zinc-900 transition-all"
      />
    </div>
  </div>
);

export default function DashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardUserStats | null>(null);
  const [history, setHistory] = useState<UserHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) return;

        // Fetch User Stats (XP, Levels, Streak) - PRD 2.4
        const { data: statData, error: statError } = await supabase
          .from("dashboard_user_stats")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (!statError) setStats(statData);

        // Fetch Recent Reading History - PRD 2.2
        const { data: histData, error: histError } = await supabase
          .from("user_history")
          .select("*, library_books(en_title)")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(3);

        if (!histError) setHistory(histData || []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [supabase]);

  // Handle initial loading state to resolve unused 'loading' variable
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
            Entering the Beit Midrash...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10 animate-in fade-in duration-700 pb-20">
      {/* 1. Header & Temporal Context (PRD 1.3 - Torah Time) */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">
            Shalom, {stats?.display_name?.split(" ")[0] || "Scholar"}
          </h1>
          <p className="text-zinc-500 italic font-serif text-lg opacity-80">
            &ldquo;Turn it and turn it, for everything is in it.&rdquo;
          </p>
        </div>

        <ZmanimDisplay nextZman="Mincha" time="1:45 PM" />
      </header>

      {/* 2. Today's Study Portions (PRD 3.2 - Daily mapping) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
            <Calendar size={14} /> Today&apos;s Study Portions
          </h2>
          <span className="text-[10px] font-bold text-zinc-400">
            12 Tevet, 5785
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DailyStudyTile
            type="Daf Yomi"
            title="Berakhot 24"
            refStr="Berakhot.24a"
          />
          <DailyStudyTile
            type="Parashah"
            title="Vayechi"
            refStr="Genesis.47.28"
          />
          <DailyStudyTile
            type="Mishnah Yomi"
            title="Sukkah 2:1"
            refStr="Sukkah.2.1"
          />
          <DailyStudyTile
            type="Halakhah"
            title="Mishneh Torah"
            refStr="Sefer_Mada.1"
          />
        </div>
      </section>

      {/* 3. Gamification Metrics (PRD 2.4 - XP/Level Tiers) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Flame}
          label="Flame Score"
          value={stats?.current_xp?.toLocaleString() || "0"}
          color="bg-orange-500"
          description={`${stats?.current_streak || 0} day streak`}
        />
        <StatCard
          icon={Trophy}
          label="Scholar Tier"
          value={stats?.current_level ? `Lvl ${stats.current_level}` : "Seeker"}
          color="bg-amber-600"
          description="Next: Builder (5,000 XP)"
        />
        <StatCard
          icon={BookOpen}
          label="Shelf Activity"
          value={stats?.shelf_count || "0"}
          color="bg-blue-600"
          description={`${stats?.total_notes || 0} personal insights`}
        />
      </section>

      {/* 4. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Feed: Resume Study & Community Challenge */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
              <h3 className="font-black text-zinc-900 uppercase tracking-widest text-xs flex items-center gap-3">
                <Clock className="w-5 h-5 text-zinc-400" />
                Resume Study
              </h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">
                View Library
              </button>
            </div>
            <div className="p-4 space-y-1">
              {history.length > 0 ? (
                history.map((item) => (
                  <ActivityItem
                    key={item.id}
                    title={item.library_books?.en_title || "Unknown Book"}
                    subtitle={`Last Read: ${item.last_ref}`}
                    time="Recently"
                    icon={BookOpen}
                    href={`/read/${item.last_ref}`}
                  />
                ))
              ) : (
                <div className="p-10 text-center text-zinc-400 text-sm italic">
                  No recent activity. Open the library to begin.
                </div>
              )}
            </div>
          </div>

          {/* Community Challenge (PRD 2.3 - Creator Loop) */}
          <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl">
            <div className="relative z-10 space-y-4">
              <h3 className="text-orange-400 font-black uppercase tracking-[0.3em] text-[10px]">
                Community Challenge
              </h3>
              <h2 className="text-3xl font-black max-w-sm leading-tight">
                Translate Rashi on Berakhot 24b
              </h2>
              <p className="text-zinc-400 text-sm max-w-xs">
                Earn the &ldquo;Public Benefactor&rdquo; badge by contributing
                to a community translation project.
              </p>
              <button className="mt-4 px-8 py-4 bg-white text-zinc-900 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-lg active:scale-95">
                Accept Mission
              </button>
            </div>
            <TrendingUp className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-5 group-hover:scale-110 transition-transform duration-1000" />
          </div>
        </div>

        {/* Sidebar: Progress & Trending */}
        <div className="space-y-8">
          <div className="bg-zinc-50 border border-zinc-200 p-8 rounded-[2.5rem] space-y-6 shadow-sm">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Weekly Goal
              </h4>
              <p className="text-3xl font-black text-zinc-900 mt-1">85%</p>
            </div>
            <div className="h-3 w-full bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 transition-all duration-1000"
                style={{ width: "85%" }}
              />
            </div>
            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
              You&apos;ve maintained your streak for 6 days. Complete tomorrow
              to achieve a{" "}
              <span className="text-zinc-900 font-bold">Sabbath Scholar</span>{" "}
              badge.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-4">
              Trending in Market
            </h3>
            <div className="space-y-2">
              {[
                { name: "Koren English Bible", count: "1.2k" },
                { name: "Rabbi Sacks Insights", count: "850" },
                { name: "Chassidic Stories", count: "420" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-300 transition-all cursor-pointer group"
                >
                  <span className="text-xs font-bold text-zinc-700 group-hover:text-zinc-900">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400">
                      {item.count}
                    </span>
                    <ArrowRight
                      size={12}
                      className="text-zinc-200 group-hover:text-zinc-900 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
