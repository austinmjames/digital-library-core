import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Filter,
  Library,
  PlusCircle,
  Search,
  Trophy,
  Users,
  Users2,
} from "lucide-react";
import Link from "next/link";

/**
 * Groups Discovery Hub (Chavrutot v2.0)
 * Filepath: app/groups/page.tsx
 * Role: The marketplace for communal scholarship.
 * Style: Modern Google (Material 3). Clean, non-italic, architectural layout.
 */

export default async function GroupsIndexPage() {
  const supabase = await createClient();

  // 1. Fetch all public groups with member counts
  const { data: groups, error } = await supabase
    .from("groups")
    .select(
      `
      *,
      member_count:group_members(count)
    `
    )
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--paper)] selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300 pb-32">
      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-12 animate-in fade-in duration-700">
        {/* 1. Header Area: High-Clarity Introduction */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--border-subtle)] pb-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-[var(--ink)] tracking-tight">
              Chavrutot
            </h1>
            <p className="text-[var(--ink-muted)] font-normal text-lg max-w-xl border-l-2 border-[var(--accent-primary)]/20 pl-6 leading-relaxed">
              Provide yourself a teacher and acquire for yourself a friend.
              Engage with the global network of scholars.
            </p>
          </div>

          <button className="btn-primary px-8 py-4 text-xs tracking-widest shadow-lg shadow-blue-500/20">
            <PlusCircle size={18} strokeWidth={2.5} />
            CREATE NEW CIRCLE
          </button>
        </header>

        {/* 2. Search & Filter Bar: Standardized Input Style */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative group flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ink-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
            <input
              type="text"
              placeholder="Search verified institutions or local study circles..."
              className="architect-input w-full pl-16 py-6 text-lg"
            />
          </div>
          <button className="btn-secondary px-8 py-6 border-[var(--border-subtle)] group">
            <Filter
              size={18}
              className="text-[var(--ink-muted)] group-hover:text-[var(--accent-primary)] transition-colors"
            />
            Refine Feed
          </button>
        </div>

        {/* 3. Groups Grid & Feed Controls */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
            <h2 className="text-[11px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.25em]">
              Discovery Feed
            </h2>

            {/* Filter Pill Navigation */}
            <nav className="flex items-center bg-[var(--surface-hover)] p-1 rounded-full border border-[var(--border-subtle)]">
              <button className="nav-pill-item nav-pill-active px-6">
                All Circles
              </button>
              <button className="nav-pill-item px-6">Verified</button>
              <button className="nav-pill-item px-6">My Groups</button>
            </nav>
          </div>

          {error || !groups || groups.length === 0 ? (
            <div className="py-32 text-center space-y-8 paper-card border-dashed border-2 bg-white/50">
              <Users2 className="w-16 h-16 text-[var(--border-subtle)] mx-auto" />
              <div className="max-w-xs mx-auto space-y-2">
                <h3 className="text-xl font-bold text-[var(--ink)] uppercase tracking-tight">
                  Silence in the Hall
                </h3>
                <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                  No active groups identified in this branch. Be the pioneer and
                  establish the first study circle.
                </p>
              </div>
              <button className="btn-primary mx-auto">Establish Circle</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="paper-card paper-card-hover group p-8 text-left flex flex-col justify-between min-h-[280px] relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-8">
                      <div className="p-3 bg-[var(--surface-hover)] rounded-2xl text-[var(--ink)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all duration-500 shadow-sm">
                        <Users size={22} strokeWidth={2} />
                      </div>
                      {group.is_verified && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[9px] font-bold uppercase rounded-full border border-blue-100 dark:border-blue-900/30">
                          <CheckCircle2 size={12} strokeWidth={2.5} />
                          Verified
                        </div>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-[var(--ink)] line-clamp-1 tracking-tight">
                      {group.name}
                    </h3>
                    <p className="text-sm text-[var(--ink-muted)] mt-3 font-normal line-clamp-2 leading-relaxed">
                      {group.description}
                    </p>
                  </div>

                  <div className="mt-10 flex items-center justify-between border-t border-[var(--border-subtle)] pt-6 relative z-10">
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2 text-[var(--ink-muted)]">
                        <Users size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {group.member_count?.[0]?.count || 0} Scholars
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                        <Trophy size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Active
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      strokeWidth={2.5}
                      className="text-[var(--border-subtle)] group-hover:text-[var(--ink)] transition-all transform group-hover:translate-x-1"
                    />
                  </div>

                  {/* High-visibility active border accent */}
                  <div className="absolute top-0 left-0 w-1 bg-[var(--accent-primary)] h-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 4. Institutional Call to Action: Material Highlight Card */}
        <footer className="pt-20 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-lg space-y-4">
            <div className="flex items-center gap-3 text-[var(--accent-primary)]">
              <Library size={24} strokeWidth={2} />
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--ink)]">
                Institutional Integration
              </h4>
            </div>
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed font-normal">
              Are you a Rosh Yeshiva or Community Leader? Apply for
              institutional status to verify your study circles, access advanced
              moderation tools, and sync with the global registry.
            </p>
          </div>
          <button className="btn-secondary group px-10 py-4 border-[var(--border-subtle)] shadow-none">
            APPLY FOR VERIFICATION
            <ArrowRight
              size={16}
              strokeWidth={2.5}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </footer>
      </div>

      {/* Global Brand Footer Overlay */}
      <footer className="fixed bottom-0 left-0 right-0 p-10 flex justify-center pointer-events-none z-0">
        <p className="text-[10px] font-medium uppercase tracking-[1.5em] text-[var(--ink-muted)] opacity-30">
          DrashX Registry v2.0
        </p>
      </footer>
    </div>
  );
}
