"use client";

import { useState, useEffect, useRef, useCallback, CSSProperties } from "react";
import { fetchNextChapter } from "@/app/actions";
import { cn } from "@/lib/utils";
import Chapter from "./Chapter";
import { useTextSettings } from "@/components/context/text-settings-context";
import { NavigationMenu } from "./NavigationMenu";
import { ReaderHeader } from "./ReaderHeader";
import { ChapterData } from "@/lib/types/library";

interface InteractiveReaderProps {
  initialChapter: ChapterData;
  bookSlug?: string;
  activeTranslation?: string; // New Prop
}

/**
 * components/reader/InteractiveReader.tsx
 * Infinite scroller for the TorahPro library.
 * Now respects the active translation when scrolling.
 */
export default function InteractiveReader({
  initialChapter,
  bookSlug,
  activeTranslation = "jps-1985", // Default
}: InteractiveReaderProps) {
  const { displayMode, fontSize } = useTextSettings();

  const ALLOW_CROSS_BOOK_SCROLLING = ["tanakh"];
  const isCrossBookAllowed =
    initialChapter.collection &&
    ALLOW_CROSS_BOOK_SCROLLING.includes(
      initialChapter.collection.toLowerCase()
    );

  const [chapters, setChapters] = useState<ChapterData[]>([initialChapter]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);

  const [hasMore, setHasMore] = useState(!!initialChapter?.nextRef);
  const [hasPrev, setHasPrev] = useState(!!initialChapter?.prevRef);

  const [activeBook, setActiveBook] = useState(initialChapter?.book || "");
  const [activeChapter, setActiveChapter] = useState(
    initialChapter?.chapterNum || 0
  );
  const [isNavOpen, setIsNavOpen] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);
  const prevLoaderRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const getChapterId = (id: string) =>
    `chapter-${id.replace(/[^a-zA-Z0-9]/g, "-")}`;

  const loadPrev = useCallback(async () => {
    if (isLoadingPrev) return;

    const firstChapter = chapters[0];
    const targetRef = firstChapter?.prevRef;

    if (!targetRef) {
      setHasPrev(false);
      return;
    }

    const doc = document.documentElement;
    const previousHeight = doc.scrollHeight;
    const previousScrollTop = window.scrollY;

    setIsLoadingPrev(true);
    try {
      // Pass activeTranslation to ensure consistency
      const newChapter = await fetchNextChapter(targetRef, activeTranslation);
      if (newChapter) {
        if (!isCrossBookAllowed && newChapter.book !== firstChapter.book) {
          setHasPrev(false);
          return;
        }

        if (chapters.some((c) => c.id === newChapter.id)) {
          setHasPrev(false);
          return;
        }

        setChapters((prev) => [newChapter, ...prev]);
        setHasPrev(!!newChapter.prevRef);

        requestAnimationFrame(() => {
          const newHeight = doc.scrollHeight;
          const heightDiff = newHeight - previousHeight;
          if (heightDiff > 0) {
            window.scrollTo({
              top: previousScrollTop + heightDiff,
              behavior: "instant",
            });
          }
        });
      } else {
        setHasPrev(false);
      }
    } catch (error) {
      console.error("loadPrev Error:", error);
    } finally {
      setIsLoadingPrev(false);
    }
  }, [chapters, isLoadingPrev, isCrossBookAllowed, activeTranslation]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    const lastChapter = chapters[chapters.length - 1];
    if (!lastChapter?.nextRef) {
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    try {
      // Pass activeTranslation to ensure consistency
      const newChapter = await fetchNextChapter(
        lastChapter.nextRef,
        activeTranslation
      );
      if (newChapter) {
        if (!isCrossBookAllowed && newChapter.book !== lastChapter.book) {
          setHasMore(false);
          return;
        }
        if (chapters.some((c) => c.id === newChapter.id)) {
          setHasMore(false);
          return;
        }
        setChapters((prev) => [...prev, newChapter]);
        setHasMore(!!newChapter.nextRef);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("loadMore Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chapters, isLoading, hasMore, isCrossBookAllowed, activeTranslation]);

  useEffect(() => {
    if (bookSlug) {
      setChapters([initialChapter]);
      setHasMore(!!initialChapter.nextRef);
      setHasPrev(!!initialChapter.prevRef);
      setActiveBook(initialChapter.book);
      setActiveChapter(initialChapter.chapterNum);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [bookSlug, initialChapter]);

  useEffect(() => {
    if (
      isCrossBookAllowed &&
      chapters.length === 1 &&
      chapters[0].chapterNum === 1 &&
      chapters[0].prevRef
    ) {
      loadPrev();
    }
  }, [isCrossBookAllowed, chapters, loadPrev]);

  useEffect(() => {
    const observerOptions = { rootMargin: "1200px" };
    const downObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, observerOptions);

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

  const isAtBookStart = chapters[0]?.chapterNum === 1 && isCrossBookAllowed;
  const getPrevLabel = () => {
    if (isLoadingPrev) {
      return isAtBookStart
        ? "Loading Previous Book..."
        : "Loading Previous Chapter...";
    }
    return isAtBookStart
      ? "Previous Book Available"
      : "Previous Chapter Available";
  };

  return (
    <div className="min-h-screen pb-32 bg-paper transition-colors duration-500">
      <NavigationMenu
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        currentBook={activeBook}
      />
      <ReaderHeader
        activeBook={activeBook}
        activeChapter={activeChapter}
        onOpenNav={() => setIsNavOpen(true)}
      />

      <main
        className={cn(
          "mx-auto mt-6 px-4 md:px-12 transition-all duration-500",
          displayMode === "bilingual-parallel" ? "max-w-[1600px]" : "max-w-4xl"
        )}
        style={{ fontSize: `${fontSize}pt` } as CSSProperties}
      >
        <div
          ref={prevLoaderRef}
          className={cn(
            "flex flex-col items-center justify-center transition-all duration-500",
            hasPrev ? "h-32 opacity-100 mb-8" : "h-0 opacity-0 overflow-hidden"
          )}
        >
          {hasPrev && (
            <div className="flex flex-col items-center gap-2">
              <div className="text-[10px] text-pencil/40 uppercase tracking-[0.2em] font-medium text-center">
                {getPrevLabel()}
              </div>
              {isLoadingPrev && (
                <div className="w-5 h-5 border-2 border-pencil/20 border-t-gold rounded-full animate-spin" />
              )}
            </div>
          )}
        </div>

        {chapters.map((chapterData) => (
          <div
            key={chapterData.id}
            id={getChapterId(chapterData.id)}
            data-book={chapterData.book}
            data-chapter={chapterData.chapterNum}
            ref={(el) => {
              if (el) chapterRefs.current.set(chapterData.id, el);
            }}
            className="mb-24 scroll-mt-24"
          >
            <div className="py-12 text-center select-none">
              <h2 className="text-4xl md:text-5xl font-serif text-ink tracking-tight leading-none">
                <span className="block text-sm md:text-base font-sans font-bold uppercase tracking-[0.2em] text-pencil/60 mb-3">
                  {chapterData.book}
                </span>
                {chapterData.chapterNum}
              </h2>
            </div>
            <Chapter
              verses={chapterData.verses}
              chapterNum={chapterData.chapterNum}
            />
          </div>
        ))}

        <div ref={loaderRef} className="h-48 flex items-center justify-center">
          {isLoading && (
            <div className="w-6 h-6 border-2 border-pencil/30 border-t-gold rounded-full animate-spin" />
          )}
        </div>
      </main>
    </div>
  );
}
