"use client";

import React from "react";
// Import the default export to resolve the circular definition/alias error
import ReaderHeader from "@/components/reader/header/ReaderHeader";
import { ReaderLayoutState } from "../hooks/useReaderLayoutState";

/**
 * components/reader/layout/ReaderHeaderWrapper.tsx
 * Bridges global layout state with the ReaderHeader.
 * Updated: Integrated into the DrashX functional ecosystem.
 */
export function ReaderHeaderWrapper({ layout }: { layout: ReaderLayoutState }) {
  return (
    <ReaderHeader
      activeBook={layout.state.activeBook}
      activeChapter={layout.state.activeChapter}
      onOpenNav={layout.actions.openNav}
      onOpenTranslations={layout.actions.openTranslations}
      onOpenMarketplace={layout.actions.openMarketplace}
      onOpenProfile={layout.actions.openProfile}
      onOpenAppearance={layout.actions.openAppearance}
      onToggleToday={layout.actions.toggleToday}
      isTodayActive={layout.state.isTodayOpen}
    />
  );
}
