"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  ArrowRight,
  Bell,
  BookText,
  Clock,
  Inbox,
  Languages,
  Library,
  Loader2,
  MoreHorizontal,
  PlusCircle,
  Search,
  UserCircle,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Editor Workspace Manager (Scriptorium v7.0.1)
 * Filepath: app/editor/page.tsx
 * Role: Index page for project discovery, filtering, and creation.
 * Aesthetic: Modern Google (Material 3). Clean, non-italic, high-clarity.
 */

type ProjectType = "ALL" | "NOTEBOOK" | "TRANSLATION";

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
  const [filter, setFilter] = useState<ProjectType>("ALL");

  useEffect(() => {
    if (!user) return;

    const fetchWorkspaces = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("user_resources")
        .select("id, title, type, updated_at, description")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (fetchError)
        console.error("[Scriptorium] Load failed:", fetchError.message);
      if (data) setWorkspaces(data as WorkspaceItem[]);
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
      console.error("[Scriptorium] Creation failed:", insertError?.message);
      setIsCreating(false);
    }
  };

  const filteredWorkspaces = workspaces.filter(
    (w) => filter === "ALL" || w.type === filter
  );

  if (authLoading || loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[var(--paper)] text-[var(--ink-muted)] gap-4">
        <Loader2
          className="animate-spin text-[var(--accent-primary)]"
          size={36}
          strokeWidth={2}
        />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em]">
          Initializing Studio...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans transition-colors duration-300">
      {/* Google-Style Navigation Header */}
      <header className="sticky top-0 z-30 bg-[var(--paper)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] pt-6 pb-2 px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-12">
            <div className="flex items-center gap-4 shrink-0">
              <div className="p-2.5 bg-[var(--ink)] rounded-xl text-white shadow-sm transition-transform active:scale-95">
                <BookText size={20} strokeWidth={2} />
              </div>
              <div className="hidden lg:block">
                <h1 className="text-lg font-bold tracking-tight text-[var(--ink)] uppercase leading-none">
                  Studio{" "}
                  <span className="text-[var(--ink-muted)] font-medium">
                    Workspace
                  </span>
                </h1>
              </div>
            </div>

            {/* Global Search Centerpiece */}
            <div className="flex-1 max-2-2xl group">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search your notebooks, translations, or drafts..."
                  className="architect-input w-full pl-11 pr-16"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-1.5 py-0.5 bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded text-[10px] font-bold text-[var(--ink-muted)] pointer-events-none">
                  <span className="text-[9px] opacity-60 uppercase">⌘</span>K
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 shrink-0">
              <button className="text-[var(--ink-muted)] hover:text-[var(--ink)] p-2 hover:bg-[var(--surface-hover)] rounded-full transition-colors">
                <Bell size={18} strokeWidth={2} />
              </button>
              <div className="w-8 h-8 bg-[var(--surface-hover)] rounded-full flex items-center justify-center text-[var(--ink-muted)] border border-[var(--border-subtle)]">
                <UserCircle size={20} />
              </div>
            </div>
          </div>

          {/* Filter Chips Layer */}
          <nav className="flex items-center justify-center pb-2">
            <div className="nav-pill-container">
              {[
                { id: "ALL", label: "All Projects", icon: Library },
                { id: "NOTEBOOK", label: "Notebooks", icon: BookText },
                { id: "TRANSLATION", label: "Translations", icon: Languages },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as ProjectType)}
                  className={cn(
                    "nav-pill-item",
                    filter === tab.id && "nav-pill-active"
                  )}
                >
                  <tab.icon
                    size={13}
                    strokeWidth={filter === tab.id ? 2.5 : 2}
                  />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="max-w-7xl mx-auto px-6 py-12 pb-40">
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-700">
          {/* Header Introduction */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--border-subtle)] pb-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-medium tracking-tight">
                Project Management
              </h2>
              <p className="text-sm font-normal text-[var(--ink-muted)] max-w-xl border-l-2 border-[var(--accent-primary)]/20 pl-6 leading-relaxed">
                One who writes down their learning, it is as if they have
                received it from Sinai. Continue developing your personal canon.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => createNewProject("NOTEBOOK")}
                disabled={isCreating}
                className="btn-primary"
              >
                <PlusCircle size={16} strokeWidth={2.5} />
                New Notebook
              </button>
              <button
                onClick={() => createNewProject("TRANSLATION")}
                disabled={isCreating}
                className="btn-secondary"
              >
                <Languages size={16} />
                New Translation
              </button>
            </div>
          </div>

          {/* Manuscript Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--ink-muted)] leading-none">
                Active Manuscripts
              </h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">
                <Zap size={10} fill="currentColor" className="text-amber-500" />
                <span>{workspaces.length} Works Ready</span>
              </div>
            </div>

            {filteredWorkspaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredWorkspaces.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/editor/${item.id}`)}
                    className="paper-card paper-card-hover group p-8 flex flex-col justify-between min-h-[240px] cursor-pointer"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div
                          className={cn(
                            "p-2.5 rounded-xl transition-transform group-hover:scale-105 shadow-sm",
                            item.type === "NOTEBOOK"
                              ? "bg-blue-600 text-white"
                              : "bg-emerald-600 text-white"
                          )}
                        >
                          {item.type === "TRANSLATION" ? (
                            <Languages size={18} strokeWidth={2.5} />
                          ) : (
                            <BookText size={18} strokeWidth={2.5} />
                          )}
                        </div>
                        <button
                          className="p-2 hover:bg-[var(--surface-hover)] rounded-full transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreHorizontal
                            size={16}
                            className="text-[var(--ink-muted)] group-hover:text-[var(--ink)]"
                          />
                        </button>
                      </div>
                      <h4 className="text-xl font-medium text-[var(--ink)] tracking-tight line-clamp-2 leading-tight mb-2">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[var(--ink-muted)] leading-relaxed line-clamp-2">
                        {item.description || "No project overview provided."}
                      </p>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-[var(--border-subtle)] pt-5">
                      <div className="flex items-center gap-2 text-[var(--ink-muted)]">
                        <Clock size={12} strokeWidth={2.5} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Edited{" "}
                          {new Date(item.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <ArrowRight
                        size={14}
                        strokeWidth={2.5}
                        className="text-[var(--border-subtle)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </div>
                ))}

                {/* Create First Project Empty Slot */}
                <button
                  onClick={() => createNewProject("NOTEBOOK")}
                  className="paper-card border-2 border-dashed border-[var(--border-subtle)] rounded-2xl flex flex-col items-center justify-center p-10 text-[var(--ink-muted)] hover:border-[var(--accent-primary)] hover:bg-[var(--surface-hover)] transition-all gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--surface-hover)] flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-[var(--accent-primary)] transition-all shadow-sm">
                    <PlusCircle size={24} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    New Notebook
                  </span>
                </button>
              </div>
            ) : (
              <div className="py-24 text-center space-y-8 paper-card bg-white/50 border-dashed border-2">
                <div className="w-16 h-16 bg-[var(--surface-hover)] rounded-full flex items-center justify-center mx-auto text-[var(--border-subtle)] shadow-sm">
                  <Inbox className="w-8 h-8" />
                </div>
                <div className="max-w-xs mx-auto space-y-2">
                  <h4 className="text-lg font-bold text-[var(--ink)] uppercase tracking-tight">
                    Studio Empty
                  </h4>
                  <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                    Begin your scholarly journey by initializing your first
                    translation or study notebook.
                  </p>
                </div>
                <button
                  onClick={() => createNewProject("NOTEBOOK")}
                  className="btn-primary mx-auto"
                >
                  Create First Work
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Global Studio Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-10 flex justify-center pointer-events-none z-0">
        <p className="text-[10px] font-medium uppercase tracking-[1.5em] text-[var(--ink-muted)] opacity-30">
          DrashX Studio v7.0.1
        </p>
      </footer>
    </div>
  );
}
