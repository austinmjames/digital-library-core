"use client";

import {
  AlertTriangle,
  Home,
  Info,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

/**
 * Global Error Boundary (DrashX v2.1 - Material Edition)
 * Filepath: app/error.tsx
 * Role: Catches runtime exceptions and provides a recovery interface.
 * Style: Modern Google (Material 3). Clean, non-italic, high-clarity.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for development or a telemetry service
    console.error("[DrashX Engine] Critical Exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--paper)] p-6 selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      <div className="max-w-md w-full text-center space-y-10 animate-in fade-in zoom-in-95 duration-700 relative z-10">
        {/* Visual Identity: Material Alert Container */}
        <div className="relative inline-block">
          <div className="p-8 bg-white dark:bg-zinc-800 rounded-3xl border border-[var(--border-subtle)] shadow-xl ring-8 ring-[var(--surface-hover)]">
            <AlertTriangle
              className="w-14 h-14 text-[var(--accent-warning)] animate-pulse"
              strokeWidth={2}
            />
          </div>
          <div className="absolute -top-3 -right-3 p-2.5 bg-[var(--ink)] text-white rounded-2xl shadow-lg border border-white/10">
            <ShieldAlert
              size={18}
              className="text-[var(--accent-danger)]"
              strokeWidth={2.5}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-[var(--ink)] tracking-tight uppercase leading-tight">
            Scriptorium Stalled
          </h1>
          <div className="space-y-3">
            <p className="text-[var(--ink-muted)] font-normal text-base leading-relaxed px-4">
              One does not acquire Torah without a few stumbles. The registers
              encountered an unhandled logic gap.
            </p>
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em]">
              <Info
                size={12}
                strokeWidth={3}
                className="text-[var(--accent-primary)]"
              />
              Infrastructure sync interrupted
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* Primary Action: Reconnection */}
          <button
            onClick={() => reset()}
            className="btn-primary w-full py-4 text-xs tracking-widest shadow-lg shadow-blue-500/20"
          >
            <RefreshCcw
              size={18}
              strokeWidth={2.5}
              className="group-hover:rotate-180 transition-transform duration-700"
            />
            ATTEMPT RECONNECTION
          </button>

          {/* Secondary Action: Escape Hatch */}
          <Link
            href="/library"
            className="btn-secondary w-full py-4 text-xs tracking-widest"
          >
            <Home size={18} strokeWidth={2.5} />
            RETURN TO LIBRARY
          </Link>
        </div>

        {/* Diagnostic Metadata Footer: Material Code Block */}
        <div className="pt-10 border-t border-[var(--border-subtle)] flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.3em]">
            Diagnostic Trace
          </span>
          <code className="text-[11px] font-mono font-medium text-[var(--ink)] bg-[var(--surface-hover)] border border-[var(--border-subtle)] px-4 py-1.5 rounded-lg shadow-inner">
            {error.digest || "RUNTIME_EXCEPTION_0x11"}
          </code>
        </div>
      </div>

      {/* Global Brand Footer Overlay */}
      <footer className="fixed bottom-0 left-0 right-0 p-10 flex justify-center pointer-events-none z-0">
        <p className="text-[10px] font-medium uppercase tracking-[1.5em] text-[var(--ink-muted)] opacity-30">
          DrashX Resilience v2.1
        </p>
      </footer>
    </div>
  );
}
