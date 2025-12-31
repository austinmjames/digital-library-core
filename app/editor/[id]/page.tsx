"use client";

import { useTranslations } from "@/lib/hooks/useTranslations";
import { UserNote, useUserNotes } from "@/lib/hooks/useUserNotes";
import { debounce } from "lodash";
import {
  ChevronLeft,
  Eye,
  Globe,
  LayoutGrid,
  Loader2,
  Lock,
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
 * Studio Page Orchestrator (v1.1 - Type Safe)
 * Filepath: app/editor/[id]/page.tsx
 * Role: Main entry point for editing Notebooks and Translations.
 * Fix: Resolved type error where Record<string, unknown> was assigned to string state.
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

      // Fix: Safely handle content which could be a TipTap Record or a String
      const rawContent = extendedNote.content;
      setContent(
        typeof rawContent === "string"
          ? rawContent
          : JSON.stringify(rawContent || {})
      );

      setIsPublic(extendedNote.is_public || false);
    }
  }, [note]);

  // 3. Debounced Persistence (PRD Performance Directive)
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
      <div className="h-screen flex flex-col items-center justify-center bg-paper gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          Opening Scriptorium...
        </p>
      </div>
    );

  return (
    <div className="h-screen w-full flex flex-col bg-paper overflow-hidden selection:bg-zinc-950 selection:text-white">
      {/* 1. Studio Header */}
      <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="h-8 w-px bg-zinc-100 mx-1" />
          <div className="flex flex-col">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm font-black text-zinc-900 bg-transparent border-none outline-none focus:ring-0 w-64 uppercase tracking-tight"
              placeholder="Untitled Insight..."
            />
            <div className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  saveNote.isPending
                    ? "bg-amber-400 animate-pulse"
                    : "bg-green-500"
                }`}
              />
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                {saveNote.isPending ? "Syncing..." : "Synced & Encrypted"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-100 p-1 rounded-xl gap-1 shadow-inner">
            <button
              onClick={() => setMode("NOTEBOOK")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === "NOTEBOOK"
                  ? "bg-white shadow-sm text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <Type size={14} /> Notebook
            </button>
            <button
              onClick={() => setMode("TRANSLATION")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === "TRANSLATION"
                  ? "bg-white shadow-sm text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <LayoutGrid size={14} /> Translation
            </button>
          </div>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              isPublic
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
            }`}
          >
            {isPublic ? <Globe size={14} /> : <Lock size={14} />}{" "}
            {isPublic ? "Public" : "Private"}
          </button>
          <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-all">
            <Share2 size={18} />
          </button>
        </div>
      </header>

      {/* 2. Main Studio Body */}
      <main className="flex-grow flex overflow-hidden">
        <WorkspaceSidebar />
        <div className="flex-grow overflow-y-auto relative bg-paper custom-scrollbar">
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

      {/* 3. Status Bar */}
      <footer className="h-10 border-t border-zinc-200 bg-white flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-6 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Layer: {mode}</span>
          </div>
          <span>Words: {wordCount}</span>
        </div>
        <button className="flex items-center gap-2 text-[9px] font-black text-zinc-400 hover:text-zinc-950 uppercase tracking-widest transition-colors">
          <Eye size={12} /> Focus Mode
        </button>
      </footer>
    </div>
  );
}
