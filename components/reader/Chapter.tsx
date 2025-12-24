"use client";

import React, { memo, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useTextSettings } from "@/components/context/text-settings-context";
import { Verse } from "@/lib/types/library";
import { Edit3 } from "lucide-react";

interface ChapterProps {
  verses: Verse[];
  chapterNum: number;
  selectedVerseId?: string | null;
  onVerseClick: (verseId: string) => void;
  onVerseLongPress: (verse: Verse) => void;
}

/**
 * components/reader/Chapter.tsx
 * Optimized reader view for the TorahPro library.
 * Features iOS-style long-press gestures, haptic feedback simulation, and bilingual layouts.
 */
const Chapter = memo(
  ({
    verses,
    selectedVerseId,
    onVerseClick,
    onVerseLongPress,
  }: ChapterProps) => {
    const { displayMode, fontSize, showFootnotes } = useTextSettings();
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    // Layout configuration from unified settings
    const showHebrew =
      displayMode === "hebrew" || displayMode.startsWith("bilingual");
    const showEnglish =
      displayMode === "english" || displayMode.startsWith("bilingual");
    const isParallel = displayMode === "bilingual-parallel";
    const isStacked = displayMode === "bilingual-stacked";

    /**
     * startPress
     * Initiates the long-press timer. 500ms is the standard iOS threshold.
     */
    const startPress = useCallback(
      (verse: Verse) => {
        longPressTimer.current = setTimeout(() => {
          onVerseLongPress(verse);
          // Subtle haptic feedback if the browser/device supports it
          if (typeof window !== "undefined" && window.navigator.vibrate) {
            window.navigator.vibrate(10);
          }
        }, 500);
      },
      [onVerseLongPress]
    );

    /**
     * endPress
     * Cancels the long-press timer if the user releases early (standard click).
     */
    const endPress = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    }, []);

    const toHebrewNumeral = (n: number) => {
      const letters = [
        "",
        "א",
        "ב",
        "ג",
        "ד",
        "ה",
        "ו",
        "ז",
        "ח",
        "ט",
        "י",
        "יא",
        "יב",
        "יג",
        "יד",
        "טו",
        "טז",
        "יז",
        "יח",
        "יט",
        "כ",
      ];
      return letters[n] || n.toString();
    };

    return (
      <article className="animate-in fade-in duration-700">
        <div
          className={cn("space-y-4", isParallel ? "space-y-8" : "space-y-4")}
        >
          {verses.map((verse) => {
            const isSelected = selectedVerseId === verse.id;

            return (
              <React.Fragment key={verse.id}>
                {/* Section/Parashah Markers (e.g., Parashat Bereshit) */}
                {verse.parashaStart && (
                  <div className="py-16 flex items-center justify-center select-none">
                    <div className="flex flex-col items-center gap-3">
                      <h3 className="text-xl md:text-2xl font-serif font-bold text-pencil/40 italic tracking-widest uppercase">
                        {verse.parashaStart}
                      </h3>
                      <div className="h-px w-24 bg-gold/20" />
                    </div>
                  </div>
                )}

                {/* Verse Container */}
                <div
                  onClick={() => onVerseClick(verse.id)}
                  onMouseDown={() => startPress(verse)}
                  onMouseUp={endPress}
                  onMouseLeave={endPress}
                  onTouchStart={() => startPress(verse)}
                  onTouchEnd={endPress}
                  className={cn(
                    "group relative transition-all duration-500 rounded-2xl p-4 md:p-6 cursor-pointer border select-none",
                    isSelected
                      ? "bg-highlight border-gold/30 shadow-sm scale-[1.01]"
                      : "bg-transparent border-transparent hover:bg-black/[0.01] dark:hover:bg-white/[0.01]",
                    isParallel
                      ? "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start"
                      : "flex flex-col gap-4"
                  )}
                >
                  {/* Floating Action Hint - Appears on hover for desktop */}
                  <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <span className="text-[9px] font-bold text-pencil uppercase tracking-tighter">
                      Long-press to translate
                    </span>
                    <Edit3 className="w-3 h-3 text-gold/50" />
                  </div>

                  {/* Hebrew Layer */}
                  {showHebrew && (
                    <div
                      className={cn(
                        "hebrew-text text-ink text-right relative leading-[1.8]",
                        isParallel ? "order-2" : "w-full max-w-3xl ml-auto"
                      )}
                      style={{ fontSize: `${fontSize}pt` }}
                    >
                      {/* Hebrew Chapter/Verse Indicator */}
                      <span
                        className={cn(
                          "absolute -right-10 top-1 text-base font-serif select-none w-8 text-center transition-colors",
                          isSelected ? "text-gold font-bold" : "text-pencil/20"
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

                  {/* English Layer */}
                  {showEnglish && (
                    <div
                      className={cn(
                        "english-text text-ink/80 text-left relative leading-[1.6]",
                        isParallel ? "order-1" : "w-full max-w-3xl mr-auto"
                      )}
                      style={{ fontSize: `${fontSize * 0.85}pt` }}
                    >
                      {/* Visual separator for stacked view */}
                      {isStacked && showHebrew && (
                        <div className="h-px w-6 bg-gold/10 mb-4" />
                      )}

                      {/* English Chapter/Verse Indicator */}
                      <span
                        className={cn(
                          "absolute -left-10 top-1 text-[10px] font-mono select-none block w-8 text-center pt-1 transition-colors",
                          displayMode === "english" && "text-base",
                          isSelected ? "text-gold font-bold" : "text-pencil/20"
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
