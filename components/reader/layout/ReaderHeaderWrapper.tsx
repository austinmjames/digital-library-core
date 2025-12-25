"use client";

import React from "react";
import ReaderHeader from "@/components/reader/header/ReaderHeader";
import { MasterPanelState } from "../hooks/useMasterPanel";

/**
 * components/reader/layout/ReaderHeaderWrapper.tsx
 * FIXED: Removed 'onOpenTranslations', 'onOpenMarketplace', etc.
 * since ReaderHeader was simplified to only show branding and passage context.
 */
export function ReaderHeaderWrapper({ layout }: { layout: MasterPanelState }) {
  return (
    <ReaderHeader
      activeBook={layout.state.activeBook}
      activeChapter={layout.state.activeChapter}
      onOpenNav={layout.actions.openNav}
    />
  );
}
