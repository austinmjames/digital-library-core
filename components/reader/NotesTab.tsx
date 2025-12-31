"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import { Verse } from "@/types/reader";
import {
  CheckCircle2,
  History,
  Loader2,
  Lock,
  PenLine,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";

interface NotesTabProps {
  activeVerse: Verse;
}

interface LocalNote {
  id: string;
  content: {
    text: string;
  };
  created_at: string;
}

/**
 * NotesTab (v2.1)
 * Filepath: components/reader/NotesTab.tsx
 * Role: Personal annotations and scholarship persistence for the active verse.
 * PRD Alignment: Section 2.3 (Knowledge Management - Creator Loop).
 * Fix: Replaced 'any' with a strict interface for note content persistence.
 */
export const NotesTab = ({ activeVerse }: NotesTabProps) => {
  const { user } = useAuth();
  const supabase = createClient();

  const [noteText, setNoteText] = useState("");
  const [history, setHistory] = useState<LocalNote[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 1. Fetch Annotation History for this specific Verse Reference
  useEffect(() => {
    async function fetchNotes() {
      if (!user) return;
      setIsLoading(true);

      const { data, error } = await supabase
        .from("user_notes")
        .select("id, content, created_at")
        .eq("user_id", user.id)
        .eq("ref", activeVerse.ref)
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Cast the generic JSONB response to our specific LocalNote interface
        setHistory(data as unknown as LocalNote[]);
      }
      setIsLoading(false);
    }
    fetchNotes();
  }, [activeVerse.ref, user, supabase]);

  // 2. Persistence Logic (PRD 2.3 - Knowledge Loop)
  const handleSave = async () => {
    if (!user || !noteText.trim()) return;
    setIsSaving(true);

    const { error } = await supabase.from("user_notes").insert({
      user_id: user.id,
      ref: activeVerse.ref,
      content: { text: noteText },
      is_public: false,
    });

    if (!error) {
      setSaveSuccess(true);
      setHistory([
        {
          id: crypto.randomUUID(),
          content: { text: noteText },
          created_at: new Date().toISOString(),
        },
        ...history,
      ]);
      setNoteText("");
      setTimeout(() => setSaveSuccess(false), 2000);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-2 duration-500">
      {/* Quick Insight Composer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            Quick Insight
          </label>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            <Lock size={10} />
            <span className="text-[9px] font-black uppercase tracking-tighter">
              Private Note
            </span>
          </div>
        </div>

        <div className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm focus-within:shadow-xl focus-within:border-zinc-950/20 transition-all">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={`Record your logic on ${activeVerse.ref}...`}
            className="w-full bg-transparent border-none text-sm font-medium outline-none resize-none h-32 placeholder:text-zinc-300 leading-relaxed"
          />
          <div className="flex justify-end mt-4 pt-4 border-t border-zinc-50">
            <button
              onClick={handleSave}
              disabled={isSaving || !noteText.trim()}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg disabled:opacity-20",
                saveSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-950 text-white hover:bg-zinc-800"
              )}
            >
              {isSaving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : saveSuccess ? (
                <CheckCircle2 size={12} />
              ) : (
                <Save size={12} className="text-amber-400" />
              )}
              {saveSuccess ? "Archived" : "Save to Notebook"}
            </button>
          </div>
        </div>
      </div>

      {/* Annotation History List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            <History size={14} className="text-blue-500" />
            Scholarship History
          </div>
          <span className="text-[10px] font-bold text-zinc-300 uppercase">
            {history.length} Entries
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-zinc-200" size={24} />
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-zinc-50/50 border border-zinc-100 rounded-2xl group hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 group-hover:bg-amber-400 transition-colors" />
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-serif italic">
                  &ldquo;{item.content?.text || ""}&rdquo;
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 border-2 border-dashed border-zinc-100 rounded-[2.5rem] text-center bg-zinc-50/30">
            <PenLine size={24} className="mx-auto text-zinc-200 mb-4" />
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
              No existing annotations <br />
              for segment {activeVerse.ref}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
