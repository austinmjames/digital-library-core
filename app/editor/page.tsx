"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import {
  BookText,
  ChevronRight,
  Clock,
  Inbox,
  Languages,
  Loader2,
  MoreHorizontal,
  PlusCircle,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Editor Workspace Manager (Scriptorium)
 * Filepath: app/editor/page.tsx
 * Role: Index page for project discovery and creation.
 * PRD Alignment: Section 2.3 (Knowledge Management - user_resources)
 * Update: Resolved module resolution and hook property errors.
 */

interface WorkspaceItem {
  id: string;
  title: string;
  type: "NOTEBOOK" | "TRANSLATION";
  updated_at: string;
  description?: string;
}

export default function EditorIndexPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchWorkspaces = async () => {
      setLoading(true);
      // Query user_resources as per PRD Knowledge Management loop
      const { data, error: fetchError } = await supabase
        .from("user_resources")
        .select("id, title, type, updated_at, description")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (fetchError) {
        console.error("[Studio] Failed to load resources:", fetchError.message);
      }

      if (data) {
        setWorkspaces(data as WorkspaceItem[]);
      }
      setLoading(false);
    };

    fetchWorkspaces();
  }, [user, supabase]);

  const createNewProject = async (type: "NOTEBOOK" | "TRANSLATION") => {
    if (!user) return;
    setIsCreating(true);

    const { data, error: insertError } = await supabase
      .from("user_resources")
      .insert({
        user_id: user.id,
        type: type,
        title: `Untitled ${type === "NOTEBOOK" ? "Notebook" : "Translation"}`,
        content: type === "NOTEBOOK" ? {} : [],
      })
      .select()
      .single();

    if (!insertError && data) {
      router.push(`/editor/${data.id}`);
    } else {
      console.error("[Studio] Resource creation failed:", insertError?.message);
      setIsCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-paper gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-950 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
          Entering the Scriptorium...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {/* 1. Header Area */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-zinc-900 tracking-tighter">
            Studio
          </h1>
          <p className="text-zinc-500 italic font-serif text-lg opacity-80">
            &ldquo;One who writes down their learning, it is as if they have
            received it from Sinai.&rdquo;
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => createNewProject("NOTEBOOK")}
            disabled={isCreating}
            className="flex items-center gap-3 px-8 py-4 bg-zinc-950 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
          >
            <BookText size={16} className="text-amber-500" />
            New Notebook
          </button>
          <button
            onClick={() => createNewProject("TRANSLATION")}
            disabled={isCreating}
            className="flex items-center gap-3 px-8 py-4 bg-white border border-zinc-200 text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Languages size={16} className="text-blue-500" />
            New Translation
          </button>
        </div>
      </header>

      {/* 2. Global Search Tool */}
      <div className="relative group">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
        <input
          type="text"
          placeholder="Search manuscripts, projects, or draft titles..."
          className="w-full pl-20 pr-8 py-6 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm focus:outline-none focus:ring-8 focus:ring-zinc-900/5 focus:border-zinc-300 text-xl transition-all placeholder:text-zinc-200"
        />
      </div>

      {/* 3. Projects Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
            Active Manuscripts
          </h2>
          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
            {workspaces.length} Total Projects
          </span>
        </div>

        {workspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workspaces.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(`/editor/${item.id}`)}
                className="group p-8 bg-white border border-zinc-100 rounded-[3rem] shadow-sm hover:shadow-2xl hover:border-zinc-900/10 transition-all text-left flex flex-col justify-between min-h-[280px] relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-4 bg-zinc-50 rounded-2xl group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                      {item.type === "TRANSLATION" ? (
                        <Languages className="w-6 h-6" />
                      ) : (
                        <BookText className="w-6 h-6" />
                      )}
                    </div>
                    <button className="p-2 text-zinc-200 hover:text-zinc-500 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  <h3 className="text-xl font-black text-zinc-900 line-clamp-2 tracking-tight leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 font-medium line-clamp-2">
                    {item.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-zinc-50 pt-6 relative z-10">
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Synced {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-zinc-200 group-hover:text-zinc-950 transition-all transform group-hover:translate-x-2"
                  />
                </div>

                {/* Visual Decoration for 'Leather Binding' feel */}
                <div className="absolute top-0 right-0 w-1 bg-zinc-950 h-full opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
            ))}

            <button
              onClick={() => createNewProject("NOTEBOOK")}
              className="border-4 border-dashed border-zinc-50 rounded-[3rem] flex flex-col items-center justify-center p-10 text-zinc-200 hover:border-zinc-900/10 hover:text-zinc-900 hover:bg-zinc-50/50 transition-all gap-5 group"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlusCircle size={32} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Initialize Manuscript
              </span>
            </button>
          </div>
        ) : (
          <div className="py-32 text-center space-y-8 bg-zinc-50/50 border-2 border-dashed border-zinc-100 rounded-[4rem]">
            <div className="w-24 h-24 bg-white rounded-full shadow-inner flex items-center justify-center mx-auto">
              <Inbox className="w-10 h-10 text-zinc-100" />
            </div>
            <div className="max-w-xs mx-auto">
              <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
                Scriptorium Empty
              </h3>
              <p className="text-xs text-zinc-400 mt-3 leading-relaxed font-medium">
                Begin your scholarly journey by creating your first notebook or
                translation project.
              </p>
              <button
                onClick={() => createNewProject("NOTEBOOK")}
                className="mt-8 px-8 py-3 bg-zinc-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95"
              >
                Create First Work
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. Footer Metadata */}
      <footer className="pt-20 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
        <div className="flex items-center gap-5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900">
            Studio Engine v5.1
          </span>
        </div>
        <div className="flex items-center gap-10">
          <button className="text-[9px] font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-[0.2em] transition-colors">
            Archive Policies
          </button>
          <button className="text-[9px] font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-[0.2em] transition-colors">
            Terms of Scholarship
          </button>
        </div>
      </footer>
    </div>
  );
}
