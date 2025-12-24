"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useTextSettings } from "@/components/context/text-settings-context";
import { ReaderHeader } from "@/components/reader/header/ReaderHeader";
import { ReaderSidePanels } from "@/components/reader/ReaderSidePanels";
import { ChapterList } from "@/components/reader/ChapterList";
import { ChapterData, Verse } from "@/lib/types/library";
import { useReaderInfiniteScroll } from "@/components/hooks/useReaderInfiniteScroll";

interface InteractiveReaderProps {
  initialChapter: ChapterData;
  bookSlug?: string;
  activeTranslation?: string;
}

/**
 * InteractiveReader
 * Main study interface for TorahPro.
 * Implements exclusive panel switching: only one slide panel can be open at a time.
 */
export default function InteractiveReader({
  initialChapter,
  bookSlug,
}: InteractiveReaderProps) {
  const { displayMode, fontSize } = useTextSettings();

  // --- State Management ---
  const [activeLayerId, setActiveLayerId] = useState<string>(
    initialChapter.activeTranslation || "jps-1985"
  );

  // Overlays
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isTransPanelOpen, setIsTransPanelOpen] = useState(false);
  const [isTodayOpen, setIsTodayOpen] = useState(false);

  // Content tracking
  const [activeBook, setActiveBook] = useState(initialChapter?.book || "");
  const [activeChapter, setActiveChapter] = useState(
    initialChapter?.chapterNum || 0
  );

  // Verse Interaction (Triggers Commentary)
  const [selectedVerseRef, setSelectedVerseRef] = useState<string | null>(null);
  const [editingVerse, setEditingVerse] = useState<Verse | null>(null);

  // --- Exclusive Panel Logic ---

  const toggleTodayMenu = () => {
    if (isTodayOpen) {
      setIsTodayOpen(false);
    } else {
      // Open Today, close everything else
      setIsTodayOpen(true);
      setIsTransPanelOpen(false);
      setSelectedVerseRef(null);
    }
  };

  const openTranslations = () => {
    setIsTransPanelOpen(true);
    setIsTodayOpen(false);
    setSelectedVerseRef(null);
  };

  const handleVerseSelection = (id: string) => {
    if (selectedVerseRef === id) {
      setSelectedVerseRef(null);
    } else {
      // Open Commentary for verse, close everything else
      setSelectedVerseRef(id);
      setIsTransPanelOpen(false);
      setIsTodayOpen(false);
      setEditingVerse(null);
    }
  };

  // --- Infinite Scroll & Observers ---
  const { chapters, isLoading, hasPrev, loadMore, loadPrev } =
    useReaderInfiniteScroll(initialChapter, activeLayerId);

  const loaderRef = useRef<HTMLDivElement>(null);
  const prevLoaderRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const options = { rootMargin: "1200px" };
    const downObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, options);

    const upObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasPrev) loadPrev();
      },
      { rootMargin: "1200px 0px 0px 0px" }
    );

    const currentLoader = loaderRef.current;
    const currentPrevLoader = prevLoaderRef.current;

    if (currentLoader) downObserver.observe(currentLoader);
    if (currentPrevLoader) upObserver.observe(currentPrevLoader);

    return () => {
      if (currentLoader) downObserver.unobserve(currentLoader);
      if (currentPrevLoader) upObserver.unobserve(currentPrevLoader);
    };
  }, [loadMore, loadPrev, hasPrev]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bk = entry.target.getAttribute("data-book");
            const ch = entry.target.getAttribute("data-chapter");
            if (bk && ch) {
              setActiveBook(bk);
              setActiveChapter(parseInt(ch, 10));
            }
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    chapterRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapters]);

  // UI calculations for main content push
  const isPanelOpen =
    !!selectedVerseRef || !!editingVerse || isTransPanelOpen || isTodayOpen;
  const slideClass = isPanelOpen ? "md:mr-[400px] lg:mr-[450px]" : "";

  return (
    <div className="min-h-screen bg-paper transition-colors duration-500 overflow-x-hidden relative">
      <ReaderSidePanels
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
        activeBook={activeBook}
        activeChapter={activeChapter}
        selectedVerseRef={selectedVerseRef}
        setSelectedVerseRef={setSelectedVerseRef}
        isTransPanelOpen={isTransPanelOpen}
        setIsTransPanelOpen={setIsTransPanelOpen}
        isTodayOpen={isTodayOpen}
        setIsTodayOpen={setIsTodayOpen}
        activeLayerId={activeLayerId}
        setActiveLayerId={setActiveLayerId}
        editingVerse={editingVerse}
        setEditingVerse={setEditingVerse}
        bookSlug={bookSlug}
      />

      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-spring",
          slideClass
        )}
      >
        <ReaderHeader
          activeBook={activeBook}
          activeChapter={activeChapter}
          onOpenNav={() => setIsNavOpen(true)}
          onOpenTranslations={openTranslations}
          onToggleToday={toggleTodayMenu}
          isTodayActive={isTodayOpen}
          activeVersionId={activeLayerId}
          onSelectVersion={setActiveLayerId}
        />
      </div>

      <main
        className={cn(
          "transition-all duration-300 ease-spring pt-14",
          slideClass
        )}
      >
        <div
          className={cn(
            "mx-auto mt-6 px-4 md:px-12 pb-32",
            displayMode === "bilingual-parallel"
              ? "max-w-[1600px]"
              : "max-w-4xl"
          )}
          style={{ fontSize: `${fontSize}pt` } as CSSProperties}
        >
          <div
            ref={prevLoaderRef}
            className={cn(
              "h-32 flex items-center justify-center transition-opacity duration-300",
              !hasPrev && "hidden"
            )}
          />
          <ChapterList
            chapters={chapters}
            chapterRefs={chapterRefs}
            selectedVerseRef={selectedVerseRef}
            onVerseClick={handleVerseSelection}
            onVerseLongPress={(v) => {
              setEditingVerse(v);
              setSelectedVerseRef(null);
              setIsTransPanelOpen(false);
              setIsTodayOpen(false);
            }}
          />
          <div
            ref={loaderRef}
            className="h-48 flex items-center justify-center"
          >
            {isLoading && (
              <div className="w-6 h-6 border-2 border-pencil/30 border-t-gold rounded-full animate-spin" />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
