"use client";

import { AlertCircle, Home, RotateCcw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

/**
 * ErrorBoundary Component (v1.1 - Feature Restored)
 * Filepath: components/shared/ErrorBoundary.tsx
 * Role: Catch-all for component-level failures to prevent app-wide crashes.
 * Alignment: Phase 1 Bedrock - Reliability.
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Restored: Capturing the error object in state
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Allow custom fallback override
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white border border-zinc-100 rounded-3xl shadow-sm space-y-6">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-900">
              Something went wrong
            </h2>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
              The Beit Midrash encountered an unexpected error. Don&apos;t
              worry, your progress is safe.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white text-[11px] font-bold uppercase rounded-xl hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
            >
              <RotateCcw size={14} />
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-zinc-200 text-zinc-600 text-[11px] font-bold uppercase rounded-xl hover:bg-zinc-50 transition-all"
            >
              <Home size={14} />
              Return Home
            </button>
          </div>

          {/* Restored: Debug info for developers */}
          {process.env.NODE_ENV === "development" && this.state.error && (
            <div className="w-full max-w-xl mt-4">
              <pre className="p-4 bg-zinc-50 rounded-xl text-left text-[10px] text-rose-600 font-mono overflow-auto max-h-40 border border-zinc-100">
                {this.state.error.stack || this.state.error.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
