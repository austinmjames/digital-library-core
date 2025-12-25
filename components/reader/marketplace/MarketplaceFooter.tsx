"use client";

import React from "react";
import { MarketplaceTab } from "./MarketplaceTabs";

interface MarketplaceFooterProps {
  activeTab: MarketplaceTab;
}

/**
 * components/reader/marketplace/MarketplaceFooter.tsx
 * Updated to match the unified "Paper & Ink" style guide.
 * Uses modern sans-serif typography with improved contrast and tracking.
 */
export function MarketplaceFooter({ activeTab }: MarketplaceFooterProps) {
  return (
    <footer className="h-14 border-t border-pencil/5 bg-paper/90 backdrop-blur-xl shrink-0 flex items-center justify-center px-8 z-20 font-sans">
      <p className="text-[10px] text-pencil/70 uppercase font-bold tracking-[0.15em] text-center animate-in fade-in duration-700">
        {activeTab === "COMMENTARY"
          ? "Classic commentators are listed at the top for tradition."
          : "Discover community-driven translation projects."}
      </p>
    </footer>
  );
}
