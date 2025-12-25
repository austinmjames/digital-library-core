"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

// Shared UI Primitives
import { StatusFooter } from "@/components/ui/status-footer";
import { MarketplaceHeader } from "./marketplace/MarketplaceHeader";
import { MarketplaceSearch } from "./marketplace/MarketplaceSearch";
import { MarketplaceTabs, MarketplaceTab } from "./marketplace/MarketplaceTabs";
import { MarketplaceContent } from "./marketplace/MarketplaceContent";

// Logic Hook
import { useMarketplaceData } from "./marketplace/useMarketplaceData";

interface MarketplacePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * components/reader/MarketplacePanel.tsx
 * Orchestrator for the Discovery Sidebar.
 * Updated: Fixed backdrop to ensure background content is accessible on desktop.
 */
export function MarketplacePanel({ isOpen, onClose }: MarketplacePanelProps) {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("COMMENTARY");
  const [searchQuery, setSearchQuery] = useState("");

  const { loading, filteredData, installItem, reportItem } = useMarketplaceData(
    isOpen,
    searchQuery
  );

  if (!isOpen) return null;

  const currentItems =
    activeTab === "COMMENTARY"
      ? filteredData.commentaries
      : filteredData.translations;

  return (
    <>
      {/* Responsive Backdrop: Only visible on mobile */}
      <div
        className="fixed inset-0 bg-ink/5 z-[55] animate-in fade-in duration-500 md:hidden"
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-[400px] lg:w-[450px] bg-paper border-l border-pencil/10 z-[60] shadow-[-12px_0_40px_-10px_rgba(0,0,0,0.05)] flex flex-col transition-transform duration-500 ease-spring",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <MarketplaceHeader onClose={onClose} />

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

        <StatusFooter>
          {activeTab === "COMMENTARY"
            ? "Classic commentators are listed at the top for tradition."
            : "Discover community-driven translation projects."}
        </StatusFooter>
      </aside>
    </>
  );
}
