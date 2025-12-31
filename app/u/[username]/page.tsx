"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  Calendar,
  Flame,
  Loader2,
  LucideIcon,
  MessageSquare,
  Share2,
  Target,
  Trophy,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Modular Component Imports
import { ImpactGraph } from "@/components/profile/ImpactGraph";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { TrophyCase } from "@/components/profile/TrophyCase";

/**
 * Public Profile Orchestrator (v2.3)
 * Filepath: app/u/[username]/page.tsx
 * Role: Coordinates profile data fetching and layout structure.
 * PRD Alignment: Section 2.2 (Social Identity).
 * Fix: Removed unused Lucide imports (ShieldCheck, Grid, Clock, Users).
 */

interface ProfileData {
  id: string;
  display_name: string;
  username: string;
  bio: string;
  tier: "free" | "pro";
  created_at: string;
}

interface StatsData {
  current_xp: number;
  current_level: number;
  current_streak: number;
  total_notes: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = typeof params?.username === "string" ? params.username : "";
  const supabase = createClient();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!username) return;
      setLoading(true);

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (!userError && user) {
        setProfile(user as ProfileData);
        const { data: statData } = await supabase
          .from("dashboard_user_stats")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (statData) setStats(statData as StatsData);
      }
      setLoading(false);
    }
    loadProfile();
  }, [username, supabase]);

  const activityData = useMemo(
    () => Array.from({ length: 364 }).map(() => Math.random()),
    []
  );

  if (loading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-paper gap-4">
        <Loader2 className="animate-spin text-zinc-300" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Summoning Scholarship...
        </p>
      </div>
    );

  if (!profile)
    return (
      <div className="h-screen flex flex-col items-center justify-center text-zinc-400 font-bold uppercase tracking-widest bg-paper p-10 text-center">
        <p className="text-xl text-zinc-900 font-serif italic mb-2">
          The Scroll is Empty.
        </p>
        <p className="text-sm normal-case font-medium mb-8">
          Scholar @{username} not found.
        </p>
        <button className="px-8 py-3 bg-zinc-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
          Return to Library
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAF9F6] selection:bg-zinc-950 selection:text-white pb-20">
      {/* 1. Hero Section (Inverse Theme) */}
      <section className="bg-zinc-950 text-white pt-24 pb-40 px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-end gap-10">
          <div className="w-40 h-40 rounded-[3rem] bg-zinc-900 border-8 border-zinc-950 shadow-2xl flex items-center justify-center relative">
            <span className="text-6xl font-black">
              {profile.display_name[0]}
            </span>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-amber-500 rounded-2xl border-4 border-zinc-950 flex items-center justify-center text-white shadow-lg">
              <Flame size={24} fill="currentColor" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center md:justify-start">
                <h1 className="text-5xl font-black tracking-tighter uppercase">
                  {profile.display_name}
                </h1>
                <LevelBadge level={stats?.current_level || 1} />
              </div>
              <p className="text-zinc-500 font-mono text-lg">
                @{profile.username}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-8 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-amber-500" />{" "}
                {stats?.current_streak || 0} Day Streak
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-zinc-700" /> Joined{" "}
                {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-4 bg-zinc-900 rounded-[1.5rem] border border-white/5 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white shadow-xl">
              <Share2 size={20} />
            </button>
            <button className="px-10 py-5 bg-white text-zinc-950 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-amber-400 transition-all shadow-2xl active:scale-95">
              Follow Scholar
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-8 -mt-20 relative z-10 space-y-12">
        <ImpactGraph data={activityData} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-10">
            <div className="bg-zinc-950 p-10 rounded-[2.5rem] text-white shadow-2xl space-y-10">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                Scholar Metrics
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <ImpactStat
                  icon={Trophy}
                  label="Total XP"
                  value={stats?.current_xp?.toLocaleString() || "0"}
                  color="text-amber-500"
                />
                <ImpactStat
                  icon={MessageSquare}
                  label="Notes"
                  value={stats?.total_notes || 0}
                  color="text-blue-400"
                />
              </div>
            </div>

            <TrophyCase tier={profile.tier} level={stats?.current_level || 1} />

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">
                Biography
              </h3>
              <p className="text-zinc-700 leading-relaxed italic text-sm border-l-4 border-amber-200 pl-6 py-4 bg-white rounded-[2rem] shadow-sm">
                {profile.bio ||
                  "This scholar chooses the path of silence for now."}
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <ProfileTabs />
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Helper UI Components ---

const LevelBadge = ({ level }: { level: number }) => {
  const getTier = (lvl: number) => {
    if (lvl >= 100)
      return {
        title: "Luminary",
        color: "text-blue-500 bg-blue-50 border-blue-200",
      };
    if (lvl >= 50)
      return {
        title: "Sage",
        color: "text-amber-700 bg-amber-50 border-amber-200",
      };
    return {
      title: "Seeker",
      color: "text-zinc-500 bg-zinc-50 border-zinc-200",
    };
  };
  const tier = getTier(level);
  return (
    <div
      className={cn(
        "px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
        tier.color
      )}
    >
      {tier.title} (LVL {level})
    </div>
  );
};

interface ImpactStatProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
}

const ImpactStat = ({ icon: Icon, label, value, color }: ImpactStatProps) => (
  <div className="flex flex-col items-center gap-2">
    <Icon className={cn("w-5 h-5", color)} />
    <span className="text-xl font-black text-white">{value}</span>
    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center">
      {label}
    </span>
  </div>
);
