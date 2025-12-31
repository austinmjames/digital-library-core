"use client";

import { AlertTriangle, Home, RefreshCcw, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

/**
 * Global Error Boundary (DrashX v2.0)
 * Filepath: app/error.tsx
 * Role: Catches runtime exceptions and provides a "Broken Tablet" recovery UI.
 * PRD Alignment: Section 3.1 (Reliability & Resilience).
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for development, or a service in production
    console.error("[DrashX Engine] Critical Exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-8 selection:bg-zinc-950 selection:text-white">
      {/* Subtle Paper Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      <div className="max-w-md w-full text-center space-y-10 animate-in fade-in zoom-in-95 duration-700 relative z-10">
        {/* Visual "Broken Tablet" Identity */}
        <div className="relative inline-block">
          <div className="p-8 bg-white rounded-[2rem] border border-zinc-100 shadow-2xl ring-8 ring-zinc-50">
            <AlertTriangle
              className="w-14 h-14 text-amber-500 animate-pulse"
              strokeWidth={1.5}
            />
          </div>
          <div className="absolute -top-3 -right-3 p-2 bg-zinc-950 text-white rounded-xl shadow-xl border border-white/10">
            <ShieldAlert size={16} className="text-rose-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase leading-tight">
            Scriptorium Stalled
          </h1>
          <div className="space-y-2">
            <p className="text-zinc-500 font-serif italic text-lg opacity-80 leading-relaxed">
              &ldquo;One does not acquire Torah without a few stumbles.&rdquo;
            </p>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              The registers encountered an unhandled logic gap.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* DrashX Primary Action Token */}
          <button
            onClick={() => reset()}
            className="group relative flex items-center justify-center gap-3 w-full py-5 bg-zinc-950 text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl hover:bg-zinc-800 transition-all shadow-2xl active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            <RefreshCcw
              size={16}
              className="text-amber-400 group-hover:rotate-180 transition-transform duration-700"
            />
            <span className="relative">Attempt Reconnection</span>
          </button>

          {/* DrashX Secondary Action Token */}
          <Link
            href="/library"
            className="flex items-center justify-center gap-3 w-full py-5 bg-white border border-zinc-200 text-zinc-600 text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl hover:bg-zinc-50 hover:border-zinc-950 hover:text-zinc-950 transition-all active:scale-[0.98]"
          >
            <Home size={16} />
            Return to Library
          </Link>
        </div>

        {/* Diagnostic Metadata Footer */}
        <div className="pt-10 border-t border-zinc-100 flex flex-col items-center gap-2">
          <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.4em]">
            Diagnostic Trace
          </span>
          <code className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-50 px-3 py-1 rounded-md">
            {error.digest || "RUNTIME_EXCEPTION_0x11"}
          </code>
        </div>
      </div>
    </div>
  );
}
