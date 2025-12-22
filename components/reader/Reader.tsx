"use client";

import { useState, useEffect, useRef, useCallback, CSSProperties } from "react";
import { fetchNextChapter } from "@/app/actions";
import { cn } from "@/lib/utils";
import Chapter from "@/components/reader/Chapter";
import { useTextSettings } from "@/components/text-settings-context";
import { NavigationMenu } from "@/components/reader/NavigationMenu";
import { ReaderHeader } from "@/components/reader/ReaderHeader";

// Collections allowed to scroll between different books
const CONTINUOUS_COLLECTIONS = ["tanakh", "torah", "prophets", "writings", "bible"];

/**
 * TANAKH_METADATA
 */
const TANAKH_METADATA: Record<string, { chapters: number }> = {
  "Genesis": { chapters: 50 },
  "Exodus": { chapters: 40 },
  "Leviticus": { chapters: 27 },
  "Numbers": { chapters: 36 },
  "Deuteronomy": { chapters: 34 },
  "Joshua": { chapters: 24 },
  "Judges": { chapters: 21 },
  "I Samuel": { chapters: 31 },
  "II Samuel": { chapters: 24 },
  "I Kings": { chapters: 22 },
  "II Kings": { chapters: 25 },
  "Isaiah": { chapters: 66 },
  "Jeremiah": { chapters: 52 },
  "Ezekiel": { chapters: 48 },
  "Hosea": { chapters: 14 },
  "Joel": { chapters: 4 },
  "Amos": { chapters: 9 },
  "Obadiah": { chapters: 1 },
  "Jonah": { chapters: 4 },
  "Micah": { chapters: 7 },
  "Nahum": { chapters: 3 },
  "Habakkuk": { chapters: 3 },
  "Zephaniah": { chapters: 3 },
  "Haggai": { chapters: 2 },
  "Zechariah": { chapters: 14 },
  "Malachi": { chapters: 3 },
  "Psalms": { chapters: 150 },
  "Proverbs": { chapters: 31 },
  "Job": { chapters: 42 },
  "Song of Songs": { chapters: 8 },
  "Ruth": { chapters: 4 },
  "Lamentations": { chapters: 5 },
  "Ecclesiastes": { chapters: 12 },
  "Esther": { chapters: 10 },
  "Daniel": { chapters: 12 },
  "Ezra": { chapters: 10 },
  "Nehemiah": { chapters: 13 },
  "I Chronicles": { chapters: 29 },
  "II Chronicles": { chapters: 36 }
};

const TANAKH_ORDER = Object.keys(TANAKH_METADATA);

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
  collection?: string; 
  verses: Verse[];
  nextRef?: string;
  prevRef?: string; 
}

interface InteractiveReaderProps {
  initialChapter: ChapterData;
}

export default function InteractiveReader({ initialChapter }: InteractiveReaderProps) {
  const { language, layout, fontSize } = useTextSettings();

  const [chapters, setChapters] = useState<ChapterData[]>([initialChapter]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState(false); 
  
  const [hasMore, setHasMore] = useState(!!initialChapter?.nextRef);
  const [hasPrev, setHasPrev] = useState(!!initialChapter?.prevRef);
  
  const [activeCollection, setActiveCollection] = useState(initialChapter?.collection || "tanakh");
  const [activeBook, setActiveBook] = useState(initialChapter?.book || "");
  const [activeChapter, setActiveChapter] = useState(initialChapter?.chapterNum || 0);
  const [isNavOpen, setIsNavOpen] = useState(false); 

  const loaderRef = useRef<HTMLDivElement>(null);
  const prevLoaderRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const getChapterId = (id: string) => `chapter-${id.replace(/[^a-zA-Z0-9]/g, '-')}`;

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // --- FOOTNOTE LOGIC ---
  useEffect(() => {
    const handleFootnoteClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // We look for our custom icon wrapper OR standard sefaria classes
      const trigger = target.closest(".footnote-trigger-icon, .sefaria-note-trigger, [data-note-id]");
      
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();

        // 1. Try finding a wrapper (Standard Sefaria structure)
        const wrapper = trigger.closest(".sefaria-note-wrapper") || trigger.closest(".footnote-container");
        if (wrapper) {
          wrapper.classList.toggle("expanded");
          return;
        }

        // 2. Fallback: Try finding a sibling note (Common in some formats)
        let nextNode = trigger.nextElementSibling;
        
        if (!nextNode && trigger.parentElement?.tagName === "SUP") {
          nextNode = trigger.parentElement.nextElementSibling;
        }

        if (nextNode && (nextNode.classList.contains("sefaria-note") || nextNode.classList.contains("footnote-content"))) {
          // FIXED: Cast to HTMLElement to access .style
          const noteElement = nextNode as HTMLElement;
          
          if (noteElement.classList.contains("hidden") || getComputedStyle(noteElement).display === "none") {
            noteElement.style.display = "block";
            noteElement.classList.remove("hidden");
            noteElement.classList.add("block");
          } else {
            noteElement.style.display = "none";
            noteElement.classList.remove("block");
            noteElement.classList.add("hidden");
          }
        }
      }
    };
    
    document.addEventListener("click", handleFootnoteClick, true);
    return () => document.removeEventListener("click", handleFootnoteClick, true);
  }, []);

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
      console.log("Reader: Requesting previous:", firstChapter.prevRef);
      const newChapter = await fetchNextChapter(firstChapter.prevRef) as ChapterData | null;
      
      if (newChapter) {
        // Prevent duplicates
        if (chapters.some(c => c.id === newChapter.id)) {
          console.warn("Reader: Duplicate chapter detected. Clamping reached.");
          setHasPrev(false);
          return;
        }

        const isContinuous = CONTINUOUS_COLLECTIONS.includes(activeCollection.toLowerCase());
        
        // Handle book transitions
        if (newChapter.book !== firstChapter.book) {
          if (!isContinuous) {
            console.log("Reader: Book boundary reached in non-continuous collection.");
            setHasPrev(false);
            return;
          }
          console.log(`Reader: Transitioning from ${firstChapter.book} to ${newChapter.book}`);
        }

        /**
         * BRIDGE REINFORCEMENT:
         * Ensure new chapters maintain their "upward runway" logic.
         */
        if (!newChapter.prevRef) {
          if (newChapter.chapterNum > 1) {
            newChapter.prevRef = `${newChapter.book} ${newChapter.chapterNum - 1}`;
          } else if (isContinuous) {
            const bIdx = TANAKH_ORDER.indexOf(newChapter.book);
            if (bIdx > 0) {
              const prevBookName = TANAKH_ORDER[bIdx - 1];
              const prevBookChapterCount = TANAKH_METADATA[prevBookName]?.chapters || 1;
              newChapter.prevRef = `${prevBookName} ${prevBookChapterCount}`;
            }
          }
        }

        setChapters((prev) => [newChapter, ...prev]);
        setHasPrev(!!newChapter.prevRef);
        
        // Precise scroll adjustment for prepending
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const newHeight = doc.scrollHeight;
            const heightDiff = newHeight - previousHeight;
            if (heightDiff > 0) {
              window.scrollTo({ 
                top: previousScrollTop + heightDiff, 
                behavior: "instant" 
              });
            }
          });
        });
      } else {
        setHasPrev(false);
      }
    } catch (e) { 
      console.error("Reader: Upscroll failed:", e); 
    } finally { 
      setIsLoadingPrev(false); 
    }
  }, [chapters, isLoadingPrev, hasPrev, activeCollection]);

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
        if (chapters.some(c => c.id === newChapter.id)) {
          setHasMore(false);
          return;
        }

        const isContinuous = CONTINUOUS_COLLECTIONS.includes(activeCollection.toLowerCase());
        if (newChapter.book !== lastChapter.book && !isContinuous) {
          setHasMore(false);
          return;
        }

        if (!newChapter.nextRef && isContinuous) {
            const bIdx = TANAKH_ORDER.indexOf(newChapter.book);
            if (newChapter.chapterNum >= (TANAKH_METADATA[newChapter.book]?.chapters || 0)) {
                if (bIdx < TANAKH_ORDER.length - 1) {
                    newChapter.nextRef = `${TANAKH_ORDER[bIdx + 1]} 1`;
                }
            }
        }

        setChapters((prev) => [...prev, newChapter]);
        setHasMore(!!newChapter.nextRef);
      } else {
        setHasMore(false);
      }
    } catch (e) { 
      console.error("Reader: Downscroll failed:", e); 
    } finally { 
      setIsLoading(false); 
    }
  }, [chapters, isLoading, hasMore, activeCollection]);

  // --- RESET ON NAVIGATION ---
  useEffect(() => {
    if (initialChapter) {
      const isContinuous = CONTINUOUS_COLLECTIONS.includes((initialChapter.collection || "tanakh").toLowerCase());
      
      if (!initialChapter.prevRef && isContinuous && initialChapter.chapterNum === 1) {
        const bIdx = TANAKH_ORDER.indexOf(initialChapter.book);
        if (bIdx > 0) {
          const prevBookName = TANAKH_ORDER[bIdx - 1];
          const prevBookChapterCount = TANAKH_METADATA[prevBookName]?.chapters || 1;
          initialChapter.prevRef = `${prevBookName} ${prevBookChapterCount}`;
        }
      }

      setChapters([initialChapter]);
      setHasMore(!!initialChapter.nextRef);
      setHasPrev(!!initialChapter.prevRef);
      setActiveCollection(initialChapter.collection || "tanakh");
      setActiveBook(initialChapter.book);
      setActiveChapter(initialChapter.chapterNum);
      
      if (initialChapter.prevRef) {
        let attempts = 0;
        const attemptAnchor = () => {
          const chapterId = getChapterId(initialChapter.id);
          const el = document.getElementById(chapterId);
          if (el && el.offsetTop > 0) {
            const offset = el.offsetTop - 64; 
            window.scrollTo({ top: offset, behavior: "instant" });
            if (attempts < 5) {
              attempts++;
              setTimeout(attemptAnchor, 50);
            }
          } else if (attempts < 20) {
            attempts++;
            setTimeout(attemptAnchor, 50);
          }
        };
        setTimeout(attemptAnchor, 100);
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    }
  }, [initialChapter]);

  // --- SCROLL HANDLING ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 350 && hasPrev && !isLoadingPrev) {
        loadPrev();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasPrev, isLoadingPrev, loadPrev]);

  useEffect(() => {
    const downObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: "1500px" }); 
    if (loaderRef.current) downObserver.observe(loaderRef.current);
    return () => downObserver.disconnect();
  }, [loadMore]);

  // Scroll Spy for header and URL sync
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const coll = entry.target.getAttribute("data-collection");
            const bk = entry.target.getAttribute("data-book");
            const ch = entry.target.getAttribute("data-chapter");
            if (bk && ch) {
              if (coll) setActiveCollection(coll);
              setActiveBook(bk);
              setActiveChapter(parseInt(ch, 10));
            }
          }
        });
      }, { rootMargin: "-15% 0px -80% 0px" } 
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
        onSelect={(ref: string) => {
          const lastSpaceIndex = ref.lastIndexOf(' ');
          let bSlug = "";
          let cNum = "1";
          if (lastSpaceIndex === -1) {
            bSlug = ref.toLowerCase().replace(/\s+/g, '-');
          } else {
            bSlug = ref.substring(0, lastSpaceIndex).toLowerCase().replace(/\s+/g, '-');
            cNum = ref.substring(lastSpaceIndex + 1);
          }
          const collectionSlug = (activeCollection || "tanakh").toLowerCase().replace(/\s+/g, '-');
          window.location.href = `/library/${collectionSlug}/${bSlug}/${cNum}`;
        }} 
        currentBook={activeBook}
      />
      
      <ReaderHeader 
        activeBook={activeBook}
        activeChapter={activeChapter}
        onOpenNav={() => setIsNavOpen(true)}
      />

      <main 
        className={cn("mx-auto mt-6 px-6 md:px-12 transition-all duration-500", 
          layout === "side-by-side" && language === "both" ? "max-w-7xl" : "max-w-4xl"
        )}
        style={{ fontSize: `${fontSize}pt` } as CSSProperties}
      >
        {/* UPWARD SCROLL RUNWAY */}
        <div 
          ref={prevLoaderRef} 
          className={cn(
            "flex flex-col items-center justify-center transition-all duration-500",
            hasPrev ? "h-32 opacity-100 mb-4" : "h-0 opacity-0 overflow-hidden"
          )}
        >
            {hasPrev && !isLoadingPrev && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-px h-8 bg-gradient-to-b from-transparent to-black/[0.05] dark:to-white/[0.05]" />
                <button 
                  onClick={loadPrev}
                  className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/20 hover:text-black/40 dark:text-white/20 dark:hover:text-white/40 transition-all"
                >
                  Pull to Load Previous
                </button>
              </div>
            )}
        </div>

        {chapters.map((chapterData) => {
          const firstChapterOfThisBook = chapters.find(c => c.book === chapterData.book);
          const isFirstHeader = firstChapterOfThisBook?.id === chapterData.id;

          return (
            <div 
              key={chapterData.id} 
              id={getChapterId(chapterData.id)} 
              data-collection={chapterData.collection || "tanakh"}
              data-book={chapterData.book} 
              data-chapter={chapterData.chapterNum} 
              ref={(el) => { if (el) chapterRefs.current.set(chapterData.id, el); }}
              className="mb-16 scroll-mt-24"
            >
              <div className="py-16 text-center select-none">
                <h2 className="text-5xl md:text-6xl font-serif text-black/90 dark:text-white/90 tracking-tight leading-none">
                  {isFirstHeader && (
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
        
        <div ref={loaderRef} className="h-48 flex items-center justify-center">
          {isLoading && (
            <div className="w-5 h-5 border-2 border-black/10 border-t-black/40 rounded-full animate-spin" />
          )}
        </div>
      </main>
    </div>
  );
}
