"use client";

import React, { useCallback } from "react";
import { ReaderSidePanels } from "@/components/reader/ReaderSidePanels";
import { ReaderLayoutState } from "../hooks/useReaderLayoutState";
import { Verse } from "@/lib/types/library";

/**
 * components/reader/layout/ReaderSidePanelsWrapper.tsx
 * Bridges global layout state with the Side Panel container.
 * Updated: Now provides active translation data and advanced tool triggers to the panels.
 */
export function ReaderSidePanelsWrapper({
  layout,
  activeLayerId,
  onSelectLayer,
  bookSlug,
}: {
  layout: ReaderLayoutState;
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  bookSlug?: string;
}) {
  /**
   * handleSetSelectedVerse
   * Coordination logic to clear side menus when a verse detail is requested.
   */
  const handleSetSelectedVerse = useCallback(
    (verseId: string | null) => {
      if (verseId) {
        layout.actions.closeSideMenus();
        layout.setters.setEditingVerse(null);
      }
      layout.setters.setSelectedVerseRef(verseId);
    },
    [layout]
  );

  /**
   * handleSetEditingVerse
   * Logic to trigger the translation editor.
   */
  const handleSetEditingVerse = useCallback(
    (verse: Verse | null) => {
      if (verse) {
        layout.actions.closeSideMenus();
        layout.setters.setSelectedVerseRef(null);
      }
      layout.setters.setEditingVerse(verse);
    },
    [layout]
  );

  return (
    <ReaderSidePanels
      // Shared Core Props
      onClose={layout.actions.closeSideMenus}
      verseRef={layout.state.selectedVerseRef}
      // Visibility States from Central Layout
      isTodayOpen={layout.state.isTodayOpen}
      isMarketplaceOpen={layout.state.isMarketplaceOpen}
      isTransPanelOpen={layout.state.isTransPanelOpen}
      isProfileOpen={layout.state.isProfileOpen}
      isAppearanceOpen={layout.state.isAppearanceOpen}
      // Translation Persistence Props (passed to AppearancePanel)
      activeLayerId={activeLayerId}
      onSelectLayer={onSelectLayer}
      onOpenTranslations={layout.actions.openTranslations}
      // Commentary & Metadata
      setSelectedVerseRef={handleSetSelectedVerse}
      setEditingVerse={handleSetEditingVerse}
      editingVerse={layout.state.editingVerse}
      bookSlug={bookSlug}
    />
  );
}
