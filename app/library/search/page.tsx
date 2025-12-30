"use client";

import { useSearch } from "@/lib/hooks/useSearch";
import {
  AlertCircle,
  ArrowLeft,
  Book,
  ChevronRight,
  Filter,
  Loader2,
  Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

/**
 * Search Results Page (v1.1 - Type Safe & Lint Compliant)
 * Filepath: app/library/search/page.tsx
 * Role: The deep discovery interface for the DrashX library.
 * Fixes: Resolved unescaped quotes and implicit 'any' on map items.
 */

interface SearchResult {
  id: string;
  slug: string;
  en_title: string;
  he_title: string;
  category: string;
  author?: string;
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState("All");

  const {
    data: results,
    isLoading,
    isError,
  } = useSearch(query, activeCategory);

  const categories = [
    "All",
    "Tanakh",
    "Talmud",
    "Halakhah",
    "Kabbalah",
    "Philosophy",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", query);
    router.replace(`/library/search?${params.toString()}`);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 min-h-screen bg-paper">
      {/* 1. Header & Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={12} />
          Back to Library
        </button>
      </nav>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            Search Results
          </h1>
          <p className="text-zinc-500 italic">
            Showing results for &quot;{query || "..."}&quot;
          </p>
        </div>
      </div>

      {/* 2. Enhanced Search Input */}
      <form onSubmit={handleSearch} className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-amber-600 transition-colors" />
        <input
          type="text"
          placeholder="Search for another book or author..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-zinc-800 transition-colors shadow-md"
        >
          Search
        </button>
      </form>

      {/* 3. Filters & Results Count */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <Filter size={14} className="text-zinc-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tight whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 shadow-sm"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest shrink-0">
          {(results as SearchResult[])?.length || 0} Results Found
        </p>
      </div>

      {/* 4. Results Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest">
              Searching the Archives...
            </p>
          </div>
        ) : isError ? (
          <div className="py-20 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <p className="text-sm font-medium text-zinc-900">
              Search failed. Please try again.
            </p>
          </div>
        ) : results && (results as SearchResult[]).length > 0 ? (
          (results as SearchResult[]).map((item: SearchResult) => (
            <button
              key={item.id}
              onClick={() => router.push(`/read/${item.slug}`)}
              className="w-full bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                  <Book className="w-6 h-6 text-zinc-400 group-hover:text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {item.category}
                    </span>
                    {item.author && (
                      <span className="text-[10px] text-zinc-400">•</span>
                    )}
                    {item.author && (
                      <span className="text-[10px] text-zinc-400 font-medium italic">
                        {item.author}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 leading-none">
                    {item.en_title}
                  </h3>
                  <p
                    className="font-hebrew text-lg text-zinc-500 mt-1 leading-none"
                    dir="rtl"
                  >
                    {item.he_title}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-200 group-hover:text-zinc-900 transition-all" />
            </button>
          ))
        ) : (
          <div className="py-20 text-center space-y-4 border-2 border-dashed border-zinc-100 rounded-3xl">
            <p className="text-zinc-400 italic">
              No matches found in the &quot;
              {activeCategory === "All" ? "entire" : activeCategory}&quot;
              collection.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setActiveCategory("All");
              }}
              className="text-[10px] font-bold text-amber-600 uppercase tracking-widest hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
