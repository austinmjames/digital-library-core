import { createClient } from "@/lib/supabase/server";
import {
  ChevronRight,
  Filter,
  PlusCircle,
  Search,
  Shield,
  Trophy,
  Users,
  Users2,
} from "lucide-react";
import Link from "next/link";

/**
 * Groups Discovery Hub (Chavrutot)
 * Filepath: app/groups/page.tsx
 * Role: The marketplace for communal scholarship.
 * PRD Reference: Section 4.1 (Social & Groups).
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
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {/* 1. Header Area */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase">
            Chavrutot
          </h1>
          <p className="text-zinc-500 italic font-serif text-lg opacity-80">
            &ldquo;Provide yourself a teacher and acquire for yourself a
            friend.&rdquo;
          </p>
        </div>

        <button className="flex items-center gap-3 px-8 py-4 bg-zinc-950 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all shadow-2xl active:scale-95">
          <PlusCircle size={16} className="text-amber-500" />
          Create New Circle
        </button>
      </header>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
          <input
            type="text"
            placeholder="Search verified institutions or local circles..."
            className="w-full pl-20 pr-8 py-6 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm focus:outline-none focus:ring-8 focus:ring-zinc-900/5 focus:border-zinc-300 text-xl transition-all placeholder:text-zinc-200"
          />
        </div>
        <button className="px-8 py-6 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm hover:bg-zinc-50 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* 3. Groups Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
            Discovery Feed
          </h2>
          <div className="flex gap-4">
            <button className="text-[10px] font-bold text-zinc-900 uppercase underline underline-offset-8 decoration-2">
              All Circles
            </button>
            <button className="text-[10px] font-bold text-zinc-400 uppercase hover:text-zinc-600 transition-colors">
              Verified Only
            </button>
            <button className="text-[10px] font-bold text-zinc-400 uppercase hover:text-zinc-600 transition-colors">
              My Groups
            </button>
          </div>
        </div>

        {error || !groups || groups.length === 0 ? (
          <div className="py-32 text-center space-y-6 bg-zinc-50/50 border-2 border-dashed border-zinc-100 rounded-[4rem]">
            <Users2 className="w-12 h-12 text-zinc-200 mx-auto" />
            <div className="max-w-xs mx-auto">
              <h3 className="text-xl font-black text-zinc-900 uppercase">
                Silence in the Hall
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">
                No active groups found. Be the pioneer and establish the first
                study circle.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="group p-8 bg-white border border-zinc-100 rounded-[3rem] shadow-sm hover:shadow-2xl hover:border-zinc-900/10 transition-all text-left flex flex-col justify-between min-h-[300px] relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-4 bg-zinc-50 rounded-2xl group-hover:bg-zinc-950 group-hover:text-white transition-all duration-500">
                      <Users size={24} />
                    </div>
                    {group.is_verified && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded-full border border-blue-100">
                        <Shield size={10} strokeWidth={3} />
                        Verified
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-zinc-900 line-clamp-1 tracking-tighter uppercase">
                    {group.name}
                  </h3>
                  <p className="text-sm text-zinc-500 mt-3 font-serif italic line-clamp-2 opacity-80 leading-relaxed">
                    {group.description}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-zinc-50 pt-6 relative z-10">
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Users size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {group.member_count?.[0]?.count || 0} Scholars
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-600/60">
                      <Trophy size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Active
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-zinc-200 group-hover:text-zinc-950 transition-all transform group-hover:translate-x-2"
                  />
                </div>

                {/* Leather binding visual accent */}
                <div className="absolute top-0 left-0 w-1.5 bg-zinc-950 h-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. Institutional Call to Action */}
      <footer className="pt-20 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="max-w-md">
          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-900 mb-2">
            Institutional Hosting
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            Are you a Rosh Yeshiva or Community Leader? Apply for institucional
            status to verify your circles and access advanced moderation tools.
          </p>
        </div>
        <button className="text-[10px] font-black text-blue-600 hover:text-blue-900 uppercase tracking-[0.2em] transition-colors border-b-2 border-blue-100 hover:border-blue-600 pb-1">
          Apply for Verification &rarr;
        </button>
      </footer>
    </div>
  );
}
