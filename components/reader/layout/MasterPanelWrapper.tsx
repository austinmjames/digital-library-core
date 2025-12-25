"use client";

import React from "react";
import { MasterPanel } from "@/components/reader/MasterPanel";
import { MasterPanelState } from "../hooks/useMasterPanel";

/**
 * components/reader/layout/MasterPanelWrapper.tsx
 * Bridges global layout state with the DrashX Master Panel.
 */
export function MasterPanelWrapper({
  layout,
  activeLayerId,
  onSelectLayer,
  bookSlug,
}: {
  layout: MasterPanelState;
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  bookSlug?: string;
}) {
  return (
    <MasterPanel
      isOpen={layout.state.isPanelOpen}
      onClose={layout.actions.closePanel}
      activePanel={layout.state.activePanel}
      onSwitchPanel={layout.actions.openPanel}
      // Sub-view Context
      verseRef={layout.state.selectedVerseRef}
      activeLayerId={activeLayerId}
      onSelectLayer={onSelectLayer}
      bookSlug={bookSlug}
    />
  );
}
