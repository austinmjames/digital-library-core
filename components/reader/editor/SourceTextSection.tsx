"use client";

import React from "react";
import { Languages } from "lucide-react";

interface SourceTextSectionProps {
  sourceText: string;
}

/**
 * SourceTextSection
 * Renders the Hebrew foundation for the translation workspace.
 */
export function SourceTextSection({ sourceText }: SourceTextSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <label className="text-[11px] font-black text-pencil/40 uppercase tracking-[0.3em] flex items-center gap-2">
          <Languages className="w-4 h-4" /> Source Text
        </label>
        <div className="h-px bg-pencil/10 flex-1 ml-4 mr-4" />
        <span className="text-[10px] text-pencil/30 font-serif italic">
          Masoretic Hebrew
        </span>
      </div>
      <div
        className="p-8 rounded-[2.5rem] bg-pencil/[0.02] font-hebrew text-4xl md:text-5xl leading-[1.6] text-right text-ink/90 border border-pencil/5 shadow-inner select-none"
        dir="rtl"
        dangerouslySetInnerHTML={{ __html: sourceText }}
      />
    </section>
  );
}
