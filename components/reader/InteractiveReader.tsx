"use client";

import { useCallback } from "react";
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

interface InteractiveReaderProps {
  initialChapter: ChapterData;
  bookSlug?: string;
  activeTranslation?: string;
}

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
      if (layout.state.selectedVerseRef === id && layout.state.isPanelOpen) {
        layout.actions.closePanel();
        layout.actions.clearSelection();
      } else {
        layout.setters.setSelectedVerseRef(id);
        layout.actions.openPanel("COMMENTARY");
      }
    },
    [layout]
  );

  return (
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
  );
}
