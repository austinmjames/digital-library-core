"use client";

import { useState, useCallback, useEffect } from "react";
import { ChapterData } from "@/lib/types/library";
import { fetchNextChapter } from "@/app/actions";

/**
 * components/hooks/useReaderInfiniteScroll.ts
 * Logic for infinite bidirectional scrolling.
 * Decoupled from the UI to improve code efficiency and maintainability.
 */
export function useReaderInfiniteScroll(
  initialChapter: ChapterData,
  activeTranslation: string
) {
  const [chapters, setChapters] = useState<ChapterData[]>([initialChapter]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);
  const [hasMore, setHasMore] = useState(!!initialChapter?.nextRef);
  const [hasPrev, setHasPrev] = useState(!!initialChapter?.prevRef);

  const ALLOW_CROSS_BOOK_SCROLLING = ["tanakh"];
  const isCrossBookAllowed = !!(
    initialChapter.collection &&
    ALLOW_CROSS_BOOK_SCROLLING.includes(initialChapter.collection.toLowerCase())
  );

  const loadPrev = useCallback(async () => {
    if (isLoadingPrev || !hasPrev) return;
    const firstChapter = chapters[0];
    const targetRef = firstChapter?.prevRef;
    if (!targetRef) return;

    const previousHeight = document.documentElement.scrollHeight;
    const previousScrollTop = window.scrollY;

    setIsLoadingPrev(true);
    try {
      const newChapter = await fetchNextChapter(targetRef, activeTranslation);
      if (newChapter) {
        if (!isCrossBookAllowed && newChapter.book !== firstChapter.book) {
          setHasPrev(false);
          return;
        }
        setChapters((prev) => [newChapter, ...prev]);
        setHasPrev(!!newChapter.prevRef);

        requestAnimationFrame(() => {
          const heightDiff =
            document.documentElement.scrollHeight - previousHeight;
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
    } finally {
      setIsLoadingPrev(false);
    }
  }, [chapters, isLoadingPrev, hasPrev, isCrossBookAllowed, activeTranslation]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    const lastChapter = chapters[chapters.length - 1];
    if (!lastChapter?.nextRef) return;

    setIsLoading(true);
    try {
      const newChapter = await fetchNextChapter(
        lastChapter.nextRef,
        activeTranslation
      );
      if (newChapter) {
        if (!isCrossBookAllowed && newChapter.book !== lastChapter.book) {
          setHasMore(false);
          return;
        }
        setChapters((prev) => [...prev, newChapter]);
        setHasMore(!!newChapter.nextRef);
      } else {
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [chapters, isLoading, hasMore, isCrossBookAllowed, activeTranslation]);

  // Sync state if navigation triggers a jump to a new initial chapter
  useEffect(() => {
    setChapters([initialChapter]);
    setHasMore(!!initialChapter.nextRef);
    setHasPrev(!!initialChapter.prevRef);
  }, [initialChapter]);

  return {
    chapters,
    isLoading,
    isLoadingPrev,
    hasMore,
    hasPrev,
    loadMore,
    loadPrev,
  };
}
