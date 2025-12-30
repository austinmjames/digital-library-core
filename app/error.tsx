"use client";

import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

/**
 * Global Error Boundary
 * Filepath: app/error.tsx
 * Role: Catches runtime exceptions and provides a "Broken Tablet" recovery UI.
 * Context: Aligned with PRD Section 3.1 (Reliability & Resilience).
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("[DrashX Engine] Runtime Exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Visual "Broken Tablet" Iconography */}
        <div className="relative inline-block">
          <div className="p-6 bg-amber-50 rounded-full border border-amber-100">
            <AlertTriangle className="w-12 h-12 text-amber-600" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            The Scriptorium is Stalled
          </h1>
          <p className="text-zinc-500 leading-relaxed italic">
            &ldquo;One does not acquire Torah without a few stumbles.&rdquo;
            <br />
            An unexpected error occurred while processing your request.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full py-4 bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
          >
            <RefreshCcw size={16} />
            Try to Reconnect
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-zinc-200 text-zinc-600 text-[11px] font-bold uppercase tracking-widest rounded-2xl hover:bg-zinc-50 transition-all"
          >
            <Home size={16} />
            Return to Library
          </Link>
        </div>

        <div className="pt-8 border-t border-zinc-100">
          <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">
            Error Hash: {error.digest || "Internal Runtime Error"}
          </p>
        </div>
      </div>
    </div>
  );
}
