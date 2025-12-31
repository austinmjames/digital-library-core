"use client";

import { cn } from "@/lib/utils/utils";
import { BookMarked, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
}

/**
 * LibraryHeader
 * Filepath: components/library/LibraryHeader.tsx
 * Role: Primary navigation and search entry point for the Library.
 * PRD Alignment: Section 3.1 (Discovery) & Section 4.3 (Hybrid Search).
 */
export const LibraryHeader = ({ activeTab, setActiveTab }: HeaderProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      // Directs to the Hybrid Search Engine results page
      router.push(
        `/library/semantic-search?q=${encodeURIComponent(searchQuery)}`
      );
    }
  };

  const tabs = [
    { id: "shelf", label: "My Shelf" },
    { id: "catalog", label: "Catalog" },
    { id: "community", label: "Community" },
    { id: "plans", label: "Study Plans" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60 px-8 py-5">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* 1. Hybrid Search Bar (Manifest Section 6) */}
        <form
          onSubmit={handleSearch}
          className="relative w-full lg:w-[450px] group"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <Search
              className="text-zinc-300 group-focus-within:text-zinc-950 transition-colors"
              size={18}
            />
          </div>

          <input
            type="text"
            placeholder="Search the canon or AI insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3 pl-12 pr-12 text-sm focus:ring-8 focus:ring-zinc-950/5 focus:bg-white focus:border-zinc-300 transition-all outline-none font-medium placeholder:text-zinc-300"
          />

          {/* AI Search Trigger (Semantic Search) */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchQuery.length > 0 ? (
              <button
                type="submit"
                title="Execute AI Semantic Search"
                className="p-2 bg-zinc-950 text-white rounded-xl hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
              >
                <Sparkles size={14} className="text-amber-400" />
              </button>
            ) : (
              <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black text-zinc-300 bg-white border border-zinc-100 rounded-lg">
                <span className="text-xs">⌘</span>K
              </kbd>
            )}
          </div>
        </form>

        {/* 2. Navigation Tabs (PRD 3.1) */}
        <nav className="flex p-1.5 bg-zinc-100/80 rounded-[1.25rem] border border-zinc-200/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center gap-2",
                activeTab === tab.id
                  ? "bg-white text-zinc-950 shadow-md scale-[1.02]"
                  : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/30"
              )}
            >
              {tab.id === "shelf" && (
                <BookMarked
                  size={12}
                  className={
                    activeTab === "shelf" ? "text-blue-500" : "text-zinc-300"
                  }
                />
              )}
              {tab.label}

              {/* Active Indicator Dot */}
              {activeTab === tab.id && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-zinc-950 rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
