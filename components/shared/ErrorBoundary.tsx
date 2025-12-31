"use client";

import { cn } from "@/lib/utils/utils";
import { AlertTriangle, Home, RefreshCcw, ShieldAlert } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

/**
 * ErrorBoundary Component (v2.0)
 * Filepath: components/shared/ErrorBoundary.tsx
 * Role: Local resilience layer for the DrashX Beit Midrash.
 * Alignment: PRD Section 3.1 (Reliability) & Manifest 4.1 (Aesthetics).
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
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
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Component Logic Gap:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center p-12 text-center bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm space-y-8 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden",
            this.props.className
          )}
        >
          {/* Subtle Paper Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

          {/* Icon Identity */}
          <div className="relative group">
            <div className="p-6 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
              <AlertTriangle
                className="w-10 h-10 text-amber-500"
                strokeWidth={1.5}
              />
            </div>
            <div className="absolute -top-2 -right-2 p-1.5 bg-zinc-950 text-white rounded-lg shadow-xl">
              <ShieldAlert size={12} className="text-rose-500" />
            </div>
          </div>

          {/* Messaging */}
          <div className="space-y-3 relative z-10">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-[0.3em]">
              Section Logic Gap
            </h2>
            <p className="text-xs text-zinc-400 font-medium italic leading-relaxed max-w-xs mx-auto">
              This segment of the Beit Midrash encountered an unhandled
              exception. The rest of your study remains active.
            </p>
          </div>

          {/* Action Grid */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all shadow-xl active:scale-95 group"
            >
              <RefreshCcw
                size={12}
                className="text-amber-400 group-hover:rotate-180 transition-transform duration-500"
              />
              Re-sync Logic
            </button>
            <button
              onClick={() => (window.location.href = "/library")}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-50 hover:text-zinc-950 transition-all shadow-sm"
            >
              <Home size={12} />
              Library
            </button>
          </div>

          {/* Developer Diagnostics */}
          {process.env.NODE_ENV === "development" && this.state.error && (
            <div className="w-full mt-4 pt-6 border-t border-zinc-50 relative z-10">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">
                  Stack Trace
                </span>
                <span className="text-[8px] font-mono text-zinc-200">
                  INTERNAL_RESILIENCE_TRAP
                </span>
              </div>
              <pre className="p-4 bg-zinc-950 rounded-2xl text-left text-[9px] text-zinc-500 font-mono overflow-auto max-h-40 border border-white/5 custom-scrollbar leading-relaxed">
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
