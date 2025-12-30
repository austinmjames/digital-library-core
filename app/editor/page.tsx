"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
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
 * Editor Workspace Manager
 * Filepath: app/editor/page.tsx
 * Role: The index page for the Studio. Handles project discovery and creation.
 * Updates: Resolved linting errors by adding strict typing and handling unused variables.
 */

interface WorkspaceContent {
  type: "NOTEBOOK" | "TRANSLATION";
  title: string;
  body: string;
}

interface WorkspaceItem {
  id: string;
  title: string;
  updated_at: string;
  ref: string;
  content: WorkspaceContent;
}

export default function EditorIndexPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchWorkspaces = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("user_notes")
        .select("id, ref, content, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (fetchError) {
        console.error(
          "[Studio] Failed to load workspaces:",
          fetchError.message
        );
      }

      if (data) {
        // Map raw DB response to typed WorkspaceItem objects
        const mapped: WorkspaceItem[] = data.map((item) => {
          const content = item.content as unknown as WorkspaceContent;
          return {
            id: item.id,
            title: content?.title || "Untitled Insight",
            updated_at: item.updated_at || new Date().toISOString(),
            ref: item.ref,
            content: content,
          };
        });
        setWorkspaces(mapped);
      }
      setLoading(false);
    };

    fetchWorkspaces();
  }, [user]);

  const createNewProject = async (type: "NOTEBOOK" | "TRANSLATION") => {
    if (!user) return;
    setIsCreating(true);

    const newId = crypto.randomUUID();
    const { error: insertError } = await supabase.from("user_notes").insert({
      id: newId,
      user_id: user.id,
      ref: "General", // Default anchor
      content: { type, title: `New ${type.toLowerCase()}`, body: "" },
    });

    if (!insertError) {
      router.push(`/editor/${newId}`);
    } else {
      console.error("[Studio] Project creation failed:", insertError.message);
      setIsCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-paper gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600 opacity-40" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          Opening your Scriptorium...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* 1. Header Area */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">
            Studio
          </h1>
          <p className="text-zinc-500 italic">
            Manage your notebooks, translations, and personal scholarship.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => createNewProject("NOTEBOOK")}
            disabled={isCreating}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-[11px] font-bold uppercase rounded-2xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 disabled:opacity-50"
          >
            <BookText size={16} />
            New Notebook
          </button>
          <button
            onClick={() => createNewProject("TRANSLATION")}
            disabled={isCreating}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 text-zinc-600 text-[11px] font-bold uppercase rounded-2xl hover:bg-zinc-50 transition-all"
          >
            <Languages size={16} />
            New Translation
          </button>
        </div>
      </header>

      {/* 2. Quick Search & Stats */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-amber-500 transition-colors" />
        <input
          type="text"
          placeholder="Search your insights, refs, or titles..."
          className="w-full pl-16 pr-8 py-5 bg-white border border-zinc-100 rounded-[2rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-200 text-lg transition-all"
        />
      </div>

      {/* 3. Projects Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            Recent Workflows
          </h2>
          <span className="text-[10px] text-zinc-300 font-medium">
            {workspaces.length} Total Projects
          </span>
        </div>

        {workspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(`/editor/${item.id}`)}
                className="group p-6 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-amber-200 transition-all text-left flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-zinc-50 rounded-2xl group-hover:bg-amber-50 transition-colors">
                      {item.content?.type === "TRANSLATION" ? (
                        <Languages className="w-6 h-6 text-zinc-400 group-hover:text-amber-600" />
                      ) : (
                        <BookText className="w-6 h-6 text-zinc-400 group-hover:text-amber-600" />
                      )}
                    </div>
                    <button className="p-1.5 text-zinc-200 hover:text-zinc-500 transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {item.ref}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-zinc-200" />
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {item.content?.type || "Notebook"}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-zinc-50 pt-4">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">
                      Edited {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-zinc-200 group-hover:text-amber-500 transition-all transform group-hover:translate-x-1"
                  />
                </div>
              </button>
            ))}

            {/* Empty State Call to Action */}
            <button
              onClick={() => createNewProject("NOTEBOOK")}
              className="border-2 border-dashed border-zinc-100 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-zinc-300 hover:border-amber-200 hover:text-amber-500 hover:bg-amber-50/10 transition-all gap-4 group"
            >
              <PlusCircle
                size={32}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                Add New Manuscript
              </span>
            </button>
          </div>
        ) : (
          <div className="py-24 text-center space-y-6 bg-white border border-zinc-100 rounded-[3rem]">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
              <Inbox className="w-8 h-8 text-zinc-200" />
            </div>
            <div className="max-w-xs mx-auto">
              <h3 className="font-bold text-zinc-900">
                Your Scriptorium is empty
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Begin your scholarly journey by creating your first notebook or
                translation project.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 4. Bottom Market Promo (Phase 6 scale strategy) */}
      <footer className="pt-12 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4 text-zinc-300">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Studio Engine v4.0
          </span>
        </div>
        <button className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest flex items-center gap-2">
          View Archive Policies & Privacy
          <ChevronRight size={12} />
        </button>
      </footer>
    </div>
  );
}
