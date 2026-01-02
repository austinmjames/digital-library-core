"use client";

import { Info, Loader2, Sparkles } from "lucide-react";

/**
 * Global Loading Page (DrashX v2.1 - Material Edition)
 * Filepath: app/loading.tsx
 * Role: Provides a themed transition during route hydration.
 * Style: Modern Google (Material 3). Clean, non-italic, dynamic variables.
 */

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full bg-[var(--paper)] animate-in fade-in duration-700 selection:bg-blue-100 selection:text-blue-900 transition-colors">
      {/* Dynamic Loader Identity: Material Surface Logic */}
      <div className="relative group">
        {/* Modern Accent: Soft Google Blue Ring */}
        <div className="absolute inset-0 rounded-[2.5rem] border-2 border-blue-500/10 animate-ping opacity-20 transition-opacity" />

        <div className="relative bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl ring-8 ring-[var(--surface-hover)]">
          <Loader2
            className="w-12 h-12 animate-spin text-[var(--accent-primary)]"
            strokeWidth={2}
          />
        </div>

        {/* Floating identity accent */}
        <div className="absolute -top-3 -right-3 p-2 bg-[var(--ink)] text-white rounded-xl shadow-lg border border-white/10">
          <Sparkles size={16} className="text-blue-400" strokeWidth={2.5} />
        </div>
      </div>

      {/* Scholarly Status Text: Material Typography */}
      <div className="mt-14 text-center space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-[var(--ink)] uppercase tracking-[0.3em]">
            Summoning the Canon
          </h2>
          <p className="text-[11px] font-medium text-[var(--ink-muted)] tracking-wider">
            Registry Synchronization in Progress
          </p>
        </div>

        {/* Loading Pills: Google Blue Style */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
        </div>

        <div className="pt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest opacity-60">
          <Info
            size={12}
            strokeWidth={3}
            className="text-[var(--accent-primary)]"
          />
          Preparing Digital Beit Midrash
        </div>
      </div>
    </div>
  );
}
