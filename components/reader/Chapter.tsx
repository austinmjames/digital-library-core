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
  canEdit: boolean;
  onVerseClick: (verseId: string) => void;
  onVerseLongPress: (verse: Verse) => void;
}

/**
 * components/reader/Chapter.tsx
 * Updated: Refined with modern UI typography (Segoe UI/Inter) and a tactile "imprinted" feel.
 * Replaced gold accents with Powder Blue and simplified the hierarchy for a cleaner scholarly look.
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

    // Layout configuration from unified settings
    const showHebrew =
      displayMode === "hebrew" || displayMode.startsWith("bilingual");
    const showEnglish =
      displayMode === "english" || displayMode.startsWith("bilingual");
    const isParallel = displayMode === "bilingual-parallel";
    const isStacked = displayMode === "bilingual-stacked";

    /**
     * startPress
     * Initiates the long-press timer only if editing is allowed.
     */
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
      <article className="animate-in fade-in duration-700 font-sans">
        <div
          className={cn("space-y-4", isParallel ? "space-y-8" : "space-y-4")}
        >
          {verses.map((verse) => {
            const isSelected = selectedVerseId === verse.id;

            return (
              <React.Fragment key={verse.id}>
                {/* Modern Parshah Header */}
                {verse.parashaStart && (
                  <div className="py-20 flex items-center justify-center select-none">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-px w-8 bg-pencil/10" />
                      <h3 className="text-xs font-black text-pencil/40 uppercase tracking-[0.5em] text-center leading-none">
                        {verse.parashaStart}
                      </h3>
                      <div className="h-px w-8 bg-pencil/10" />
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
                    "group relative transition-all duration-500 rounded-2xl p-4 md:p-8 cursor-pointer border select-none",
                    isSelected
                      ? "bg-highlight/50 border-accent/20 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]"
                      : "bg-transparent border-transparent hover:bg-black/[0.01] dark:hover:bg-white/[0.01]",
                    isParallel
                      ? "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-start"
                      : "flex flex-col gap-5"
                  )}
                >
                  {/* Floating Action Hint */}
                  {canEdit && (
                    <div className="absolute top-3 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <span className="text-[8px] font-bold text-pencil/40 uppercase tracking-widest">
                        Interpret
                      </span>
                      <Edit3 className="w-3 h-3 text-accent" />
                    </div>
                  )}

                  {showHebrew && (
                    <div
                      className={cn(
                        "hebrew-text text-ink text-right relative leading-[1.85]",
                        isParallel ? "order-2" : "w-full max-w-3xl ml-auto"
                      )}
                      style={{ fontSize: `${fontSize}pt` }}
                    >
                      <span
                        className={cn(
                          "absolute -right-12 top-1 text-sm font-semibold select-none w-10 text-center transition-colors font-sans",
                          isSelected ? "text-accent" : "text-pencil/15"
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
                        "english-text text-ink/80 text-left relative leading-[1.65]",
                        isParallel ? "order-1" : "w-full max-w-3xl mr-auto"
                      )}
                      style={{ fontSize: `${fontSize * 0.88}pt` }}
                    >
                      {isStacked && showHebrew && (
                        <div className="h-px w-6 bg-pencil/5 mb-6" />
                      )}
                      <span
                        className={cn(
                          "absolute -left-12 top-1 text-[10px] font-bold select-none block w-10 text-center pt-1 transition-colors font-sans",
                          displayMode === "english" && "text-sm",
                          isSelected ? "text-accent" : "text-pencil/15"
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
