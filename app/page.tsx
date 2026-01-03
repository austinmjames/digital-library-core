"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { BookOpen, ChevronRight, Flame, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Gateway Orchestrator (v27.0 - Ner Tamid Edition)
 * Filepath: app/page.tsx
 * Role: Entry point for DrashX.
 * Behavior: Scroll-free, centered scholarly gateway.
 * Fixes: Updated icon to blue flame; removed redundant narrative line.
 */

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/library");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="h-screen bg-[var(--paper)] flex flex-col items-center justify-center gap-10">
        <Loader2
          className="animate-spin text-[var(--accent-primary)]"
          size={48}
          strokeWidth={2}
        />
        <p className="text-[12px] font-black uppercase tracking-[1.5em] text-[var(--ink-muted)] animate-pulse pl-6 text-center">
          DRASHX
        </p>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="h-screen w-full bg-[var(--paper)] flex flex-col items-center justify-center p-6 sm:p-10 text-center overflow-hidden selection:bg-blue-100 relative">
      {/* Visual Depth Layers */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      <div className="fixed -bottom-40 -right-40 w-[40rem] h-[40rem] bg-blue-600 opacity-5 blur-[150px] rounded-full animate-pulse" />
      <div className="fixed -top-40 -left-40 w-[30rem] h-[30rem] bg-blue-500 opacity-[0.02] blur-[120px] rounded-full" />

      {/* Main Content Hub - Precisely balanced for 100vh fit */}
      <div className="relative z-10 space-y-8 md:space-y-12 max-w-4xl animate-in fade-in zoom-in-95 duration-1000 ease-[cubic-bezier(0.2,0,0,1)] flex flex-col items-center">
        {/* Branding Icon Container (Blue Flame) */}
        <div className="flex justify-center">
          <div className="p-5 md:p-7 bg-white dark:bg-zinc-900 border-2 border-[var(--border-subtle)] rounded-[2.5rem] shadow-2xl group hover:border-blue-500 transition-all duration-700">
            <Flame
              size={32}
              className="text-blue-600 animate-pulse group-hover:scale-110 transition-transform md:w-10 md:h-10"
            />
          </div>
        </div>

        {/* Scholarly Narrative */}
        <div className="space-y-4 md:space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.6em] text-[var(--ink-muted)] opacity-50 block leading-none mb-2">
              The Architecture of Inquiry
            </span>
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-tighter uppercase leading-[0.8] text-[var(--ink)] dark:text-white">
              DrashX
            </h1>
          </div>
          <div className="space-y-4">
            <p className="text-xs md:text-sm font-medium text-[var(--ink-muted)] opacity-70 max-w-lg mx-auto font-sans leading-relaxed px-6 uppercase tracking-[0.15em]">
              A unified registry for serious textual analysis, canonical
              exegesis, and the pursuit of L’amito Shel Torah.
            </p>
          </div>
        </div>

        {/* Action Pipeline - Refined Button Scale */}
        <div className="pt-4 md:pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-xs sm:max-w-none">
          <Link
            href="/login"
            className="btn-primary w-full sm:w-auto px-10 md:px-14 py-3.5 md:py-4.5 text-[11px] md:text-[12px] font-black uppercase tracking-[0.3em] rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            Enter Portal
          </Link>

          <Link
            href="/library"
            className="btn-ghost w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4.5 flex items-center justify-center gap-3 group hover:bg-[var(--surface-hover)] dark:hover:bg-zinc-800 rounded-full transition-all border border-transparent hover:border-[var(--border-subtle)]"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--paper)] dark:bg-zinc-800 border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-blue-500 transition-colors">
              <BookOpen
                size={14}
                className="text-[var(--ink-muted)] group-hover:text-blue-600"
              />
            </div>
            <span className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink)] dark:text-white">
              Explore Canon
            </span>
            <ChevronRight
              size={14}
              className="group-hover:translate-x-1 transition-transform text-blue-600 opacity-40 group-hover:opacity-100"
              strokeWidth={3}
            />
          </Link>
        </div>

        {/* System Versioning */}
        <div className="pt-6 md:pt-10 opacity-30">
          <p className="text-[12px] md:text-[12px] font-400 uppercase tracking-[0.2em] text-[var(--ink)] dark:text-white">
            Registry Framework v27.0.0
          </p>
        </div>
      </div>

      {/* Decorative Corner Accents */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 w-10 h-10 border-t border-l border-[var(--border-subtle)] rounded-tl-[1.5rem] opacity-30" />
      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 w-10 h-10 border-b border-r border-[var(--border-subtle)] rounded-br-[1.5rem] opacity-30" />
    </div>
  );
}
