"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  AlertCircle,
  ChevronRight,
  Clock,
  FileText,
  Link as LinkIcon,
  Loader2,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";

/**
 * BacklinksPanel Component (v1.0 - Bi-directional Discovery)
 * Filepath: components/reader/BacklinksPanel.tsx
 * Role: Shows other notes and documents that reference the current verse.
 * Alignment: PRD Section 2.3 - "Bi-directional linking (+Ref syntax)".
 */

interface Backlink {
  note_id: string;
  note_title: string;
  author_name: string;
  created_at: string;
  author_id: string;
}

interface BacklinksPanelProps {
  activeRef: string;
  onOpenNote: (id: string) => void;
  className?: string;
}

export const BacklinksPanel: React.FC<BacklinksPanelProps> = ({
  activeRef,
  onOpenNote,
  className,
}) => {
  const [links, setLinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchBacklinks = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase.rpc(
          "get_backlinks",
          {
            p_target_ref: activeRef,
          }
        );

        if (supabaseError) throw supabaseError;
        setLinks((data as Backlink[]) || []);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to load backlinks";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (activeRef) fetchBacklinks();
  }, [activeRef, supabase]);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Header Section */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-orange-50 rounded-lg">
          <LinkIcon size={14} className="text-orange-600" />
        </div>
        <h3 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">
          Bi-Directional Links
        </h3>
      </div>

      {/* Content Area */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-10 flex flex-col items-center gap-3 text-zinc-400">
            <Loader2 className="animate-spin" size={20} />
            <p className="text-[10px] font-bold uppercase tracking-tighter">
              Scanning Archives...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
            <AlertCircle size={16} />
            <p className="text-xs font-medium">{error}</p>
          </div>
        ) : links.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-zinc-100 rounded-[2rem] opacity-50">
            <p className="text-xs text-zinc-400 italic">
              No existing notes currently reference &quot;{activeRef}&quot;.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {links.map((link) => (
              <button
                key={link.note_id}
                onClick={() => onOpenNote(link.note_id)}
                className="w-full p-4 bg-white border border-zinc-100 rounded-2xl hover:border-orange-200 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText
                      size={14}
                      className="text-zinc-400 group-hover:text-orange-500"
                    />
                    <span className="text-xs font-bold text-zinc-900 line-clamp-1">
                      {link.note_title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-50 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <User size={10} className="text-zinc-300" />
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                        {link.author_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-zinc-300" />
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                        {new Date(link.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={12}
                    className="text-zinc-200 group-hover:text-orange-500 transition-all"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logic Note */}
      <p className="text-[10px] text-zinc-400 leading-relaxed italic px-1">
        &quot;Backlinks&quot; show you where your personal reflections or shared
        community insights intersect with this specific text.
      </p>
    </div>
  );
};
