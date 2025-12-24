"use client";

import React from "react";
import Chapter from "./Chapter";
import { ChapterData, Verse } from "@/lib/types/library";

interface ChapterListProps {
  chapters: ChapterData[];
  chapterRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  selectedVerseRef: string | null;
  onVerseClick: (id: string) => void;
  onVerseLongPress: (v: Verse) => void;
}

/**
 * ChapterList
 * Handles the mapping and individual rendering of chapters in the infinite scroll.
 */
export function ChapterList({
  chapters,
  chapterRefs,
  selectedVerseRef,
  onVerseClick,
  onVerseLongPress,
}: ChapterListProps) {
  return (
    <>
      {chapters.map((chapterData) => (
        <div
          key={chapterData.id}
          id={`chapter-${chapterData.id.replace(/[^a-zA-Z0-9]/g, "-")}`}
          data-book={chapterData.book}
          data-chapter={chapterData.chapterNum}
          ref={(el) => {
            if (el) chapterRefs.current.set(chapterData.id, el);
          }}
          className="mb-24 scroll-mt-24"
        >
          <div className="py-12 text-center select-none">
            <h2 className="text-4xl md:text-5xl font-serif text-ink tracking-tight leading-none">
              <span className="block text-sm md:text-base font-sans font-bold uppercase tracking-[0.2em] text-pencil/60 mb-3">
                {chapterData.book}
              </span>
              {chapterData.chapterNum}
            </h2>
          </div>
          <Chapter
            verses={chapterData.verses}
            chapterNum={chapterData.chapterNum}
            selectedVerseId={selectedVerseRef}
            onVerseClick={onVerseClick}
            onVerseLongPress={onVerseLongPress}
          />
        </div>
      ))}
    </>
  );
}
