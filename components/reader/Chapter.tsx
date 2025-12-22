"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface Verse {
  c2_index: number;
  he?: string;
  en?: string;
  id: string;
}

interface ChapterProps {
  verses: Verse[];
  layoutMode: string;
  fontSize: number;
  book: string;
  chapterNum: number;
  toHebrewNumeral: (n: number) => string;
}

const Chapter = memo(({ verses, layoutMode, fontSize, book, chapterNum, toHebrewNumeral }: ChapterProps) => {
  return (
    <article 
      className="animate-in fade-in duration-700"
      data-book={book}
      data-chapter={chapterNum}
    >
      <div className="space-y-10">
        {verses.map((verse) => (
          <div 
            key={verse.id} 
            className={cn(
              "group transition-colors rounded-xl p-2 relative",
              layoutMode === "bilingual" ? "grid grid-cols-1 md:grid-cols-12 gap-12" : "flex flex-col gap-6"
            )}
          >
            {/* HEBREW */}
            {(layoutMode !== "english") && (
              <div 
                className={cn(
                  "hebrew-text leading-relaxed text-ink text-right relative",
                  layoutMode === "bilingual" ? "md:col-span-6 order-last" : "w-full"
                )}
                style={{ fontSize: `${fontSize}pt` }}
              >
                 <span className="absolute -right-12 top-1 text-base text-pencil/40 font-serif select-none">
                  {toHebrewNumeral(verse.c2_index)}
                </span>
                <div 
                  dangerouslySetInnerHTML={{ __html: verse.he || "" }}
                  className="inline" 
                />
              </div>
            )}

            {/* ENGLISH */}
            {(layoutMode !== "hebrew") && (
              <div 
                className={cn(
                  "font-english leading-relaxed text-ink/70 relative",
                  layoutMode === "bilingual" ? "md:col-span-6 order-first text-left" : "w-full text-left max-w-2xl"
                )}
                style={{ fontSize: `${fontSize * 0.8}pt` }}
              >
                <span className={cn(
                  "absolute -left-12 top-1 text-[10px] text-pencil/40 font-mono select-none block"
                )}>
                  {verse.c2_index}
                </span>
                <div dangerouslySetInnerHTML={{ __html: verse.en || "" }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </article>
  );
});

Chapter.displayName = "Chapter";
export default Chapter;