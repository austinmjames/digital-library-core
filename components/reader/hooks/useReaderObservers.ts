import { useEffect, useRef } from "react";
import { ChapterData } from "@/lib/types/library";

interface ObserverProps {
  loadMore: () => void;
  loadPrev: () => void;
  hasPrev: boolean;
  chapters: ChapterData[];
  onChapterVisible: (book: string, chapter: number) => void;
}

/**
 * useReaderObservers
 * Manages IntersectionObservers for infinite scrolling and location tracking.
 */
export function useReaderObservers({
  loadMore,
  loadPrev,
  hasPrev,
  chapters,
  onChapterVisible,
}: ObserverProps) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const prevLoaderRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // 1. Infinite Scroll Observers
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

  // 2. Visible Chapter Tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bk = entry.target.getAttribute("data-book");
            const ch = entry.target.getAttribute("data-chapter");
            if (bk && ch) {
              onChapterVisible(bk, parseInt(ch, 10));
            }
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    chapterRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapters, onChapterVisible]);

  return { loaderRef, prevLoaderRef, chapterRefs };
}
