"use client";

import { DrashCard, DrashCardContent } from "@/components/ui/DrashCard";
import { useSearch } from "@/lib/hooks/useSearch";
import {
  ArrowRight,
  BookOpen,
  Filter,
  Hash,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * Search Orchestrator (v2.2 - Clean Build)
 * Filepath: app/library/search/page.tsx
 * Role: Central discovery hub for the DrashX library.
 * Fix: Removed unused 'SearchResult' import to resolve Vercel/Turbopack linting errors.
 */

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  // Results type is automatically inferred from the useSearch hook return type
  const { data: results, isLoading } = useSearch(query, category);

  return (
    <div className="max-w-5xl mx-auto p-8 pt-16 space-y-12">
      {/* Search Header */}
      <div className="space-y-6">
        <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic">
          Discovery
        </h1>

        <div className="relative group">
          <Search
            className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-950 transition-colors"
            size={20}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the Tanakh, Commentaries, or Philosophy..."
            className="w-full pl-16 pr-6 py-6 bg-zinc-50 border-2 border-zinc-100 rounded-3xl text-lg focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {["All", "Torah", "Tanakh", "Mishnah", "Talmud"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                category === cat
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Synthesis
            </span>
          </div>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            {results?.length || 0} Results Found
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-amber-600" size={32} />
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
              Consulting the Archive...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {results?.map((result) => (
              <Link
                key={result.id}
                href={
                  result.type === "book"
                    ? `/read/${result.slug}`
                    : `/read/${result.ref}`
                }
              >
                <DrashCard className="group hover:border-zinc-900 transition-all cursor-pointer">
                  <DrashCardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div
                        className={`p-3 rounded-2xl ${
                          result.type === "book"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {result.type === "book" ? (
                          <BookOpen size={20} />
                        ) : (
                          <Hash size={20} />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-zinc-900 uppercase tracking-tight">
                            {result.type === "book"
                              ? result.en_title
                              : result.ref}
                          </span>
                          {result.category && (
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-2 py-0.5 bg-zinc-100 rounded">
                              {result.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 line-clamp-1 font-serif">
                          {result.type === "book"
                            ? result.he_title
                            : result.english_text || result.hebrew_text}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-zinc-200 group-hover:text-zinc-950 group-hover:translate-x-1 transition-all"
                    />
                  </DrashCardContent>
                </DrashCard>
              </Link>
            ))}

            {query.length >= 3 && results?.length === 0 && (
              <div className="py-20 text-center space-y-2">
                <p className="text-lg font-black text-zinc-900 uppercase italic">
                  No Signals Found
                </p>
                <p className="text-xs text-zinc-400">
                  Try adjusting your filters or expanding your search terms.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
