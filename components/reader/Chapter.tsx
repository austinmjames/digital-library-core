"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { useTextSettings } from "@/components/context/text-settings-context";
import { Verse } from "@/lib/types/library";

interface ChapterProps {
  verses: Verse[];
  chapterNum: number;
  selectedVerseId?: string | null;
  onVerseClick: (verseId: string) => void;
}

/**
 * components/reader/Chapter.tsx
 * Optimized reader view utilizing the unified DisplayMode.
 * Merges user-preferred styling with central state management.
 */
const Chapter = memo(
  ({ verses, selectedVerseId, onVerseClick }: ChapterProps) => {
    const { displayMode, fontSize, showFootnotes } = useTextSettings();

    // Logic helpers mapped from the unified displayMode
    const showHebrew =
      displayMode === "hebrew" || displayMode.startsWith("bilingual");
    const showEnglish =
      displayMode === "english" || displayMode.startsWith("bilingual");
    const isParallel = displayMode === "bilingual-parallel";
    const isStacked = displayMode === "bilingual-stacked";

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
              <div
                key={verse.id}
                onClick={() => onVerseClick(verse.id)}
                className={cn(
                  "group transition-all duration-300 rounded-xl p-3 md:p-4 cursor-pointer border",
                  isSelected
                    ? "bg-highlight border-gold/30 shadow-sm scale-[1.01]"
                    : "bg-transparent border-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02]",
                  isParallel
                    ? "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start"
                    : "flex flex-col gap-4"
                )}
              >
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
                    style={{ fontSize: `${fontSize * 0.85}pt` }} // English usually needs to be slightly smaller visually
                  >
                    {isStacked && showHebrew && (
                      <div className="h-px w-8 bg-gold/20 mb-4" />
                    )}
                    <span
                      className={cn(
                        "absolute -left-8 top-1 text-[10px] font-mono select-none block w-6 text-center pt-1 transition-colors",
                        displayMode === "english" && "text-base", // Make bigger if English only
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
            );
          })}
        </div>
      </article>
    );
  }
);

Chapter.displayName = "Chapter";
export default Chapter;
