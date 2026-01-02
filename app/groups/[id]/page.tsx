import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Info,
  Settings,
  Share2,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Refactored Component Imports
import { DiscussionFeed } from "@/components/groups/DiscussionFeed";
import { GroupStats } from "@/components/groups/GroupStats";
import { JoinAction } from "@/components/groups/JoinAction";

/**
 * Group Detail Page (Orchestrator v2.0)
 * Filepath: app/groups/[id]/page.tsx
 * Role: Fetches group data and coordinates the layout.
 * Style: Modern Google (Material 3). Non-italic, high-clarity architectural layout.
 */

interface GroupPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: GroupPageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { data: group } = await supabase
    .from("groups")
    .select("name")
    .eq("id", params.id)
    .single();

  return {
    title: group ? `${group.name} | DrashX` : "Study Group",
  };
}

export default async function GroupPage({ params }: GroupPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch Group with Joined Study Plan and Member Count
  const { data: group, error } = await supabase
    .from("groups")
    .select(
      `
      *,
      active_plan:study_plans (id, title, type),
      member_count:group_members(count)
    `
    )
    .eq("id", params.id)
    .single();

  if (error || !group) notFound();

  // 2. Check User Membership Status
  const { data: membership } = user
    ? await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", params.id)
        .eq("user_id", user.id)
        .single()
    : { data: null };

  const isMember = !!membership;
  const isAdmin =
    membership?.role === "admin" || membership?.role === "teacher";
  const memberCount = group.member_count?.[0]?.count || 0;

  return (
    <div className="min-h-screen bg-[var(--paper)] selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      {/* 1. Header Section: High-Clarity sticky header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--paper)]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Link
                  href="/groups"
                  className="p-2 hover:bg-[var(--surface-hover)] rounded-full text-[var(--ink-muted)] transition-all active:scale-95"
                >
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
                  {group.name}
                </h1>
                {group.is_verified && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase rounded-full border border-blue-100 dark:border-blue-900/30">
                    <CheckCircle2 size={12} strokeWidth={2.5} />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--ink-muted)] max-w-2xl font-normal leading-relaxed pl-12 border-l border-[var(--border-subtle)]">
                {group.description}
              </p>
            </div>

            <div className="flex items-center gap-3 pl-12 md:pl-0">
              <button className="p-2 text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)] rounded-full transition-all">
                <Share2 size={20} strokeWidth={2} />
              </button>
              {isAdmin && (
                <button className="p-2.5 bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--ink-muted)] hover:text-[var(--ink)] transition-all shadow-sm">
                  <Settings size={20} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">
            {/* Active Study Plan Hero: Material Highlight Style */}
            <section className="bg-zinc-900 dark:bg-zinc-800 text-white rounded-[2rem] p-10 shadow-lg relative overflow-hidden group border border-zinc-800">
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                    <BookOpen
                      className="text-white"
                      size={24}
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 mb-1 leading-none">
                      Current Track
                    </h2>
                    <h3 className="text-2xl font-bold tracking-tight">
                      {group.active_plan?.title || "Registry Standby"}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">
                      Active Portion
                    </p>
                    <p className="text-sm font-medium tracking-tight">
                      Dynamic Segments
                    </p>
                  </div>
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">
                      Sync Status
                    </p>
                    <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-success)]">
                      In Progress
                    </p>
                  </div>
                </div>

                <button className="btn-primary w-full py-4 text-xs tracking-widest font-bold">
                  CONTINUE STUDY SESSION
                </button>
              </div>
              <Calendar className="absolute -bottom-12 -right-12 w-64 h-64 text-white opacity-5 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-1000" />
            </section>

            {/* Discussion Feed Container */}
            <div className="space-y-6">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--ink-muted)] pl-2">
                Scholarship Exchange
              </h2>
              <DiscussionFeed groupId={group.id} />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Stats & Actions Card */}
            <div className="paper-card p-8 space-y-8 shadow-sm">
              <GroupStats
                memberCount={memberCount}
                maxMembers={group.max_members}
              />

              <div className="pt-6 border-t border-[var(--border-subtle)]">
                <JoinAction
                  groupId={group.id}
                  userId={user?.id}
                  isMember={isMember}
                />
              </div>
            </div>

            {/* Etiquette & Links Card */}
            <div className="paper-card p-8 space-y-6">
              <div className="flex items-center gap-2">
                <Info
                  size={14}
                  className="text-[var(--accent-primary)]"
                  strokeWidth={2.5}
                />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                  Canonical Etiquette
                </h3>
              </div>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed font-normal">
                Scholarship thrives on reference integrity. When sharing
                insights, always anchor them to a DrashRef within the library.
              </p>
              <Link
                href="/library"
                className="flex items-center justify-between p-3.5 bg-[var(--surface-hover)] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)] group transition-all"
              >
                Reference Standards
                <ArrowRight
                  size={14}
                  strokeWidth={2.5}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer Meta */}
      <footer className="fixed bottom-0 left-0 right-0 p-10 flex justify-center pointer-events-none z-0">
        <p className="text-[10px] font-medium uppercase tracking-[1.5em] text-[var(--ink-muted)] opacity-30">
          DrashX Social v2.0
        </p>
      </footer>
    </div>
  );
}
