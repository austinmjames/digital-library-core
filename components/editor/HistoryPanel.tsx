"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Clock,
  History,
  Loader2,
  RotateCcw,
} from "lucide-react";
import React, { useEffect, useState } from "react";

/**
 * HistoryPanel Component (v1.0 - Strict Types)
 * Filepath: components/editor/HistoryPanel.tsx
 * Role: Provides a sidebar UI for viewing and restoring previous note versions.
 * Alignment: PRD Section 2.3 - "Versioning snapshots".
 */

export interface NoteVersion {
  id: string;
  note_id: string;
  content: Record<string, unknown>; // TipTap JSON structure
  created_at: string;
}

interface HistoryPanelProps {
  noteId: string;
  onRestore: (version: NoteVersion) => void;
  className?: string;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  noteId,
  onRestore,
  className,
}) => {
  const [history, setHistory] = useState<NoteVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from("note_history")
          .select("*")
          .eq("note_id", noteId)
          .order("created_at", { ascending: false });

        if (supabaseError) throw supabaseError;
        setHistory((data as NoteVersion[]) || []);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to load history";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (noteId) fetchHistory();
  }, [noteId, supabase]);

  const handleRestore = async (version: NoteVersion) => {
    setRestoringId(version.id);
    // Restoration logic: Actual restoration happens via callback to parent editor
    // but we add a small delay for UI feedback
    setTimeout(() => {
      onRestore(version);
      setRestoringId(null);
    }, 500);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-l border-zinc-200 w-80 shadow-2xl animate-in slide-in-from-right duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <History className="text-orange-600" size={20} />
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">
            Version History
          </h2>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-200">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-zinc-400">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest">
              Retrieving Snapshots...
            </p>
          </div>
        ) : error ? (
          <div className="py-20 flex flex-col items-center gap-3 text-rose-500 text-center px-6">
            <AlertCircle size={24} />
            <p className="text-xs font-medium">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Clock className="w-12 h-12 text-zinc-100 mx-auto" />
            <p className="text-xs text-zinc-400 italic">
              No snapshots recorded yet.
            </p>
          </div>
        ) : (
          history.map((version: NoteVersion) => {
            const date = new Date(version.created_at);
            return (
              <div
                key={version.id}
                className="group p-4 bg-white border border-zinc-100 rounded-2xl hover:border-orange-200 hover:shadow-md transition-all cursor-default"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-900">
                      {date.toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded uppercase">
                    {date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
                  <span className="text-[10px] text-zinc-500 italic">
                    {JSON.stringify(version.content).length} chars
                  </span>

                  <button
                    onClick={() => handleRestore(version)}
                    disabled={restoringId === version.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-tighter hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {restoringId === version.id ? (
                      <Loader2 className="animate-spin" size={12} />
                    ) : (
                      <RotateCcw size={12} />
                    )}
                    Restore
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-zinc-50 border-t border-zinc-100 text-center">
        <p className="text-[10px] font-medium text-zinc-400 flex items-center justify-center gap-1">
          Auto-saved every 5 minutes <ChevronRight size={10} />
        </p>
      </div>
    </div>
  );
};
