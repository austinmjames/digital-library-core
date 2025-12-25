"use client";

import React from "react";
import { TodayMenu } from "./TodayMenu";
import { CommentaryPanel } from "./CommentaryPanel";
import { MarketplacePanel } from "./MarketplacePanel";
import { TranslationPanel } from "./TranslationPanel";
import { ProfilePanel } from "./ProfilePanel";
import { AppearancePanel } from "./AppearancePanel";
import { Verse } from "@/lib/types/library";

/**
 * ReaderSidePanelProps
 * Standardized interface for the Side Panel orchestrator.
 * Updated: Included translation selection props for the unified Appearance panel.
 */
export interface ReaderSidePanelProps {
  onClose: () => void;
  verseRef: string | null;
  // Visibility States
  isTodayOpen: boolean;
  isMarketplaceOpen: boolean;
  isTransPanelOpen: boolean;
  isProfileOpen: boolean;
  isAppearanceOpen: boolean;
  // Context & Handlers for Appearance/Translation
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onOpenTranslations: () => void;
  // Commentary/Editor Context
  setSelectedVerseRef?: (id: string | null) => void;
  editingVerse?: Verse | null;
  setEditingVerse?: (val: Verse | null) => void;
  bookSlug?: string;
}

/**
 * components/reader/ReaderSidePanels.tsx
 * Master orchestrator for all sidebar panels.
 * Now proxies translation selection logic to the AppearancePanel.
 */
export function ReaderSidePanels({
  onClose,
  verseRef,
  isTodayOpen,
  isMarketplaceOpen,
  isTransPanelOpen,
  isProfileOpen,
  isAppearanceOpen,
  activeLayerId,
  onSelectLayer,
  onOpenTranslations,
}: ReaderSidePanelProps) {
  return (
    <>
      {/* 1. Daily Sanctuary (TodayMenu) */}
      <TodayMenu isOpen={isTodayOpen} onClose={onClose} />

      {/* 2. Verse Detail Panel */}
      <CommentaryPanel verseRef={verseRef} onClose={onClose} />

      {/* 3. Global Discovery (Marketplace) */}
      <MarketplacePanel isOpen={isMarketplaceOpen} onClose={onClose} />

      {/* 4. Translation Layers (Management) */}
      <TranslationPanel isOpen={isTransPanelOpen} onClose={onClose} />

      {/* 5. User Profile */}
      <ProfilePanel isOpen={isProfileOpen} onClose={onClose} />

      {/* 6. Appearance & Version Settings */}
      <AppearancePanel
        isOpen={isAppearanceOpen}
        onClose={onClose}
        activeVersionId={activeLayerId}
        onSelectVersion={onSelectLayer}
        onOpenTranslations={onOpenTranslations}
      />
    </>
  );
}
