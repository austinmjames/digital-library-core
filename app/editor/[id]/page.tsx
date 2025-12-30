"use client";

import { TipTapEditor } from "@/components/editor/TipTapEditor";
import {
  TranslationSegment,
  useTranslations,
} from "@/lib/hooks/useTranslations";
import { useUserNotes } from "@/lib/hooks/useUserNotes";
import { debounce } from "lodash";
import {
  CheckCircle2,
  ChevronLeft,
  Eye,
  Globe,
  Hash,
  History,
  LayoutGrid,
  Loader2,
  Lock,
  Plus,
  PlusCircle,
  Share2,
  Type,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Notebook Workspace Page (v4.8 - Strictly Typed)
 * Filepath: app/editor/[id]/page.tsx
 * Role: Production-ready Studio.
 * Updates:
 * - Added explicit typing for translation segments to resolve 'any' linting error.
 */

export default function NotebookPage({ params }: { params: { id: string } }) {
  // 1. Logic & Hooks
  const { note, isLoading: noteLoading, saveNote } = useUserNotes(params.id);
  const [mode, setMode] = useState<"NOTEBOOK" | "TRANSLATION">("NOTEBOOK");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  // Phase 3 Hydration: Real Translation data
  const {
    segments,
    saveSegment,
    isLoading: transLoading,
  } = useTranslations(note?.ref || null);

  // Sync state from DB on load
  useEffect(() => {
    if (note) {
      setTitle(note.title || "Untitled Insight");
      setContent(note.content || "");
      setIsPublic(note.is_public || false);
    }
  }, [note]);

  // Fix: useCallback received a function whose dependencies are unknown.
  // We use useMemo to stabilize the debounced function.
  const debouncedSave = useMemo(
    () =>
      debounce((newContent: string) => {
        saveNote.mutate(newContent);
      }, 2000),
    [saveNote]
  );

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const handleContentChange = useCallback(
    (html: string) => {
      setContent(html);
      debouncedSave(html);
    },
    [debouncedSave]
  );

  // 2. Computed Stats
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
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          Synchronizing Scriptorium...
        </p>
      </div>
    );

  return (
    <div className="h-screen w-full flex flex-col bg-paper overflow-hidden select-none">
      {/* 1. STUDIO HEADER */}
      <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="h-8 w-px bg-zinc-100 mx-1" />
          <div className="flex flex-col">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm font-bold text-zinc-900 bg-transparent border-none outline-none focus:ring-0 w-64"
              placeholder="Untitled Insight..."
            />
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  saveNote.isPending
                    ? "bg-amber-400 animate-pulse"
                    : "bg-green-500"
                }`}
              />
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">
                {saveNote.isPending ? "Syncing..." : "Encrypted & Synced"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setMode("NOTEBOOK")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                mode === "NOTEBOOK"
                  ? "bg-white shadow-sm text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <Type size={14} /> Notebook
            </button>
            <button
              onClick={() => setMode("TRANSLATION")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${
              isPublic
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
            }`}
          >
            {isPublic ? <Globe size={14} /> : <Lock size={14} />}{" "}
            {isPublic ? "Public" : "Private"}
          </button>
          <button className="p-2 text-zinc-400 hover:text-zinc-900">
            <Share2 size={18} />
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-grow flex overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-72 border-r border-zinc-200 bg-zinc-50 flex flex-col shrink-0">
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Workspace Tree
            </h3>
            <button className="text-zinc-400 hover:text-zinc-900">
              <Plus size={16} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-3 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-white rounded-xl border border-zinc-200 shadow-sm text-xs font-bold text-zinc-700">
              <Hash size={14} className="text-amber-500" /> Main Manuscript
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-200/50 rounded-xl text-xs font-medium text-zinc-500 transition-colors">
              <History size={14} className="text-zinc-400" /> Version History
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-200/50 rounded-xl text-xs font-medium text-zinc-500 transition-colors">
              <Users size={14} className="text-zinc-400" /> Collaborators (0)
            </button>
          </div>

          <div className="p-6 bg-zinc-100/50 border-t border-zinc-200 space-y-4">
            <div className="flex items-center gap-2">
              <PlusCircle size={14} className="text-amber-500" />
              <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">
                Smart Links
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed italic">
              Type{" "}
              <span className="text-zinc-900 font-mono font-bold">
                Book.1.1
              </span>{" "}
              to instantly anchor this insight to the canonical library.
            </p>
          </div>
        </aside>

        <div className="flex-grow overflow-y-auto bg-paper relative">
          {mode === "NOTEBOOK" ? (
            <div className="max-w-4xl mx-auto py-16 px-12">
              <TipTapEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Start typing your drash..."
              />
            </div>
          ) : (
            /* TRANSLATION MODE (Segmented Grid) */
            <div className="h-full flex flex-col">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-8 py-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                    Source:
                  </span>
                  <span className="text-sm font-bold text-zinc-900">
                    {note?.ref || "Unanchored Text"}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <span>Progress: {segments.length} segments</span>
                  <div className="w-40 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-500"
                      style={{
                        width: `${Math.min(segments.length * 10, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex-grow divide-y divide-zinc-100 overflow-y-auto">
                {transLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-zinc-300" />
                  </div>
                ) : segments.length > 0 ? (
                  segments.map((seg: TranslationSegment) => (
                    <div
                      key={seg.ref}
                      onClick={() => setActiveSegment(seg.ref)}
                      className={`grid grid-cols-2 gap-8 p-8 transition-colors cursor-pointer ${
                        activeSegment === seg.ref
                          ? "bg-amber-50/50"
                          : "hover:bg-zinc-50"
                      }`}
                    >
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">
                          {seg.ref}
                        </span>
                        <p className="font-serif-hebrew text-right text-xl leading-relaxed text-zinc-900">
                          {/* In prod, we'd fetch the source text for this ref here */}
                          [Source Content for {seg.ref}]
                        </p>
                      </div>
                      <div className="relative">
                        <textarea
                          defaultValue={seg.translated_content}
                          onBlur={(e) =>
                            saveSegment.mutate({
                              ref: seg.ref,
                              content: e.target.value,
                            })
                          }
                          placeholder="Enter translation..."
                          className="w-full h-full bg-transparent border-none focus:ring-0 text-sm leading-relaxed resize-none p-0"
                        />
                        {seg.translated_content && (
                          <CheckCircle2
                            size={14}
                            className="absolute bottom-0 right-0 text-green-500"
                          />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center text-zinc-400 italic text-sm">
                    No segments found. Use the reader to select a book portion
                    for translation.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. STUDIO STATUS BAR */}
      <footer className="h-10 border-t border-zinc-200 bg-white flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-6 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                saveNote.isPending
                  ? "bg-amber-400 animate-pulse"
                  : "bg-green-500"
              }`}
            />
            Live Sync: {saveNote.isPending ? "Syncing" : "Online"}
          </div>
          <span>Mode: {mode}</span>
          <span>Words: {wordCount}</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[9px] font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
            <Eye size={12} />
            Focus Mode
          </button>
        </div>
      </footer>
    </div>
  );
}
