"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

/**
 * app/error.tsx
 * Standard Next.js Client Component for handling runtime errors within segments.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to your preferred monitoring service (e.g., Sentry)
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center p-6 text-center bg-paper animate-in fade-in duration-500">
      <div className="max-w-md space-y-6">
        <div className="mx-auto w-16 h-16 bg-destructive/5 rounded-full flex items-center justify-center text-destructive/60 mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-ink">
            Something went wrong
          </h2>
          <p className="text-pencil font-english leading-relaxed">
            We encountered a technical issue while rendering this page. This
            error has been logged for review.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-pencil/40 mt-2">
              ID: {error.digest}
            </p>
          )}
        </div>

        <div className="pt-4 flex flex-col gap-3 items-center">
          <Button
            onClick={() => reset()}
            className="rounded-full bg-ink text-paper hover:bg-charcoal px-8 gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>

          <Button
            variant="link"
            onClick={() => (window.location.href = "/")}
            className="text-pencil hover:text-ink text-xs"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
