"use client";

import { useTranslations } from "@/lib/hooks/useTranslations";
import { UserNote, useUserNotes } from "@/lib/hooks/useUserNotes";
import { cn } from "@/lib/utils/utils";
import { debounce } from "lodash";
import {
  CheckCircle2,
  ChevronLeft,
  CloudUpload,
  Eye,
  Globe,
  LayoutGrid,
  Loader2,
  Lock,
  MoreVertical,
  Share2,
  Type,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

// Modular Imports
import { NotebookCanvas } from "@/components/editor/NotebookCanvas";
import { TranslationGrid } from "@/components/editor/TranslationGrid";
import { WorkspaceSidebar } from "@/components/editor/WorkspaceSidebar";

// Strict interface extension to handle metadata like 'title'
interface ExtendedUserNote extends UserNote {
  title?: string;
}

/**
 * Studio Page Orchestrator (v1.2.1 - Material Edition)
 * Filepath: app/editor/[id]/page.tsx
 * Role: Main entry point for editing Notebooks and Translations.
 * Style: Modern Google (Material 3). Non-italic, pill-based navigation.
 * Fix: Resolved invalid icon import 'CloudCheck'.
 */

export default function StudioPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();

  // 1. Data Hooks
  const { note, isLoading: noteLoading, saveNote } = useUserNotes(id);
  const [mode, setMode] = useState<"NOTEBOOK" | "TRANSLATION">("NOTEBOOK");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const {
    segments,
    saveSegment,
    isLoading: transLoading,
  } = useTranslations(note?.ref || null);

  // 2. State Sync Logic
  useEffect(() => {
    if (note) {
      const extendedNote = note as ExtendedUserNote;
      setTitle(extendedNote.title || "Untitled Insight");

      const rawContent = extendedNote.content;
      setContent(
        typeof rawContent === "string"
          ? rawContent
          : JSON.stringify(rawContent || {})
      );

      setIsPublic(extendedNote.is_public || false);
    }
  }, [note]);

  // 3. Debounced Persistence
  const debouncedSave = useMemo(
    () =>
      debounce((newContent: string) => {
        saveNote.mutate({ content: newContent });
      }, 2000),
    [saveNote]
  );

  const handleContentChange = useCallback(
    (html: string) => {
      setContent(html);
      debouncedSave(html);
    },
    [debouncedSave]
  );

  const wordCount = useMemo(() => {
    return content
      .replace(/<[^>]*>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
  }, [content]);

  if (noteLoading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[var(--paper)] gap-4">
        <Loader2
          className="w-10 h-10 animate-spin text-[var(--accent-primary)]"
          strokeWidth={2}
        />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ink-muted)]">
          Opening Scriptorium...
        </p>
      </div>
    );

  return (
    <div className="h-screen w-full flex flex-col bg-[var(--paper)] overflow-hidden selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      {/* 1. Studio Header: High-Clarity Material Layout */}
      <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--paper)]/95 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-5">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[var(--surface-hover)] rounded-full transition-all text-[var(--ink-muted)] hover:text-[var(--ink)] active:scale-95"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          <div className="flex flex-col">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm font-bold text-[var(--ink)] bg-transparent border-none outline-none focus:ring-0 w-64 tracking-tight"
              placeholder="Untitled Insight..."
            />
            <div className="flex items-center gap-2">
              {saveNote.isPending ? (
                <CloudUpload
                  size={10}
                  className="text-blue-500 animate-pulse"
                />
              ) : (
                <CheckCircle2
                  size={10}
                  className="text-[var(--accent-success)]"
                />
              )}
              <span className="text-[9px] font-bold text-[var(--ink-muted)] uppercase tracking-wider">
                {saveNote.isPending ? "Synchronizing" : "Encrypted & Saved"}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Mode Switcher Chips */}
        <nav className="hidden md:flex items-center bg-[var(--surface-hover)] p-1 rounded-full border border-[var(--border-subtle)]">
          <button
            onClick={() => setMode("NOTEBOOK")}
            className={cn(
              "flex items-center gap-2 px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all",
              mode === "NOTEBOOK"
                ? "bg-white text-[var(--accent-primary)] shadow-sm border border-[var(--border-subtle)]/50"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
            )}
          >
            <Type size={14} strokeWidth={2.5} /> Notebook
          </button>
          <button
            onClick={() => setMode("TRANSLATION")}
            className={cn(
              "flex items-center gap-2 px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all",
              mode === "TRANSLATION"
                ? "bg-white text-[var(--accent-primary)] shadow-sm border border-[var(--border-subtle)]/50"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
            )}
          >
            <LayoutGrid size={14} strokeWidth={2.5} /> Translation
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all active:scale-95",
              isPublic
                ? "border-blue-100 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30"
                : "border-[var(--border-subtle)] text-[var(--ink-muted)] hover:bg-[var(--surface-hover)]"
            )}
          >
            {isPublic ? (
              <Globe size={14} strokeWidth={2.5} />
            ) : (
              <Lock size={14} strokeWidth={2.5} />
            )}
            {isPublic ? "Public" : "Private"}
          </button>

          <div className="h-4 w-px bg-[var(--border-subtle)] mx-1" />

          <button className="p-2 text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)] rounded-full transition-all">
            <Share2 size={18} strokeWidth={2} />
          </button>
          <button className="p-2 text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)] rounded-full transition-all">
            <MoreVertical size={18} strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* 2. Main Studio Body */}
      <main className="flex-grow flex overflow-hidden">
        <WorkspaceSidebar />
        <div className="flex-grow overflow-y-auto relative bg-[var(--paper)] custom-scrollbar">
          {mode === "NOTEBOOK" ? (
            <NotebookCanvas content={content} onChange={handleContentChange} />
          ) : (
            <TranslationGrid
              segments={segments}
              saveSegment={saveSegment}
              isLoading={transLoading}
              sourceRef={note?.ref}
            />
          )}
        </div>
      </main>

      {/* 3. Status Bar: Minimal Metadata */}
      <footer className="h-9 border-t border-[var(--border-subtle)] bg-[var(--paper)] flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-8 text-[9px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full shadow-sm",
                mode === "NOTEBOOK" ? "bg-blue-500" : "bg-emerald-500"
              )}
            />
            <span>Workspace: {mode}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--ink)]">{wordCount}</span>
            <span>Words Logged</span>
          </div>
        </div>

        <button className="flex items-center gap-2 text-[9px] font-bold text-[var(--ink-muted)] hover:text-[var(--accent-primary)] uppercase tracking-widest transition-colors">
          <Eye size={12} strokeWidth={2.5} /> Focus Studio
        </button>
      </footer>
    </div>
  );
}
