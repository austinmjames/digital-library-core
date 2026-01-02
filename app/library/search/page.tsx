"use client";

import { useSearch } from "@/lib/hooks/useSearch";
import { cn } from "@/lib/utils/utils";
import {
  BookOpen,
  ChevronRight,
  Filter,
  Hash,
  Info,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * Search Orchestrator (v2.4 - Material Edition)
 * Filepath: app/library/search/page.tsx
 * Role: The primary discovery engine for Tanakh, Talmud, and Philosophy.
 * Aesthetic: Modern Google (Material 3). Clean, non-italic, high-clarity.
 */

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const { data: results, isLoading } = useSearch(query, category);

  return (
    <div className="min-h-screen bg-[var(--paper)] selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12 animate-in fade-in duration-700">
        {/* 1. Header & Search Input */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[var(--ink)] tracking-tight">
              Discovery
            </h1>
            <p className="text-sm text-[var(--ink-muted)] font-normal leading-relaxed max-w-xl">
              Search across the global library of Tanakh, Commentaries, and
              Philosophy to synthesize cross-textual insights.
            </p>
          </div>

          <div className="relative group">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors"
              size={22}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts, verses, or manuscripts..."
              className="architect-input w-full pl-16 py-7 text-xl shadow-sm hover:shadow-md focus:shadow-md"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {["All", "Torah", "Tanakh", "Mishnah", "Talmud", "Chasidut"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border",
                    category === cat
                      ? "bg-[var(--accent-primary)] text-white border-transparent shadow-sm"
                      : "bg-white text-[var(--ink-muted)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                  )}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* 2. Results Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-5">
            <div className="flex items-center gap-2 text-[var(--ink-muted)]">
              <Filter size={16} strokeWidth={2.5} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                Registry Synthesis
              </span>
            </div>
            <p className="text-[11px] font-bold text-[var(--ink-muted)] uppercase tracking-wider">
              {results?.length || 0} Records Found
            </p>
          </div>

          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-6">
              <Loader2
                className="animate-spin text-[var(--accent-primary)]"
                size={40}
                strokeWidth={2}
              />
              <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.4em] animate-pulse">
                Consulting the Canonical Registry...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {results?.map((result) => (
                <Link
                  key={result.id}
                  href={
                    result.type === "book"
                      ? `/read/${result.slug}`
                      : `/read/${result.ref}`
                  }
                >
                  <div className="paper-card paper-card-hover group p-6 flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div
                        className={cn(
                          "p-3.5 rounded-2xl transition-transform group-hover:scale-105",
                          result.type === "book"
                            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                            : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        )}
                      >
                        {result.type === "book" ? (
                          <BookOpen size={22} strokeWidth={2.5} />
                        ) : (
                          <Hash size={22} strokeWidth={2.5} />
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] font-bold text-[var(--ink)] uppercase tracking-tight">
                            {result.type === "book"
                              ? result.en_title
                              : result.ref}
                          </span>
                          <span className="text-[9px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.15em] px-2 py-0.5 bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-lg">
                            {result.category}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--ink-muted)] line-clamp-1 font-normal group-hover:text-[var(--ink)] transition-colors">
                          {result.type === "book"
                            ? result.he_title
                            : result.english_text || result.hebrew_text}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={20}
                      strokeWidth={2.5}
                      className="text-[var(--border-subtle)] group-hover:text-[var(--ink)] group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </Link>
              ))}

              {query.length >= 3 && results?.length === 0 && (
                <div className="py-32 text-center space-y-4 paper-card bg-white/50 border-dashed border-2">
                  <div className="w-16 h-16 bg-[var(--surface-hover)] rounded-full flex items-center justify-center mx-auto text-[var(--border-subtle)]">
                    <Info size={24} />
                  </div>
                  <div className="max-w-xs mx-auto space-y-2">
                    <h3 className="text-lg font-bold text-[var(--ink)] uppercase tracking-tight">
                      No Signals Identified
                    </h3>
                    <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                      Refine your study parameters or try expanding your search
                      across different categories.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Global Brand Footer Overlay */}
      <footer className="fixed bottom-0 left-0 right-0 p-10 flex justify-center pointer-events-none z-0">
        <p className="text-[10px] font-medium uppercase tracking-[1.5em] text-[var(--ink-muted)] opacity-30">
          DrashX Discovery v2.4
        </p>
      </footer>
    </div>
  );
}
