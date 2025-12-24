"use client";

import React, { memo, useRef } from "react";
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
 * Merged version: Includes Parashah headers, long-press detection,
 * and responsive bilingual display modes.
 * Fixed: Removed invalid 'onHold' attribute and addressed type errors.
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

    const showHebrew =
      displayMode === "hebrew" || displayMode.startsWith("bilingual");
    const showEnglish =
      displayMode === "english" || displayMode.startsWith("bilingual");
    const isParallel = displayMode === "bilingual-parallel";
    const isStacked = displayMode === "bilingual-stacked";

    // Long Press Recognition (iOS Feel)
    const startPress = (verse: Verse) => {
      longPressTimer.current = setTimeout(() => {
        onVerseLongPress(verse);
      }, 600);
    };

    const endPress = () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

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
          className={cn("space-y-6", isParallel ? "space-y-8" : "space-y-6")}
        >
          {verses.map((verse) => {
            const isSelected = selectedVerseId === verse.id;

            return (
              <React.Fragment key={verse.id}>
                {/* Parashah Header Injection */}
                {verse.parashaStart && (
                  <div className="py-20 flex items-center justify-center select-none">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-px w-12 bg-gold/30" />
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-ink italic tracking-wide">
                        Parashat {verse.parashaStart}
                      </h3>
                      <div className="h-px w-12 bg-gold/30" />
                    </div>
                  </div>
                )}

                <div
                  onClick={() => onVerseClick(verse.id)}
                  onMouseDown={() => startPress(verse)}
                  onMouseUp={endPress}
                  onMouseLeave={endPress}
                  onTouchStart={() => startPress(verse)}
                  onTouchEnd={endPress}
                  className={cn(
                    "group relative transition-all duration-300 rounded-xl p-3 md:p-4 cursor-pointer border select-none",
                    isSelected
                      ? "bg-highlight border-gold/30 shadow-sm scale-[1.01]"
                      : "bg-transparent border-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02]",
                    isParallel
                      ? "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start"
                      : "flex flex-col gap-4"
                  )}
                >
                  {/* Floating iOS-style Edit Button (appears on hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVerseLongPress(verse);
                    }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ink text-paper text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 z-20 flex items-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>

                  {/* Hebrew Text */}
                  {showHebrew && (
                    <div
                      className={cn(
                        "hebrew-text text-ink text-right relative leading-relaxed",
                        isParallel ? "order-2" : "w-full max-w-3xl ml-auto"
                      )}
                      style={{ fontSize: `${fontSize}pt` }}
                    >
                      <span
                        className={cn(
                          "absolute -right-8 top-1 text-base font-serif select-none w-6 text-center transition-colors",
                          isSelected ? "text-gold font-bold" : "text-pencil/40"
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

                  {/* English Text */}
                  {showEnglish && (
                    <div
                      className={cn(
                        "english-text text-ink/80 text-left relative leading-relaxed",
                        isParallel ? "order-1" : "w-full max-w-3xl mr-auto"
                      )}
                      style={{ fontSize: `${fontSize * 0.85}pt` }}
                    >
                      {isStacked && showHebrew && (
                        <div className="h-px w-8 bg-gold/20 mb-4" />
                      )}
                      <span
                        className={cn(
                          "absolute -left-8 top-1 text-[10px] font-mono select-none block w-6 text-center pt-1 transition-colors",
                          displayMode === "english" && "text-base",
                          isSelected ? "text-gold font-bold" : "text-pencil/40"
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
