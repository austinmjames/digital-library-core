"use client";

import { useCallback, useEffect } from "react";
import { useTextSettings } from "@/components/context/text-settings-context";
import { ChapterData } from "@/lib/types/library";
import { useReaderInfiniteScroll } from "@/components/hooks/useReaderInfiniteScroll";

// Updated Architecture Imports
import { useReaderPermissions } from "./hooks/useReaderPermissions";
import { useMasterPanel } from "./hooks/useMasterPanel";
import { useTranslationPersistence } from "./hooks/useTranslationPersistence";
import { useReaderObservers } from "./hooks/useReaderObservers";
import { ReaderLayout } from "./layout/ReaderLayout";
import { ReaderContent } from "./layout/ReaderContent";
import { ReaderHeaderWrapper } from "./layout/ReaderHeaderWrapper";
import { MasterPanelWrapper } from "./layout/MasterPanelWrapper";
import { MasterPanelTrigger } from "./layout/MasterPanelTrigger";
import { NavigationMenu } from "./NavigationMenu";

interface InteractiveReaderProps {
  initialChapter: ChapterData;
  bookSlug?: string;
  activeTranslation?: string;
}

/**
 * components/reader/InteractiveReader.tsx
 * Updated: Adds logic to scroll to anchored verse on load.
 */
export default function InteractiveReader({
  initialChapter,
  bookSlug,
  activeTranslation,
}: InteractiveReaderProps) {
  const { displayMode, fontSize } = useTextSettings();

  const { activeLayerId, handleSelectLayer } = useTranslationPersistence(
    initialChapter.activeTranslation || "jps-1985",
    activeTranslation
  );

  const { canEdit } = useReaderPermissions(activeLayerId);
  const layout = useMasterPanel(initialChapter);

  const { chapters, isLoading, hasPrev, loadMore, loadPrev } =
    useReaderInfiniteScroll(initialChapter, activeLayerId);

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

  const handleVerseClick = useCallback(
    (id: string) => {
      // Allow selecting/commenting on verse
      if (layout.state.selectedVerseRef === id && layout.state.isPanelOpen) {
        layout.actions.closePanel();
        layout.actions.clearSelection();
      } else {
        layout.setters.setSelectedVerseRef(id);
        layout.actions.openPanel("COMMENTARY");

        // Update URL to include verse anchor without full reload
        // Format: /library/.../1#verse-5
        if (typeof window !== "undefined") {
          const parts = id.split(":");
          const verseNum = parts[1];
          if (verseNum) {
            const url = new URL(window.location.href);
            url.hash = `verse-${verseNum}`;
            window.history.replaceState({}, "", url.toString());
          }
        }
      }
    },
    [layout]
  );

  // Handle initial hash scrolling
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.substring(1); // remove #
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Optional: Highlight the verse if linked directly
          // const verseIndex = id.split('-')[1];
          // layout.setters.setSelectedVerseRef(`${initialChapter.book} ${initialChapter.chapterNum}:${verseIndex}`);
        }, 500); // Slight delay for layout to settle
      }
    }
  }, [initialChapter]); // Run when chapter loads

  return (
    <>
      <NavigationMenu
        isOpen={layout.state.isNavOpen}
        onClose={() => layout.setters.setIsNavOpen(false)}
        currentBook={layout.state.activeBook}
      />

      <ReaderLayout
        isPanelOpen={layout.state.isPanelOpen}
        header={<ReaderHeaderWrapper layout={layout} />}
        sidePanels={
          <MasterPanelWrapper
            layout={layout}
            activeLayerId={activeLayerId}
            onSelectLayer={handleSelectLayer}
            bookSlug={bookSlug}
          />
        }
      >
        <MasterPanelTrigger
          isOpen={layout.state.isPanelOpen}
          onClick={layout.actions.togglePanel}
        />

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
          onVerseLongPress={() => {}}
        />
      </ReaderLayout>
    </>
  );
}
