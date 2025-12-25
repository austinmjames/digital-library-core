"use client";

import React, { useState, useCallback } from "react";
import { MarketplaceHeader } from "@/components/reader/marketplace/MarketplaceHeader";
import {
  MarketplaceTabs,
  MarketplaceTab,
} from "@/components/reader/marketplace/MarketplaceTabs";
import { useMarketplaceData } from "@/components/reader/marketplace/useMarketplaceData";
import { useMarketplaceInstall } from "@/components/reader/marketplace/useMarketplaceInstall";

// View Components
import { CommentaryMarketplaceContent } from "@/components/reader/marketplace/commentary/CommentaryMarketplaceContent";
import { TranslationMarketplaceContent } from "@/components/reader/marketplace/translation/TranslationMarketplaceContent";
import { StudiesMarketplaceContent } from "@/components/reader/marketplace/studies/StudiesMarketplaceContent";
import { AuthorDetailView } from "@/components/reader/marketplace/AuthorDetailView";

// Auth & UI
import { AuthPrompt } from "@/components/auth/AuthPrompt";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface MarketplacePanelProps {
  isOpen: boolean;
}

/**
 * MarketplacePanel.tsx
 * Orchestrator for Marketplace Sidebar.
 * Resolved: Fixed module paths for modular sub-components.
 */
export function MarketplacePanel({ isOpen }: MarketplacePanelProps) {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("COMMENTARY");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  const { loading, filteredData, refetch } = useMarketplaceData(isOpen, "");

  const { handleInstall } = useMarketplaceInstall(
    () => setShowAuthPrompt(true),
    () => refetch()
  );

  const handleAuthorClick = useCallback(
    (name: string) => setSelectedAuthor(name),
    []
  );
  const handleBackFromDetail = useCallback(() => {
    setSelectedAuthor(null);
    setShowAuthPrompt(false);
  }, []);

  const renderContent = () => {
    if (showAuthPrompt) {
      return (
        <div className="p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <Button
            variant="ghost"
            onClick={handleBackFromDetail}
            className="text-pencil hover:text-ink gap-2 px-0"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <AuthPrompt
            title="Join the Sanctuary"
            description="Sign in to install community works and sync your library."
            ctaLabel="Sign In to Install"
          />
        </div>
      );
    }

    if (selectedAuthor) {
      const allItems = [
        ...filteredData.commentaries,
        ...filteredData.translations,
        ...filteredData.studies,
      ];
      return (
        <AuthorDetailView
          authorName={selectedAuthor}
          items={allItems}
          onBack={handleBackFromDetail}
          onInstall={handleInstall}
        />
      );
    }

    switch (activeTab) {
      case "COMMENTARY":
        return (
          <CommentaryMarketplaceContent
            items={filteredData.commentaries}
            loading={loading}
            onInstall={(id) => handleInstall(id, "commentary")}
            onAuthorClick={handleAuthorClick}
          />
        );
      case "TRANSLATION":
        return (
          <TranslationMarketplaceContent
            items={filteredData.translations}
            loading={loading}
            onInstall={(id) => handleInstall(id, "translation")}
            onAuthorClick={handleAuthorClick}
          />
        );
      case "STUDIES":
        return (
          <StudiesMarketplaceContent
            items={filteredData.studies}
            loading={loading}
            onInstall={(id) => handleInstall(id, "commentary")}
            onAuthorClick={handleAuthorClick}
          />
        );
      default:
        return null;
    }
  };

  const isDetailActive = !!selectedAuthor || showAuthPrompt;

  return (
    <div className="flex flex-col h-full bg-paper animate-in fade-in duration-300 overflow-hidden">
      <MarketplaceHeader />
      <div className="flex flex-col flex-1 overflow-hidden">
        {!isDetailActive && (
          <MarketplaceTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            commCountLabel={filteredData.commCountLabel}
            transCountLabel={filteredData.transCountLabel}
            studyCountLabel={filteredData.studyCountLabel}
          />
        )}
        {renderContent()}
      </div>
    </div>
  );
}
