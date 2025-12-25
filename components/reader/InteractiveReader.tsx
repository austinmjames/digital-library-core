"use client";

import { useCallback } from "react";
import { useTextSettings } from "@/components/context/text-settings-context";
import { ChapterData, Verse } from "@/lib/types/library";
import { useReaderInfiniteScroll } from "@/components/hooks/useReaderInfiniteScroll";

// Segmented Hooks & Components
import { useReaderPermissions } from "./hooks/useReaderPermissions";
import { useReaderLayoutState } from "./hooks/useReaderLayoutState";
import { useTranslationPersistence } from "./hooks/useTranslationPersistence";
import { useReaderObservers } from "./hooks/useReaderObservers";
import { ReaderLayout } from "./layout/ReaderLayout";
import { ReaderContent } from "./layout/ReaderContent";
import { ReaderHeaderWrapper } from "./layout/ReaderHeaderWrapper";
import { ReaderSidePanelsWrapper } from "./layout/ReaderSidePanelsWrapper";

interface InteractiveReaderProps {
  initialChapter: ChapterData;
  bookSlug?: string;
  activeTranslation?: string;
}

/**
 * InteractiveReader (Orchestrator)
 * Cohesion point for the reader experience.
 * Updated: Resolved prop-mismatch error for ReaderHeaderWrapper.
 */
export default function InteractiveReader({
  initialChapter,
  bookSlug,
  activeTranslation,
}: InteractiveReaderProps) {
  const { displayMode, fontSize } = useTextSettings();

  // 1. Logic, Persistence & Permissions
  const { activeLayerId, handleSelectLayer } = useTranslationPersistence(
    initialChapter.activeTranslation || "jps-1985",
    activeTranslation
  );

  const { canEdit, isVerifying } = useReaderPermissions(activeLayerId);
  const layout = useReaderLayoutState(initialChapter);

  // 2. Data Management (Infinite Scroll)
  const { chapters, isLoading, hasPrev, loadMore, loadPrev } =
    useReaderInfiniteScroll(initialChapter, activeLayerId);

  // 3. Observer Management (Chapter Tracking & Scroll triggers)
  const { loaderRef, prevLoaderRef, chapterRefs } = useReaderObservers({
    loadMore,
    loadPrev,
    hasPrev,
    chapters,
    onChapterVisible: (bk, ch) => {
      layout.setters.setActiveBook(bk);
      layout.setters.setActiveChapter(ch);
    },
  });

  /**
   * handleVerseClick
   * Coordinates opening the commentary sidebar.
   */
  const handleVerseClick = useCallback(
    (id: string) => {
      if (layout.state.selectedVerseRef === id) {
        layout.actions.clearSelection();
      } else {
        layout.actions.closeSideMenus();
        layout.setters.setSelectedVerseRef(id);
        layout.setters.setEditingVerse(null);
      }
    },
    [layout]
  );

  /**
   * handleLongPress
   * Coordinates opening the Sovereignty Editor.
   */
  const handleLongPress = useCallback(
    (v: Verse) => {
      if (canEdit && !isVerifying) {
        layout.actions.closeSideMenus();
        layout.setters.setEditingVerse(v);
        layout.setters.setSelectedVerseRef(null);
      }
    },
    [canEdit, isVerifying, layout]
  );

  return (
    <ReaderLayout
      isPanelOpen={layout.state.isPanelOpen}
      header={
        <ReaderHeaderWrapper
          layout={layout}
          // Legacy translation props removed to resolve TypeScript error
        />
      }
      sidePanels={
        <ReaderSidePanelsWrapper
          layout={layout}
          activeLayerId={activeLayerId}
          onSelectLayer={handleSelectLayer}
          bookSlug={bookSlug}
        />
      }
    >
      <ReaderContent
        displayMode={displayMode}
        fontSize={fontSize}
        hasPrev={hasPrev}
        prevLoaderRef={prevLoaderRef}
        loaderRef={loaderRef}
        isLoading={isLoading}
        chapters={chapters}
        chapterRefs={chapterRefs}
        selectedVerseRef={layout.state.selectedVerseRef}
        canEdit={canEdit}
        onVerseClick={handleVerseClick}
        onVerseLongPress={handleLongPress}
      />
    </ReaderLayout>
  );
}
