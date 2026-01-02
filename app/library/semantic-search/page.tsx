"use client";

import { useSemanticSearch } from "@/lib/hooks/useSemanticSearch";
import { cn } from "@/lib/utils/utils";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * Global Semantic Search Page (v2.0 - Material Edition)
 * Filepath: app/library/semantic-search/page.tsx
 * Role: Concept Discovery Hub using neural text similarity.
 * Aesthetic: Modern Google (Material 3). Clean, non-italic, high-clarity.
 */

interface SemanticSearchResult {
  id: string;
  ref: string;
  hebrew_text: string;
  english_text: string;
  similarity: number;
  category?: string;
}

export default function SemanticSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("All");

  const { data: results, isLoading } = useSemanticSearch(query, category);

  const categories = [
    "All",
    "Tanakh",
    "Talmud",
    "Halakhah",
    "Kabbalah",
    "Philosophy",
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)] selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300 pb-32">
      <div className="max-w-5xl mx-auto px-6 pt-12 space-y-12 animate-in fade-in duration-700">
        {/* 1. Header Area: Standardized Material Breadcrumb & Title */}
        <header className="space-y-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] hover:text-[var(--ink)] transition-colors group"
          >
            <ArrowLeft
              size={12}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Return to Library
          </button>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-[var(--ink)] tracking-tight flex items-center gap-4">
              <Sparkles size={32} className="text-blue-500" strokeWidth={2.5} />
              Semantic Discovery
            </h1>
            <p className="text-sm text-[var(--ink-muted)] font-normal leading-relaxed max-w-2xl pl-1 border-l-2 border-[var(--accent-primary)]/20 ml-1">
              Neural synthesis engine: Search by concept, theme, or theological
              inquiry rather than exact keywords.
            </p>
          </div>
        </header>

        {/* 2. Input Section: Neural Prompt Style */}
        <div className="space-y-8">
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none transition-colors">
              <BrainCircuit
                className="w-6 h-6 text-blue-500 group-focus-within:text-blue-600"
                strokeWidth={2}
              />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'What does the Torah say about environmental stewardship?'"
              className="architect-input w-full pl-16 py-7 text-lg shadow-sm hover:shadow-md focus:shadow-md transition-all"
            />
          </div>

          {/* Dynamic Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
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
            ))}
          </div>
        </div>

        {/* 3. Results Section */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-32 flex flex-col items-center gap-6 text-[var(--ink-muted)]">
              <Loader2
                className="w-12 h-12 animate-spin text-blue-500"
                strokeWidth={2}
              />
              <div className="text-center space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.3em] animate-pulse">
                  Neural Synthesis Engine Active
                </p>
                <p className="text-[10px] font-medium text-[var(--ink-muted)]">
                  Mapping conceptual similarity across {category} database...
                </p>
              </div>
            </div>
          ) : results && (results as SemanticSearchResult[]).length > 0 ? (
            <div className="grid gap-6">
              {(results as SemanticSearchResult[]).map(
                (item: SemanticSearchResult) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/read/${item.ref}`)}
                    className="paper-card paper-card-hover group w-full p-8 text-left transition-all"
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[var(--surface-hover)] rounded-xl flex items-center justify-center text-[var(--ink-muted)] group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-colors shadow-sm">
                          <BookOpen size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-bold text-[var(--ink)] uppercase tracking-tight">
                            {item.ref}
                          </span>
                          <span className="text-[9px] font-bold text-[var(--ink-muted)] uppercase tracking-widest">
                            Passage Ref
                          </span>
                        </div>
                      </div>

                      <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-bold border border-blue-100 dark:border-blue-900/30 flex items-center gap-2 shadow-sm">
                        <CheckCircle2 size={12} strokeWidth={2.5} />
                        {Math.round(item.similarity * 100)}% Match
                      </div>
                    </div>

                    <div className="space-y-8">
                      <p
                        className="font-hebrew text-right text-2xl md:text-3xl leading-relaxed text-[var(--ink)] tracking-tight"
                        dir="rtl"
                      >
                        {item.hebrew_text}
                      </p>
                      <p className="text-[15px] md:text-base text-[var(--ink-muted)] leading-relaxed font-normal group-hover:text-[var(--ink)] transition-colors pl-4 border-l-2 border-[var(--border-subtle)]">
                        {item.english_text}
                      </p>
                    </div>

                    <div className="mt-10 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-[var(--ink-muted)] group-hover:text-blue-600 transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Enter Studio with this Passage
                      </span>
                      <ChevronRight
                        size={18}
                        strokeWidth={2.5}
                        className="group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="py-32 text-center paper-card bg-white/50 border-dashed border-2 opacity-60">
              <Search
                size={48}
                className="mx-auto mb-6 text-[var(--border-subtle)]"
                strokeWidth={1.5}
              />
              <div className="max-w-xs mx-auto space-y-2">
                <h3 className="text-lg font-bold text-[var(--ink)] uppercase tracking-tight">
                  Discovery Standby
                </h3>
                <p className="text-sm text-[var(--ink-muted)] font-medium leading-relaxed">
                  Enter a complex conceptual query above to begin semantic
                  textual synthesis.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Brand Footer Overlay */}
      <footer className="fixed bottom-0 left-0 right-0 p-10 flex justify-center pointer-events-none z-0">
        <p className="text-[10px] font-medium uppercase tracking-[1.5em] text-[var(--ink-muted)] opacity-30">
          DrashX Discovery v2.0
        </p>
      </footer>
    </div>
  );
}
