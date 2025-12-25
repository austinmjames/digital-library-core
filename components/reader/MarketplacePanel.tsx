"use client";

import React, { useState } from "react";
import { MarketplaceHeader } from "./marketplace/MarketplaceHeader";
import { MarketplaceSearch } from "./marketplace/MarketplaceSearch";
import { MarketplaceTabs, MarketplaceTab } from "./marketplace/MarketplaceTabs";
import { MarketplaceContent } from "./marketplace/MarketplaceContent";
import { useMarketplaceData } from "./marketplace/useMarketplaceData";

interface MarketplacePanelProps {
  isOpen: boolean;
}

/**
 * components/reader/MarketplacePanel.tsx
 * Updated: Removed StatusFooter.
 */
export function MarketplacePanel({ isOpen }: MarketplacePanelProps) {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("COMMENTARY");
  const [searchQuery, setSearchQuery] = useState("");

  const { loading, filteredData, installItem, reportItem } = useMarketplaceData(
    isOpen,
    searchQuery
  );

  const currentItems =
    activeTab === "COMMENTARY"
      ? filteredData.commentaries
      : filteredData.translations;

  return (
    <div className="flex flex-col h-full bg-paper animate-in fade-in duration-300">
      <MarketplaceHeader />

      <div className="flex flex-col flex-1 overflow-hidden">
        <MarketplaceSearch value={searchQuery} onChange={setSearchQuery} />

        <MarketplaceTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          commCountLabel={filteredData.commCountLabel}
          transCountLabel={filteredData.transCountLabel}
        />

        <MarketplaceContent
          loading={loading}
          items={currentItems}
          activeTab={activeTab}
          onInstall={async (id) => {
            await installItem(id, activeTab);
          }}
          onReport={reportItem}
        />
      </div>
    </div>
  );
}
