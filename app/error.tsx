"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

/**
 * app/error.tsx
 * Standard Next.js Client Component for handling runtime errors.
 * This MUST be a client component to handle recovery logic.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to your error reporting service
    console.error("Critical Application Error:", error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center p-6 text-center bg-paper animate-in fade-in duration-500">
      <div className="max-w-md space-y-6">
        <div className="mx-auto w-16 h-16 bg-destructive/5 rounded-full flex items-center justify-center text-destructive/60 mb-2 border border-destructive/10">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-ink tracking-tight">
            Study Session Interrupted
          </h2>
          <p className="text-pencil font-english leading-relaxed">
            We encountered a technical issue while rendering this text. The
            error has been logged and we are looking into it.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-pencil/30 mt-4 uppercase tracking-widest">
              Error Hash: {error.digest}
            </p>
          )}
        </div>

        <div className="pt-6 flex flex-col gap-3 items-center">
          <Button
            onClick={() => reset()}
            className="rounded-full bg-ink text-paper hover:bg-charcoal px-8 gap-2 shadow-lg active:scale-95 transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
            Reload Chapter
          </Button>

          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/library")}
            className="text-pencil hover:text-ink text-sm font-medium"
          >
            Return to Library
          </Button>
        </div>
      </div>
    </div>
  );
}
