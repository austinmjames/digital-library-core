"use client";

import React from "react";
import {
  ChevronRight,
  Loader2,
  ArrowLeft,
  Search,
  Zap,
  BookMarked,
  Waypoints,
} from "lucide-react";
import { MarketplaceItem } from "@/lib/types/library";
import { cn } from "@/lib/utils";

// Fixed: Using absolute paths for hooks and shared cards
import { useStudiesMarketplace } from "@/components/reader/marketplace/studies/useStudiesMarketplace";
import { MarketplaceBookCard } from "@/components/reader/marketplace/shared/MarketplaceBookCard";

interface StudiesMarketplaceContentProps {
  items: MarketplaceItem[];
  loading: boolean;
  onInstall: (id: string) => Promise<void>; // Updated to match parent bound function
  onAuthorClick: (name: string) => void;
}

export function StudiesMarketplaceContent({
  items,
  loading,
  onInstall,
  onAuthorClick,
}: StudiesMarketplaceContentProps) {
  const { state, actions } = useStudiesMarketplace(items);

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-accent/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-pencil/40">
          Mapping Paths...
        </p>
      </div>
    );
  }

  const sections = [
    {
      id: "cycles" as const,
      label: "Learning Cycles",
      icon: Zap,
      color: "text-amber-500",
    },
    {
      id: "curriculum" as const,
      label: "Curriculums",
      icon: BookMarked,
      color: "text-indigo-600",
    },
    {
      id: "community" as const,
      label: "Community Paths",
      icon: Waypoints,
      color: "text-emerald-600",
    },
  ];

  if (state.searchQuery.length > 0 && state.viewState === "OVERVIEW") {
    return (
      <div className="flex-1 flex flex-col h-full bg-paper animate-in fade-in duration-300">
        <div className="px-8 pt-8 flex items-center justify-between">
          <h3 className="text-[10px] font-black text-pencil uppercase tracking-[0.2em]">
            Search Results
          </h3>
          <button
            onClick={actions.clearSearch}
            className="text-[10px] font-bold text-accent"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-4 pb-32">
          {state.filteredItems.map((item: MarketplaceItem) => (
            <MarketplaceBookCard
              key={item.id}
              item={item}
              onInstall={onInstall}
              onAuthorClick={onAuthorClick}
            />
          ))}
        </div>
      </div>
    );
  }

  if (state.viewState === "CATEGORY") {
    const section = sections.find((s) => s.id === state.activeCategory)!;
    const list = [...(state.categories[state.activeCategory!] || [])].sort(
      (a, b) => (b.install_count || 0) - (a.install_count || 0)
    );
    return (
      <div className="flex-1 flex flex-col h-full bg-paper animate-in slide-in-from-right-4 duration-500 overflow-hidden">
        <header className="px-8 py-6 border-b border-pencil/5 flex items-center gap-4 shrink-0 bg-paper/90 backdrop-blur-md">
          <button
            onClick={actions.handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-pencil/5 text-pencil outline-none active:scale-75"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-xl bg-pencil/5 imprint-sm",
                section.color
              )}
            >
              <section.icon className="w-4 h-4" />
            </div>
            <h3 className="text-[11px] font-black text-ink uppercase tracking-[0.2em]">
              {section.label}
            </h3>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-4 pb-32">
          {list.map((item: MarketplaceItem) => (
            <MarketplaceBookCard
              key={item.id}
              item={item}
              onInstall={onInstall}
              onAuthorClick={onAuthorClick}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 pt-6">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pencil/30 group-focus-within:text-accent transition-colors" />
          <input
            value={state.searchQuery}
            onChange={(e) => actions.setSearchQuery(e.target.value)}
            placeholder="Search Paths..."
            className="w-full h-10 pl-10 pr-4 bg-pencil/5 border-none rounded-xl text-xs font-semibold focus:ring-2 ring-accent/20 outline-none transition-all placeholder:text-pencil/40 imprint-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-12 pb-32">
        {sections.map((section) => {
          const top3 = [...(state.categories[section.id] || [])]
            .sort((a, b) => b.install_count - a.install_count)
            .slice(0, 3);
          return (
            <section key={section.id} className="space-y-6">
              <header className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-xl bg-pencil/5 imprint-sm",
                      section.color
                    )}
                  >
                    <section.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-[11px] font-black text-ink uppercase tracking-[0.2em]">
                    {section.label}
                  </h3>
                </div>
                <button
                  onClick={() => actions.handleViewMore(section.id)}
                  className="group flex items-center gap-1.5 text-[10px] font-bold text-pencil hover:text-accent transition-colors outline-none"
                >
                  View More{" "}
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </header>
              <div className="space-y-4">
                {top3.map((item: MarketplaceItem) => (
                  <MarketplaceBookCard
                    key={item.id}
                    item={item}
                    onInstall={onInstall}
                    onAuthorClick={onAuthorClick}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
