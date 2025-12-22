"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ReaderControls } from "@/components/reader/ReaderControls";
import { NavigationMenu } from "@/components/reader/NavigationMenu"; 
import { fetchNextChapter } from "@/app/actions";
import { cn } from "@/lib/utils";
import Chapter from "@/components/reader/Chapter";
import { useTextSettings } from "@/components/text-settings-context";

// --- Type Definitions ---
interface Verse {
  c2_index: number;
  he?: string;
  en?: string;
  id: string;
}

interface ChapterData {
  id: string;
  ref: string;
  book: string;
  chapterNum: number;
  verses: Verse[];
  nextRef?: string;
  prevRef?: string; 
}

interface InteractiveReaderProps {
  initialChapter: ChapterData;
  bookSlug?: string;
}

export default function InteractiveReader({ initialChapter, bookSlug }: InteractiveReaderProps) {
  const { language, layout, fontSize } = useTextSettings();

  const [chapters, setChapters] = useState<ChapterData[]>([initialChapter]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState(false); 
  
  const [hasMore, setHasMore] = useState(!!initialChapter?.nextRef);
  const [hasPrev, setHasPrev] = useState(!!initialChapter?.prevRef);
  
  const [activeBook, setActiveBook] = useState(initialChapter?.book || "");
  const [activeChapter, setActiveChapter] = useState(initialChapter?.chapterNum || 0);
  const [isNavOpen, setIsNavOpen] = useState(false); 

  const loaderRef = useRef<HTMLDivElement>(null);
  const prevLoaderRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // --- RESET ON NAVIGATION ---
  useEffect(() => {
    if (initialChapter) {
      setChapters([initialChapter]);
      setHasMore(!!initialChapter.nextRef);
      setHasPrev(!!initialChapter.prevRef);
      setActiveBook(initialChapter.book);
      setActiveChapter(initialChapter.chapterNum);
      
      // Offset slightly to ensure the top observer can trigger if there is a previous chapter
      if (initialChapter.prevRef) {
        window.scrollTo({ top: 120, behavior: "instant" });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    }
  }, [initialChapter, bookSlug]);

  // --- SYNC URL WITH SCROLL POSITION ---
  useEffect(() => {
    if (activeBook && activeChapter && activeBook !== "Error") {
      const bookPath = activeBook.toLowerCase().replace(/\s+/g, '-');
      const newUrl = `/library/${bookPath}/${activeChapter}`;
      if (window.location.pathname !== newUrl) {
        window.history.replaceState(null, "", newUrl);
      }
    }
  }, [activeBook, activeChapter]);

  // --- INFINITE SCROLL: DOWN ---
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    const lastChapter = chapters[chapters.length - 1];
    if (!lastChapter?.nextRef) {
      setHasMore(false);
      return;
    }
    setIsLoading(true);
    try {
      const newChapter = await fetchNextChapter(lastChapter.nextRef) as ChapterData | null;
      if (newChapter) {
        setChapters((prev) => [...prev, newChapter]);
        setHasMore(!!newChapter.nextRef);
      } else {
        setHasMore(false);
      }
    } catch (e) { 
      console.error("Downscroll failed:", e); 
    } finally { 
      setIsLoading(false); 
    }
  }, [chapters, isLoading, hasMore]);

  // --- INFINITE SCROLL: UP ---
  const loadPrev = useCallback(async () => {
    if (isLoadingPrev || !hasPrev) return;
    const firstChapter = chapters[0];
    if (!firstChapter?.prevRef) {
      setHasPrev(false);
      return;
    }

    const doc = document.documentElement;
    const previousHeight = doc.scrollHeight;
    const previousScrollTop = window.scrollY;

    setIsLoadingPrev(true);
    try {
      const newChapter = await fetchNextChapter(firstChapter.prevRef) as ChapterData | null;
      if (newChapter) {
        setChapters((prev) => [newChapter, ...prev]);
        setHasPrev(!!newChapter.prevRef);
        
        // Adjust scroll position after render to prevent jumping
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const newHeight = doc.scrollHeight;
            const heightDiff = newHeight - previousHeight;
            if (heightDiff > 0) {
              window.scrollTo({ top: previousScrollTop + heightDiff, behavior: "instant" });
            }
          });
        });
      } else {
        setHasPrev(false);
      }
    } catch (e) { 
      console.error("Upscroll failed:", e); 
    } finally { 
      setIsLoadingPrev(false); 
    }
  }, [chapters, isLoadingPrev, hasPrev]);

  // --- OBSERVERS ---
  useEffect(() => {
    const downObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: "1000px" }); 
    
    const upObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadPrev();
    }, { rootMargin: "600px 0px 0px 0px" });

    if (loaderRef.current) downObserver.observe(loaderRef.current);
    if (prevLoaderRef.current) upObserver.observe(prevLoaderRef.current);
    
    return () => {
        downObserver.disconnect();
        upObserver.disconnect();
    };
  }, [loadMore, loadPrev]);

  // Scroll Spy for Header updates
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const book = entry.target.getAttribute("data-book");
            const chapter = entry.target.getAttribute("data-chapter");
            if (book && chapter) {
              setActiveBook(book);
              setActiveChapter(parseInt(chapter));
            }
          }
        });
      }, { rootMargin: "-10% 0px -85% 0px" } 
    );
    chapterRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapters]);

  const toHebrewNumeral = useCallback((n: number) => {
    const letters = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "יא", "יב", "יג", "יד", "טו", "טז", "יז", "יח", "יט", "כ", "כא", "כב", "כג", "כד", "כה", "כו", "כז", "כח", "כט", "ל"];
    return letters[n] || n.toString(); 
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black pb-32">
      <NavigationMenu 
        isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} 
        onSelect={(ref: string) => (window.location.href = `/library/${ref.toLowerCase().replace(/\s+/g, '-')}`)} 
        currentBook={activeBook}
      />
      
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/[0.05] dark:border-white/[0.1] px-4 md:px-8 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex-1" />
        <button onClick={() => setIsNavOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all active:scale-95">
           <span className="font-semibold text-sm md:text-base text-black dark:text-white">{activeBook}</span>
           <span className="text-black/30 dark:text-white/30 text-xs font-light">/</span>
           <span className="text-sm md:text-base text-black/60 dark:text-white/60">{activeChapter}</span>
        </button>
        <div className="flex-1 flex justify-end">
          <ReaderControls />
        </div>
      </header>

      <main 
        className={cn("mx-auto mt-6 px-6 md:px-12 transition-all duration-500", 
          layout === "side-by-side" && language === "both" ? "max-w-7xl" : "max-w-4xl"
        )}
        style={{ fontSize: `${fontSize}pt` }}
      >
        {/* UPWARD SCROLL LOADER */}
        <div 
          ref={prevLoaderRef} 
          className={cn(
            "h-32 flex items-center justify-center transition-all",
            hasPrev ? "opacity-100" : "opacity-0 h-4"
          )}
        >
            {isLoadingPrev && (
              <div className="flex items-center gap-2 text-black/40 dark:text-white/40">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-medium uppercase tracking-widest">Loading Previous</span>
              </div>
            )}
        </div>

        {chapters.map((chapterData, index) => {
          const isFirstInBook = index === 0 || chapters[index - 1].book !== chapterData.book;
          return (
            <div 
              key={`${chapterData.id}-${index}`} 
              data-book={chapterData.book} 
              data-chapter={chapterData.chapterNum} 
              ref={(el) => { if (el) chapterRefs.current.set(chapterData.id, el); }}
              className="mb-16"
            >
              <div className="py-16 text-center select-none first:pt-4">
                <h2 className="text-5xl md:text-6xl font-serif text-black/90 dark:text-white/90 tracking-tight leading-none">
                  {isFirstInBook && (
                    <span className="block text-xl md:text-2xl font-sans font-bold uppercase tracking-[0.25em] text-black/40 dark:text-white/40 mb-4">
                      {chapterData.book}
                    </span>
                  )}
                  {chapterData.chapterNum}
                </h2>
                <div className="mt-8 w-16 h-px bg-black/[0.08] dark:bg-white/[0.08] mx-auto" />
              </div>

              <Chapter 
                verses={chapterData.verses} 
                layoutMode={layout === "side-by-side" ? "bilingual" : "stacked"}
                fontSize={fontSize}
                book={chapterData.book}
                chapterNum={chapterData.chapterNum}
                toHebrewNumeral={toHebrewNumeral}
              />
            </div>
          );
        })}
        
        {/* DOWNWARD SCROLL LOADER */}
        <div ref={loaderRef} className="h-48 flex items-center justify-center">
          {isLoading && (
            <div className="w-5 h-5 border-2 border-black/10 border-t-black/40 rounded-full animate-spin" />
          )}
        </div>
      </main>
    </div>
  );
}