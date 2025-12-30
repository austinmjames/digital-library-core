"use client";

import { useSemanticSearch } from "@/lib/hooks/useSemanticSearch";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * Global Semantic Search Page (v1.1 - Type Safe)
 * Filepath: app/library/semantic-search/page.tsx
 * Role: Concept Discovery Hub.
 * Alignment: PRD Section 4.2 (Semantic Discovery).
 */

interface SemanticSearchResult {
  id: string;
  ref: string;
  hebrew_text: string;
  english_text: string;
  similarity: number;
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
    <div className="p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 bg-paper min-h-screen">
      <header className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={12} />
          Library
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 flex items-center gap-4">
              <Sparkles size={32} className="text-amber-500" />
              Semantic Discovery
            </h1>
            <p className="text-zinc-500 mt-2 italic">
              Search by concept, theme, or theological question rather than
              keywords.
            </p>
          </div>
        </div>
      </header>

      {/* Input Section */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <BrainCircuit className="w-6 h-6 text-amber-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'What does the Torah say about environmental stewardship?'"
          className="w-full pl-16 pr-6 py-6 bg-white border border-zinc-200 rounded-3xl shadow-xl focus:outline-none focus:border-amber-500 text-lg transition-all"
        />
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar border-b border-zinc-100">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase border transition-all ${
              category === cat
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 shadow-sm"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center gap-6 text-zinc-400">
            <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em]">
                Neural Synthesis...
              </p>
              <p className="text-[10px] italic mt-2">
                Mapping conceptual similarity across {category}...
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
                  className="w-full bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all text-left group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                        <BookOpen size={20} />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">
                        {item.ref}
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-zinc-50 text-zinc-500 rounded-full text-[10px] font-bold border border-zinc-100">
                      {Math.round(item.similarity * 100)}% Conceptual Fit
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p
                      className="font-hebrew text-right text-2xl md:text-3xl leading-relaxed text-zinc-900"
                      dir="rtl"
                    >
                      {item.hebrew_text}
                    </p>
                    <p className="text-sm md:text-base text-zinc-500 leading-relaxed font-medium">
                      {item.english_text}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-zinc-50 flex items-center justify-between text-zinc-300 group-hover:text-amber-600 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Go to Passage
                    </span>
                    <ChevronRight size={16} />
                  </div>
                </button>
              )
            )}
          </div>
        ) : (
          <div className="py-32 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] opacity-40">
            <Search size={48} className="mx-auto mb-6 text-zinc-200" />
            <p className="text-sm font-medium">
              Enter a complex query above to begin semantic discovery.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
