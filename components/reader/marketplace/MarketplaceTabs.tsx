"use client";

import React from "react";
import { MessageSquare, Languages, GraduationCap } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";

export type MarketplaceTab = "COMMENTARY" | "TRANSLATION" | "STUDIES";

interface MarketplaceTabsProps {
  activeTab: MarketplaceTab;
  setActiveTab: (tab: MarketplaceTab) => void;
  commCountLabel: string;
  transCountLabel: string;
  studyCountLabel?: string;
}

/**
 * components/reader/marketplace/MarketplaceTabs.tsx
 * Updated: Switched to 'Languages' icon for a more universal "Google Translate" feel.
 * The UI automatically collapses to icons-only mode due to having 3 options.
 */
export function MarketplaceTabs({
  activeTab,
  setActiveTab,
  commCountLabel,
  transCountLabel,
  studyCountLabel = "0",
}: MarketplaceTabsProps) {
  const options = [
    {
      value: "COMMENTARY" as const,
      label: "Commentary",
      icon: MessageSquare,
      countLabel: commCountLabel,
    },
    {
      value: "TRANSLATION" as const,
      label: "Translations",
      icon: Languages, // Updated for universal recognition
      countLabel: transCountLabel,
    },
    {
      value: "STUDIES" as const,
      label: "Studies",
      icon: GraduationCap,
      countLabel: studyCountLabel,
    },
  ];

  return (
    <div className="px-8 py-4 bg-paper border-b border-pencil/[0.03]">
      <SegmentedControl
        options={options}
        value={activeTab}
        onChange={setActiveTab}
      />
    </div>
  );
}
