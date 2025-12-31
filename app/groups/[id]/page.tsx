import { createClient } from "@/lib/supabase/server";
import { ArrowRight, BookOpen, Calendar, Settings, Shield } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Refactored Component Imports
import { DiscussionFeed } from "@/components/groups/DiscussionFeed";
import { GroupStats } from "@/components/groups/GroupStats";
import { JoinAction } from "@/components/groups/JoinAction";

/**
 * Group Detail Page (Orchestrator)
 * Filepath: app/groups/[id]/page.tsx
 * Role: Fetches group data and coordinates the layout.
 * PRD Alignment: Section 4.1 (Groups Architecture).
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
    <div className="min-h-screen bg-[#FAF9F6] selection:bg-zinc-950 selection:text-white">
      {/* Header Section */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase">
                  {group.name}
                </h1>
                {group.is_verified && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-full border border-blue-100 shadow-sm">
                    <Shield size={12} strokeWidth={3} />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-lg text-zinc-500 max-w-2xl font-serif italic leading-relaxed">
                {group.description}
              </p>
            </div>

            {isAdmin && (
              <button className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-400 hover:text-zinc-900 transition-all">
                <Settings size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">
            {/* Active Study Plan Hero */}
            <section className="bg-zinc-950 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <BookOpen className="text-amber-400" size={24} />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                      Current Track
                    </h2>
                    <h3 className="text-2xl font-bold">
                      {group.active_plan?.title || "No Active Plan"}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">
                      Portion
                    </p>
                    <p className="text-sm font-mono font-bold">
                      Dynamic Segments
                    </p>
                  </div>
                  <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">
                      Status
                    </p>
                    <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">
                      In Progress
                    </p>
                  </div>
                </div>

                <button className="w-full py-4 bg-white text-zinc-950 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-amber-400 transition-all">
                  Continue Study
                </button>
              </div>
              <Calendar className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-5 group-hover:scale-110 transition-transform duration-1000" />
            </section>

            {/* Discussion Feed (Refactored Component) */}
            <DiscussionFeed groupId={group.id} />
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl space-y-8">
              {/* Stats (Refactored Component) */}
              <GroupStats
                memberCount={memberCount}
                maxMembers={group.max_members}
              />

              {/* Action (Refactored Client Component) */}
              <JoinAction
                groupId={group.id}
                userId={user?.id}
                isMember={isMember}
              />
            </div>

            {/* Etiquette & Links */}
            <div className="p-8 bg-white border border-zinc-100 rounded-[2.5rem] space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Torah Etiquette
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-serif italic">
                Scholarship thrives on reference integrity. When sharing
                insights, always anchor them to a DrashRef.
              </p>
              <Link
                href="/library"
                className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-blue-600 group"
              >
                Reference Standards
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
