"use client";

import { Loader2 } from "lucide-react";

/**
 * Global Loading Page (DrashX v2.0)
 * Filepath: app/loading.tsx
 * Role: Provides a themed transition during Next.js route hydration.
 * PRD Alignment: Section 4.1 (Aesthetics) & Technical Manifest (Performance).
 */

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full bg-[#FAF9F6] animate-in fade-in duration-700">
      {/* Dynamic Loader Identity */}
      <div className="relative group">
        {/* Scholar Accents: High-frequency pulse for visual feedback */}
        <div className="absolute inset-0 rounded-[2rem] border-2 border-amber-400/20 animate-ping opacity-20 group-hover:opacity-40 transition-opacity" />

        <div className="relative bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-2xl ring-8 ring-zinc-50/50">
          <Loader2
            className="w-10 h-10 animate-spin text-zinc-950"
            strokeWidth={1.5}
          />
        </div>

        {/* Lower accent shadow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-zinc-900/5 blur-md rounded-full" />
      </div>

      {/* Scholarly Status Text */}
      <div className="mt-12 text-center space-y-3">
        <h2 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.4em] ml-[0.4em]">
          Summoning the Canon
        </h2>
        <div className="flex items-center justify-center gap-2">
          <div className="w-1 h-1 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1 h-1 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1 h-1 rounded-full bg-amber-500 animate-bounce" />
        </div>
        <p className="text-[10px] text-zinc-400 font-serif italic opacity-70">
          Preparing your digital Beit Midrash...
        </p>
      </div>

      {/* Background Texture Hint (Matches app/layout.tsx texture) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.01] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] z-0" />
    </div>
  );
}
