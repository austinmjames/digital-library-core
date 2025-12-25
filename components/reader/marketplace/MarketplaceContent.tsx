"use client";

import React from "react";
import { Loader2, ShoppingBag, Sparkles } from "lucide-react";
import { MarketplaceItem as MarketplaceItemType } from "@/lib/types/library";
import { MarketplaceCardUI } from "./MarketplaceCard";

interface MarketplaceContentProps {
  loading: boolean;
  items: MarketplaceItemType[];
  activeTab: string;
  onInstall: (id: string) => Promise<void>;
  onReport: (id: string, reason: string) => Promise<void>;
}

/**
 * components/reader/marketplace/MarketplaceContent.tsx
 * Scrollable list management for marketplace items.
 */
export function MarketplaceContent({
  loading,
  items,
  activeTab,
  onInstall,
  onReport,
}: MarketplaceContentProps) {
  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600/20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-pencil/40">
          Consulting Library...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center space-y-3 opacity-30 animate-in fade-in">
        <ShoppingBag className="w-12 h-12 mx-auto text-pencil/20" />
        <p className="text-sm font-medium">
          No {activeTab.toLowerCase()} match your search.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar pb-32">
      <div className="flex items-center gap-2 px-1 text-pencil/40">
        <Sparkles className="w-3 h-3 text-gold fill-gold" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          {activeTab === "COMMENTARY"
            ? "Wisdom of the Sages"
            : "Personal Sovereignty"}
        </span>
      </div>

      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {items.map((item) => (
          <MarketplaceCardUI
            key={item.id}
            item={item}
            onInstall={() => onInstall(item.id)}
            onReport={(reason: string) => onReport(item.id, reason)}
          />
        ))}
      </div>
    </div>
  );
}
