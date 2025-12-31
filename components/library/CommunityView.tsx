"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  BookOpen,
  Filter,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

/**
 * DrashX Community Market
 * Filepath: src/components/library/CommunityView.tsx
 * Role: Discovery layer for User Generated Content (UGC) and Groups.
 */

// --- Types ---

interface AuthorProfile {
  display_name: string;
  avatar_config?: { color: string; icon: string };
}

interface CommunityResource {
  id: string;
  title: string;
  type: "TRANSLATION" | "NOTEBOOK" | "PLAN";
  description: string | null;
  is_public: boolean;
  author_id: string;
  created_at: string;
  // Join fields
  author?: AuthorProfile;
  stats?: { adds: number; rating: number };
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  max_members: number;
  current_members?: number; // Made optional to handle raw DB fetch
  is_verified: boolean;
  active_plan_id?: string;
}

export const CommunityView = () => {
  const supabase = createClient();

  // State
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "GROUPS" | "RESOURCES"
  >("ALL");
  const [resources, setResources] = useState<CommunityResource[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    async function fetchCommunityData() {
      setLoading(true);
      try {
        // 1. Fetch Resources (Notebooks/Translations)
        // In a real app, you'd join with 'users' table here.
        // For MVP, we fetch basic resource data.
        const { data: resData, error: resError } = await supabase
          .from("user_resources")
          .select(
            `
            id, 
            title, 
            type, 
            description, 
            is_public, 
            created_at,
            author:user_id ( display_name )
          `
          ) // Supabase Join Syntax
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .limit(10);

        if (resError) throw resError;

        // 2. Fetch Groups
        // We'll simulate member count for now if group_members aggregation isn't ready
        const { data: groupData, error: groupError } = await supabase
          .from("groups")
          .select("id, name, description, max_members, is_verified")
          .limit(6);

        if (groupError) throw groupError;

        // Transform Data
        const formattedResources = (resData || []).map((r: any) => ({
          ...r,
          author: r.author, // Supabase returns joined data as an object or array
        }));

        // Transform Group Data (Add fallback for current_members)
        const formattedGroups = (groupData || []).map((g: any) => ({
          ...g,
          current_members: g.current_members || 0,
        }));

        setResources(formattedResources);
        setGroups(formattedGroups);
      } catch (err) {
        console.error("Community fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCommunityData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="animate-spin text-zinc-300" size={32} />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Scanning Community...
        </p>
      </div>
    );
  }

  // Filter Logic
  const showGroups = activeFilter === "ALL" || activeFilter === "GROUPS";
  const showResources = activeFilter === "ALL" || activeFilter === "RESOURCES";

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Controls / Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-zinc-200 shadow-sm">
          {(["ALL", "GROUPS", "RESOURCES"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                activeFilter === filter
                  ? "bg-zinc-900 text-white shadow-md"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative group w-full md:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900"
            size={14}
          />
          <input
            type="text"
            placeholder="Filter list..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
          />
        </div>
      </div>

      {/* --- GROUPS SECTION --- */}
      {showGroups && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Users className="text-zinc-400" size={18} />
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
              Open Chavrutas
            </h2>
          </div>

          {groups.length === 0 ? (
            <EmptyState label="No active groups found." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex flex-col justify-between group h-full"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      {/* Avatar Placeholder */}
                      <div className="w-12 h-12 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-zinc-200">
                        {group.name[0]?.toUpperCase() || "G"}
                      </div>
                      {group.is_verified && (
                        <div
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-full"
                          title="Verified Community"
                        >
                          <ShieldCheck size={16} />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-zinc-900 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                        {group.name || "Untitled Group"}
                      </h4>
                      <p className="text-xs text-zinc-500 line-clamp-2 min-h-[2.5em]">
                        {group.description ||
                          "A community dedicated to deep study and discussion."}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-wide border border-zinc-100">
                        <Users size={12} />
                        {Math.floor(Math.random() * group.max_members)} /{" "}
                        {group.max_members}
                      </span>
                    </div>
                  </div>

                  <button className="mt-6 w-full py-3 bg-white border-2 border-zinc-100 text-zinc-900 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all flex items-center justify-center gap-2">
                    Request to Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* --- RESOURCES SECTION --- */}
      {showResources && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="text-zinc-400" size={18} />
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
              Community Market
            </h2>
          </div>

          {resources.length === 0 ? (
            <EmptyState label="No community resources published yet." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all group h-full flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest",
                        res.type === "TRANSLATION"
                          ? "bg-blue-50 text-blue-600"
                          : res.type === "NOTEBOOK"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-emerald-50 text-emerald-600"
                      )}
                    >
                      {res.type}
                    </span>
                    {/* Mock verification/star for MVP */}
                    <div className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Star
                        size={16}
                        fill="currentColor"
                        className="opacity-50"
                      />
                    </div>
                  </div>

                  <h3 className="font-bold text-zinc-900 text-lg mb-1 group-hover:text-orange-600 transition-colors cursor-pointer">
                    {res.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-full bg-zinc-100 border border-zinc-200" />
                    <p className="text-xs font-medium text-zinc-500">
                      by{" "}
                      <span className="text-zinc-900 hover:underline cursor-pointer">
                        {res.author?.display_name || "Anonymous Scholar"}
                      </span>
                    </p>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 mb-6 flex-1">
                    {res.description ||
                      "No description provided for this resource."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-50 mt-auto">
                    <div className="flex items-center gap-3 text-zinc-400">
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
                        <Users size={12} /> 12
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
                        <MessageSquare size={12} /> 3
                      </span>
                    </div>
                    <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-white bg-orange-50 hover:bg-orange-600 px-3 py-2 rounded-lg transition-all">
                      <Plus size={12} strokeWidth={4} />
                      Add to Shelf
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

const EmptyState = ({ label }: { label: string }) => (
  <div className="w-full py-16 bg-zinc-50/50 border border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-center">
    <Filter className="text-zinc-300 mb-3" size={32} />
    <p className="text-sm font-medium text-zinc-400">{label}</p>
  </div>
);
