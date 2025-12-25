"use client";

import React, { memo, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTextSettings } from "@/components/context/text-settings-context";
import { Verse } from "@/lib/types/library";
import { Edit3 } from "lucide-react";

interface ChapterProps {
  verses: Verse[];
  chapterNum: number;
  selectedVerseId?: string | null;
  canEdit: boolean;
  onVerseClick: (verseId: string) => void;
  onVerseLongPress: (verse: Verse) => void;
}

/**
 * components/reader/Chapter.tsx
 * Updated: Restored grey background highlight for selected verse.
 */
const Chapter = memo(
  ({
    verses,
    selectedVerseId,
    canEdit,
    onVerseClick,
    onVerseLongPress,
  }: ChapterProps) => {
    const { displayMode, fontSize, showFootnotes } = useTextSettings();
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const showHebrew =
      displayMode === "hebrew" || displayMode.startsWith("bilingual");
    const showEnglish =
      displayMode === "english" || displayMode.startsWith("bilingual");
    const isParallel = displayMode === "bilingual-parallel";
    const isStacked = displayMode === "bilingual-stacked";

    // --- Footnote Interaction Logic ---
    useEffect(() => {
      if (!containerRef.current) return;

      const handleFootnoteClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("sefaria-note-trigger")) {
          e.stopPropagation();
          const wrapper = target.closest(".sefaria-note-wrapper");
          if (wrapper) {
            wrapper.classList.toggle("expanded");
          }
        }
      };

      const container = containerRef.current;
      container.addEventListener("click", handleFootnoteClick);

      return () => {
        container.removeEventListener("click", handleFootnoteClick);
      };
    }, [verses, displayMode]);

    const startPress = useCallback(
      (verse: Verse) => {
        if (!canEdit) return;
        longPressTimer.current = setTimeout(() => {
          onVerseLongPress(verse);
          if (typeof window !== "undefined" && window.navigator.vibrate) {
            window.navigator.vibrate(10);
          }
        }, 500);
      },
      [onVerseLongPress, canEdit]
    );

    const endPress = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    }, []);

    const toHebrewNumeral = (n: number) => {
      if (n <= 0) return "";

      const letters: Record<number, string> = {
        1: "א",
        2: "ב",
        3: "ג",
        4: "ד",
        5: "ה",
        6: "ו",
        7: "ז",
        8: "ח",
        9: "ט",
        10: "י",
        20: "כ",
        30: "ל",
        40: "מ",
        50: "נ",
        60: "ס",
        70: "ע",
        80: "פ",
        90: "צ",
        100: "ק",
        200: "r",
        300: "ש",
        400: "ת",
      };

      let result = "";
      let remainder = n;

      if (remainder >= 100) {
        const hundreds = Math.floor(remainder / 100) * 100;
        if (letters[hundreds]) {
          result += letters[hundreds];
          remainder -= hundreds;
        }
      }

      if (remainder >= 10) {
        if (remainder === 15) return result + "טו";
        if (remainder === 16) return result + "טז";

        const tens = Math.floor(remainder / 10) * 10;
        result += letters[tens];
        remainder -= tens;
      }

      if (remainder > 0) {
        result += letters[remainder];
      }

      return result;
    };

    return (
      <article
        ref={containerRef}
        className="animate-in fade-in duration-700 font-sans"
      >
        <div
          className={cn(
            "space-y-0.5",
            isParallel ? "space-y-4" : "space-y-0.5"
          )}
        >
          {verses.map((verse) => {
            const isSelected = selectedVerseId === verse.id;

            return (
              <React.Fragment key={verse.id}>
                {verse.parashaStart && (
                  <div className="py-8 flex items-center justify-center select-none">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-px w-8 bg-pencil/10" />
                      <h3 className="text-xs font-black text-pencil/40 uppercase tracking-[0.5em] text-center leading-none">
                        {verse.parashaStart}
                      </h3>
                      <div className="h-px w-8 bg-pencil/10" />
                    </div>
                  </div>
                )}

                <div
                  // Added ID for anchoring
                  id={`verse-${verse.c2_index}`}
                  onClick={() => onVerseClick(verse.id)}
                  onMouseDown={() => startPress(verse)}
                  onMouseUp={endPress}
                  onMouseLeave={endPress}
                  onTouchStart={() => startPress(verse)}
                  onTouchEnd={endPress}
                  className={cn(
                    "group relative transition-all duration-300 rounded-2xl cursor-pointer border select-none",
                    "px-14 py-2 md:px-16 md:py-3",
                    isSelected
                      ? "bg-black/[0.04] border-transparent" // Restored visible grey highlight
                      : "bg-transparent border-transparent",
                    isParallel
                      ? "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 items-start"
                      : "flex flex-col gap-1"
                  )}
                >
                  {canEdit && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 pointer-events-none">
                      <span className="text-[9px] font-bold text-pencil/40 uppercase tracking-widest">
                        Interpret
                      </span>
                      <Edit3 className="w-3.5 h-3.5 text-accent" />
                    </div>
                  )}

                  {showHebrew && (
                    <div
                      className={cn(
                        "hebrew-text text-ink text-right relative leading-[1.6]",
                        isParallel ? "order-2" : "w-full max-w-3xl ml-auto"
                      )}
                      style={{ fontSize: `${fontSize}pt` }}
                    >
                      <span
                        className={cn(
                          "absolute -right-10 top-1 w-8 text-center transition-colors font-sans text-lg font-medium",
                          isSelected ? "text-pencil/50" : "text-pencil/20"
                        )}
                      >
                        {toHebrewNumeral(verse.c2_index)}
                      </span>
                      <div
                        dangerouslySetInnerHTML={{ __html: verse.he || "" }}
                        className={cn("inline", !showFootnotes && "hide-notes")}
                      />
                    </div>
                  )}

                  {showEnglish && (
                    <div
                      className={cn(
                        "english-text text-ink/80 text-left relative leading-[1.5]",
                        isParallel ? "order-1" : "w-full max-w-3xl mr-auto"
                      )}
                      style={{ fontSize: `${fontSize * 0.88}pt` }}
                    >
                      {isStacked && showHebrew && (
                        <div className="h-px w-8 bg-pencil/5 mb-1" />
                      )}
                      <span
                        className={cn(
                          "absolute -left-10 top-[0.3em] w-8 text-center transition-colors font-sans text-sm font-medium",
                          displayMode === "english" && "text-base",
                          isSelected ? "text-pencil/50" : "text-pencil/20"
                        )}
                      >
                        {verse.c2_index}
                      </span>
                      <div
                        dangerouslySetInnerHTML={{ __html: verse.en || "" }}
                        className={cn("inline", !showFootnotes && "hide-notes")}
                      />
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </article>
    );
  }
);

Chapter.displayName = "Chapter";
export default Chapter;
