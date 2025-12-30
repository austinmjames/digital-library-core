"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import React, { useEffect, useState } from "react";

/**
 * DrashRefPopover Component (v1.2 - Fixed Syntax & Types)
 * Filepath: components/editor/DrashRefPopover.tsx
 * Role: Hover/Click preview for +Ref links within the TipTap editor.
 * Alignment: PRD Section 2.3 (Notebooks & Knowledge Management).
 */

interface PreviewData {
  hebrew_text: string;
  english_text: string;
  book_en_title: string;
}

interface DrashRefPopoverProps {
  refString: string;
  onOpenFull: (ref: string) => void;
  className?: string;
}

export const DrashRefPopover: React.FC<DrashRefPopoverProps> = ({
  refString,
  onOpenFull,
  className,
}) => {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const { data: result, error: supabaseError } = await supabase
          .rpc("get_ref_preview", { p_ref: refString })
          .single();

        if (supabaseError) throw supabaseError;
        if (result) {
          setData(result as PreviewData);
        } else {
          setError("Reference not found in archives.");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Connection failed";
        console.error(
          `[DrashRefPopover] Failed to fetch ${refString}:`,
          errorMessage
        );
        setError("Could not load preview.");
      } finally {
        setLoading(false);
      }
    };

    if (refString) fetchPreview();
  }, [refString]);

  return (
    <div
      className={cn(
        "w-80 bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]",
        className
      )}
    >
      {/* Header */}
      <div className="bg-zinc-950 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="text-orange-500" size={14} />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">
            {refString}
          </span>
        </div>
        <button
          onClick={() => onOpenFull(refString)}
          className="text-zinc-500 hover:text-white transition-colors"
          title="Open in Reader"
        >
          <ExternalLink size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 min-h-[120px] flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-zinc-400">
            <Loader2 className="animate-spin" size={20} />
            <p className="text-[10px] font-bold uppercase tracking-tighter">
              Consulting Spine...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 text-rose-500">
            <AlertCircle size={20} />
            <p className="text-xs font-medium text-center">{error}</p>
          </div>
        ) : data ? (
          <div className="space-y-4">
            <p
              className="font-hebrew text-lg leading-relaxed text-right text-zinc-900"
              dir="rtl"
            >
              {data.hebrew_text}
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 italic">
              {data.english_text}
            </p>

            <button
              onClick={() => onOpenFull(refString)}
              className="w-full mt-2 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all group"
            >
              Go to Full Chapter
              <ChevronRight
                size={12}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
