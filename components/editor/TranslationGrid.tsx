"use client";

import { TranslationSegment } from "@/lib/hooks/useTranslations";
import { UseMutationResult } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

interface TranslationGridProps {
  segments: TranslationSegment[];
  /**
   * saveSegment
   * Fix: Added 'unknown' as the 4th generic (TContext) to resolve implicit 'any' linting errors.
   */
  saveSegment: UseMutationResult<
    void,
    Error,
    { ref: string; content: string },
    unknown
  >;
  isLoading: boolean;
  sourceRef?: string | null;
}

/**
 * TranslationGrid
 * Role: A structured grid for segment-by-segment translation projects.
 */
export const TranslationGrid = ({
  segments,
  saveSegment,
  isLoading,
  sourceRef,
}: TranslationGridProps) => {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-10 py-5 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
            Source:
          </span>
          <span className="text-xs font-bold text-zinc-900">
            {sourceRef || "Unanchored Text"}
          </span>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          <span>Progress: {segments.length} segments</span>
          <div className="w-40 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-500"
              style={{ width: `${Math.min(segments.length * 10, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-grow divide-y divide-zinc-100 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="animate-spin text-zinc-300" size={32} />
          </div>
        ) : segments.length > 0 ? (
          segments.map((seg: TranslationSegment) => (
            <div
              key={seg.ref}
              onClick={() => setActiveSegment(seg.ref)}
              className={`grid grid-cols-2 gap-12 p-10 transition-all cursor-pointer ${
                activeSegment === seg.ref
                  ? "bg-amber-50/50"
                  : "hover:bg-zinc-50/50"
              }`}
            >
              <div className="space-y-4">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  {seg.ref}
                </span>
                <p
                  className="font-serif-hebrew text-right text-2xl leading-loose text-zinc-900"
                  dir="rtl"
                >
                  [Hebrew source content]
                </p>
              </div>
              <div className="relative group">
                <textarea
                  defaultValue={seg.translated_content}
                  onBlur={(e) =>
                    saveSegment.mutate({
                      ref: seg.ref,
                      content: e.target.value,
                    })
                  }
                  placeholder="Enter translation..."
                  className="w-full h-full bg-transparent border-none focus:ring-0 text-sm leading-relaxed resize-none p-0 font-sans placeholder:text-zinc-300"
                />
                {seg.translated_content && (
                  <CheckCircle2
                    size={16}
                    className="absolute bottom-0 right-0 text-green-500 shadow-sm"
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-40 text-center text-zinc-400 italic text-sm">
            <AlertCircle size={40} className="mx-auto mb-4 opacity-10" />
            <p>
              No segments found. Use the reader to select a book range <br />{" "}
              for translation to begin the project.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
