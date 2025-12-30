"use client";

import {
  ActivityItem,
  DailyStudyCard,
  StatCard,
} from "@/components/dashboard/DashboardComponents";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Calendar,
  Clock,
  Flame,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Home Page (Dashboard v1.7 - Refactored)
 * Filepath: app/page.tsx
 * Role: The central "Home Feed" for the DrashX Beit Midrash.
 * Improvements: Split UI components into sub-files for better organization.
 */

interface DailyStudyItem {
  id: string;
  type: "Daf Yomi" | "Parashah" | "Mishnah Yomi";
  ref: string;
  heRef: string;
}

interface TrendingResource {
  id: string;
  title: string;
  author: string;
  type: "Notebook" | "Translation";
  saves: number;
}

export default function HomePage() {
  const [studyItems, setStudyItems] = useState<DailyStudyItem[]>([]);
  const [trending, setTrending] = useState<TrendingResource[]>([]);

  useEffect(() => {
    // Simulated hydration from Time Engine and Discovery hooks
    setStudyItems([
      { id: "1", type: "Daf Yomi", ref: "Berakhot 24b", heRef: "ברכות כ״ד ב׳" },
      { id: "2", type: "Parashah", ref: "Vayishlach", heRef: "וישלח" },
      { id: "3", type: "Mishnah Yomi", ref: "Shabbat 1:1", heRef: "שבת א׳:א׳" },
    ]);

    setTrending([
      {
        id: "t1",
        title: "Rambam&apos;s Guide for the Perplexed",
        author: "Rabbi S. Miller",
        type: "Translation",
        saves: 1240,
      },
      {
        id: "t2",
        title: "Chassidic Insights on the Weekly Portion",
        author: "B. Dov",
        type: "Notebook",
        saves: 890,
      },
      {
        id: "t3",
        title: "Portuguese Tanya Project",
        author: "L. Mendes",
        type: "Translation",
        saves: 320,
      },
    ]);
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-paper pb-20">
        {/* 1. Header & Torah Time Logic */}
        <header className="max-w-7xl mx-auto p-8 pt-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">
              Shalom, Joseph
            </h1>
            <p className="text-zinc-500 italic text-sm">
              &quot;Study is not the main thing, but doing is.&quot; &mdash;
              Pirkei Avot 1:17
            </p>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-white border border-zinc-200 rounded-2xl shadow-sm">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              Torah Time: Afternoon (Mincha)
            </span>
          </div>
        </header>

        {/* 2. Gamification Stats Rail */}
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            icon={Flame}
            label="Flame (Monthly)"
            value="1,240"
            color="bg-orange-500"
          />
          <StatCard
            icon={Trophy}
            label="Lifetime XP"
            value="15,482"
            color="bg-amber-600"
          />
          <StatCard
            icon={Sparkles}
            label="Level Tier"
            value="12 (Builder)"
            color="bg-blue-600"
          />
        </section>

        <main className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Column: Study History & Daily Portions */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  Resume Study
                </h3>
                <button className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">
                  Full History
                </button>
              </div>
              <div className="divide-y divide-zinc-50">
                <ActivityItem
                  title="Berakhot 24b"
                  subtitle="Daf Yomi &bull; Morning Session"
                  time="2h ago"
                  icon={BookOpen}
                  href="/read/Berakhot.24b"
                />
                <ActivityItem
                  title="Mishneh Torah, Yesodei HaTorah 1"
                  subtitle="The Foundations of Wisdom"
                  time="Yesterday"
                  icon={BookMarked}
                  href="/read/Mishneh_Torah.Sefer_Mada.1.1"
                />
              </div>
            </div>

            <section className="space-y-6">
              <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Calendar size={14} /> Today&apos;s Portions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studyItems.map((item) => (
                  <DailyStudyCard key={item.id} item={item} />
                ))}
              </div>
            </section>

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-zinc-400" />
                  Community Insight
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase">
                  <Sparkles size={10} />
                  Live
                </div>
              </div>
              <div className="p-10 text-center space-y-6">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto border border-zinc-100">
                  <MessageSquare className="w-8 h-8 text-zinc-300" />
                </div>
                <div className="max-w-xs mx-auto">
                  <p className="text-sm font-bold text-zinc-900">
                    Your Study Groups are active.
                  </p>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed italic">
                    3 members of &quot;Daf Yomi Morning Circle&quot; have posted
                    insights on Berakhot 24a.
                  </p>
                </div>
                <button className="px-8 py-3 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all shadow-lg">
                  Open Group Feed
                </button>
              </div>
            </div>
          </div>

          {/* Right Rail: Goals & Market */}
          <div className="space-y-10">
            <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Weekly Goal
                  </h4>
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame size={14} fill="currentColor" />
                    <span className="text-xs font-bold">12d Streak</span>
                  </div>
                </div>

                <div>
                  <p className="text-4xl font-bold">
                    85%{" "}
                    <span className="text-sm font-normal text-zinc-500 uppercase">
                      complete
                    </span>
                  </p>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden mt-4">
                    <div
                      className="h-full bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-1000"
                      style={{ width: "85%" }}
                    />
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed pt-2">
                  You&apos;ve studied 6 out of 7 days this week. Complete
                  tomorrow to earn the &quot;Sabbath Scholar&quot; badge.
                </p>
              </div>
              <BookOpen className="absolute -bottom-10 -right-10 w-40 h-40 text-white opacity-[0.03] -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
              <div className="flex items-center gap-2 mb-8 text-zinc-400">
                <TrendingUp size={16} />
                <h3 className="font-bold text-zinc-900 text-[10px] uppercase tracking-widest">
                  Trending Market
                </h3>
              </div>
              <div className="space-y-6">
                {trending.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-700 group-hover:text-zinc-900 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5 uppercase">
                        {item.saves.toLocaleString()} adds
                      </p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-zinc-200 group-hover:text-zinc-900 transition-all"
                    />
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-4 bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-100 transition-colors">
                Browse Market
              </button>
            </div>

            <div className="p-8 bg-zinc-950 rounded-[2.5rem] text-white space-y-6">
              <Users size={32} className="text-orange-500" />
              <h3 className="text-2xl font-bold">Study Circles</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Join collaborative Chavruta groups to debate texts and share
                insights.
              </p>
              <Link
                href="/community"
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-bold text-[10px] uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-colors"
              >
                Discover Groups
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
