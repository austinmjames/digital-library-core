"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";

/**
 * Global Error Page
 * Filepath: app/global-error.tsx
 * Role: Root-level error handling (Phase 1 Bedrock).
 * Purpose: A last-resort UI for when the root layout itself fails.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#faf9f6] flex items-center justify-center min-h-screen p-6 font-sans antialiased">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in duration-500">
          {/* Visual Anchor */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-rose-100 rounded-[2rem] rotate-6"></div>
            <div className="absolute inset-0 bg-white border border-rose-200 rounded-[2rem] flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-10 h-10 text-rose-500" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              System Interruption
            </h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              DrashX encountered a critical initialization error. This usually
              happens during a synchronization timeout or a connectivity break.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 text-white text-xs font-bold uppercase rounded-2xl shadow-lg shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-[0.98]"
            >
              <RefreshCw size={16} />
              Reboot Beit Midrash
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-zinc-200 text-zinc-600 text-xs font-bold uppercase rounded-2xl hover:bg-zinc-50 transition-all"
            >
              <Home size={16} />
              Return to Safety
            </button>
          </div>

          {/* Debug Info (Only visible in dev) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 text-left">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Internal Trace
              </p>
              <pre className="p-4 bg-zinc-100/50 rounded-xl text-[10px] text-zinc-600 font-mono overflow-auto max-h-32">
                {error.message}
              </pre>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
