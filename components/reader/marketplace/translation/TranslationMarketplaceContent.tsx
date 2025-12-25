"use client";

import React from "react";
import {
  ScrollText,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketplaceItem } from "@/lib/types/library";
import { MARKETPLACE_CATEGORIES } from "@/lib/constants";

// Fixed: Using absolute paths and explicit typing
import { useTranslationMarketplace } from "@/components/reader/marketplace/translation/useTranslationMarketplace";
import { MarketplaceBookCard } from "@/components/reader/marketplace/shared/MarketplaceBookCard";

interface TranslationMarketplaceContentProps {
  items: MarketplaceItem[];
  loading: boolean;
  onInstall: (id: string) => Promise<void>;
  onAuthorClick: (name: string) => void;
}

/**
 * marketplace/translation/TranslationMarketplaceContent.tsx
 * Fixed: Explicit types for item mapping and absolute module resolution.
 */
export function TranslationMarketplaceContent({
  items,
  loading,
  onInstall,
  onAuthorClick,
}: TranslationMarketplaceContentProps) {
  const { state, actions } = useTranslationMarketplace(items);

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-accent/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-pencil/40">
          Unrolling Layers...
        </p>
      </div>
    );
  }

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
    const cat = MARKETPLACE_CATEGORIES.find(
      (c) => c.id === state.activeCategory
    );
    const list = [...(state.categories[state.activeCategory!] || [])].sort(
      (a, b) => b.install_count - a.install_count
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
          <h3 className="text-[11px] font-black text-ink uppercase tracking-[0.2em]">
            {cat?.label}
          </h3>
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
            placeholder="Search Interpretations..."
            className="w-full h-10 pl-10 pr-4 bg-pencil/5 border-none rounded-xl text-xs font-semibold focus:ring-2 ring-accent/20 outline-none transition-all placeholder:text-pencil/40 imprint-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-12 pb-32">
        {MARKETPLACE_CATEGORIES.map((category) => {
          const top3 = [...(state.categories[category.id] || [])]
            .sort((a, b) => b.install_count - a.install_count)
            .slice(0, 3);
          return (
            <section key={category.id} className="space-y-6">
              <header className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-xl bg-pencil/5 imprint-sm text-accent"
                    )}
                  >
                    <ScrollText className="w-4 h-4" />
                  </div>
                  <h3 className="text-[11px] font-black text-ink uppercase tracking-[0.2em]">
                    {category.label}
                  </h3>
                </div>
                <button
                  onClick={() => actions.handleViewMore(category.id)}
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
