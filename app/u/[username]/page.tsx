"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Edit3,
  Globe,
  Loader2,
  Settings,
  Share2,
  Target,
  TrendingUp,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Components
import { AccountSettings } from "@/components/profile/AccountSettings";
import { ImpactGraph } from "@/components/profile/ImpactGraph";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { TrophyCase } from "@/components/profile/TrophyCase";
import { Avatar, AvatarConfig } from "@/components/ui/Avatar";

/**
 * Public Profile Orchestrator (v5.0 - Material Edition)
 * Filepath: app/u/[username]/page.tsx
 * Role: Coordinates profile view/edit modes with unified scholarly styling.
 * Style: Modern Google (Material 3). Clean, non-italic, high-clarity.
 */

interface ProfileData {
  id: string;
  display_name: string;
  username: string;
  bio: string;
  tier: "free" | "pro";
  avatar_config: AvatarConfig;
  created_at: string;
}

interface StatsData {
  current_xp: number;
  current_level: number;
  current_streak: number;
  total_notes: number;
}

type TabID = "public" | "edit" | "account";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = typeof params?.username === "string" ? params.username : "";
  const supabase = createClient();
  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabID>("public");

  const isOwner = authUser?.id === profile?.id;

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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[var(--paper)] gap-4">
        <Loader2
          className="animate-spin text-[var(--accent-primary)]"
          size={36}
          strokeWidth={2}
        />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ink-muted)]">
          Summoning Scholar Profile...
        </p>
      </div>
    );

  if (!profile)
    return (
      <div className="h-screen flex flex-col items-center justify-center text-[var(--ink-muted)] bg-[var(--paper)] p-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-4 text-[var(--ink)]">
          The Scroll is Empty.
        </h2>
        <p className="text-sm font-normal mb-10 text-[var(--ink-muted)]">
          Scholar @{username} not found in the records.
        </p>
        <button
          onClick={() => router.push("/library")}
          className="btn-primary px-10"
        >
          Return to Library
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--paper)] selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300 pb-32">
      {/* 1. Profile Hero Section */}
      <section className="bg-[var(--paper)] border-b border-[var(--border-subtle)] pt-16 pb-24 px-8 relative overflow-hidden transition-colors">
        <div className="max-w-6xl mx-auto relative z-10 space-y-12">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-[var(--surface-hover)] rounded-full text-[var(--ink-muted)] transition-all active:scale-95"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            {isOwner && (
              <nav className="flex items-center bg-[var(--surface-hover)] p-1 rounded-full border border-[var(--border-subtle)] shadow-sm">
                {[
                  { id: "public", label: "Public Profile", icon: Globe },
                  { id: "edit", label: "Identity", icon: Edit3 },
                  { id: "account", label: "Account", icon: Settings },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabID)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all",
                      activeTab === tab.id
                        ? "bg-white text-[var(--accent-primary)] shadow-sm"
                        : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    )}
                  >
                    <tab.icon
                      size={13}
                      strokeWidth={activeTab === tab.id ? 2.5 : 2}
                    />
                    {tab.label}
                  </button>
                ))}
              </nav>
            )}

            {!isOwner && (
              <div className="flex items-center gap-3">
                <button className="p-2.5 text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)] rounded-full transition-all">
                  <Share2 size={20} strokeWidth={2} />
                </button>
                <button className="p-2.5 text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)] rounded-full transition-all">
                  <Bell size={20} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-12 pt-4">
            <Avatar
              config={profile.avatar_config}
              size="xl"
              className="border-4 border-white dark:border-[var(--border-subtle)] shadow-2xl ring-1 ring-[var(--border-subtle)]"
            />

            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center md:justify-start">
                  <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)]">
                    {profile.display_name}
                  </h1>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase rounded-full border border-blue-100 dark:border-blue-900/30">
                    <CheckCircle2 size={12} strokeWidth={2.5} />
                    Verified Scholar
                  </div>
                </div>
                <p className="text-[var(--ink-muted)] font-medium text-lg opacity-80">
                  @{profile.username}
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-10">
                <div className="flex items-center gap-2.5">
                  <Target
                    size={18}
                    className="text-blue-500"
                    strokeWidth={2.5}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                    {stats?.current_streak || 0} Day Study Streak
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar
                    size={18}
                    className="text-[var(--ink-muted)]"
                    strokeWidth={2.5}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                    Canonical Entry {new Date(profile.created_at).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {!isOwner && (
              <div className="pb-2">
                <button className="btn-primary px-12 py-4 text-xs tracking-widest shadow-lg shadow-blue-500/20">
                  FOLLOW SCHOLAR
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Main Profile Content */}
      <main className="max-w-6xl mx-auto px-8 -mt-10 relative z-30">
        {activeTab === "public" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-3 duration-700">
            {/* Semantic Impact Map */}
            <div className="paper-card p-6 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <TrendingUp
                    size={14}
                    className="text-[var(--accent-primary)]"
                    strokeWidth={2.5}
                  />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">
                    Semantic Contribution Heatmap
                  </h4>
                </div>
              </div>
              <ImpactGraph data={activityData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Sidebar: Scholar Metadata */}
              <div className="lg:col-span-4 space-y-8">
                {/* Metrics Stats */}
                <div className="paper-card p-8 space-y-8">
                  <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4">
                    <Award
                      size={16}
                      className="text-amber-500"
                      strokeWidth={2.5}
                    />
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                      Scholar Achievements
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-[var(--surface-hover)] rounded-3xl text-center border border-[var(--border-subtle)] shadow-inner">
                      <p className="text-2xl font-bold text-[var(--ink)] tracking-tight">
                        {stats?.current_xp?.toLocaleString() || "0"}
                      </p>
                      <p className="text-[9px] font-bold text-[var(--ink-muted)] uppercase tracking-widest mt-1.5 opacity-60">
                        Total XP
                      </p>
                    </div>
                    <div className="p-5 bg-[var(--surface-hover)] rounded-3xl text-center border border-[var(--border-subtle)] shadow-inner">
                      <p className="text-2xl font-bold text-[var(--ink)] tracking-tight">
                        {stats?.total_notes || 0}
                      </p>
                      <p className="text-[9px] font-bold text-[var(--ink-muted)] uppercase tracking-widest mt-1.5 opacity-60">
                        Hiddushim
                      </p>
                    </div>
                  </div>

                  <TrophyCase
                    tier={profile.tier}
                    level={stats?.current_level || 1}
                  />
                </div>

                {/* Biography Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <BookOpen
                      size={14}
                      className="text-[var(--accent-primary)]"
                      strokeWidth={2.5}
                    />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                      Scholarly Narrative
                    </h3>
                  </div>
                  <div className="paper-card p-8 bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 leading-relaxed text-sm font-normal text-[var(--ink-muted)]">
                    {profile.bio ||
                      "This scholar maintains the tradition of silence."}
                  </div>
                </div>
              </div>

              {/* Main Feed: Scholar Activity */}
              <div className="lg:col-span-8">
                <ProfileTabs />
              </div>
            </div>
          </div>
        )}

        {/* Edit Modes */}
        {activeTab === "edit" && isOwner && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <ProfileEditor
              profile={profile}
              onSave={(updated) => setProfile({ ...profile, ...updated })}
            />
          </div>
        )}

        {activeTab === "account" && isOwner && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <AccountSettings />
          </div>
        )}
      </main>

      {/* Global Brand Footer Overlay */}
      <footer className="fixed bottom-0 left-0 right-0 p-10 flex justify-center pointer-events-none z-0">
        <p className="text-[10px] font-medium uppercase tracking-[1.5em] text-[var(--ink-muted)] opacity-30">
          DrashX Identity v5.0
        </p>
      </footer>
    </div>
  );
}
