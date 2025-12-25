"use client";

import React, { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { ChapterList } from "@/components/reader/ChapterList";
import { ChapterData, Verse } from "@/lib/types/library";

interface ReaderContentProps {
  displayMode: string;
  fontSize: number;
  hasPrev: boolean;
  prevLoaderRef: React.RefObject<HTMLDivElement | null>;
  loaderRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  chapters: ChapterData[];
  chapterRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  selectedVerseRef: string | null;
  canEdit: boolean;
  onVerseClick: (id: string) => void;
  onVerseLongPress: (v: Verse) => void;
}

/**
 * ReaderContent
 * Isolated component for the main scrollable reader area.
 */
export function ReaderContent({
  displayMode,
  fontSize,
  hasPrev,
  prevLoaderRef,
  loaderRef,
  isLoading,
  chapters,
  chapterRefs,
  selectedVerseRef,
  canEdit,
  onVerseClick,
  onVerseLongPress,
}: ReaderContentProps) {
  return (
    <div
      className={cn(
        "mx-auto mt-6 pb-32 transition-all duration-300",
        displayMode === "bilingual-parallel"
          ? "max-w-[1800px] px-8 md:px-20 lg:px-32" // Increased horizontal padding for centered parallel view
          : "max-w-4xl px-4 md:px-12"
      )}
      style={{ fontSize: `${fontSize}pt` } as CSSProperties}
    >
      {/* Upper Scroll Trigger */}
      <div
        ref={prevLoaderRef}
        className={cn(
          "h-32 flex items-center justify-center transition-opacity",
          !hasPrev && "hidden"
        )}
      />

      <ChapterList
        chapters={chapters}
        chapterRefs={chapterRefs}
        selectedVerseRef={selectedVerseRef}
        canEdit={canEdit}
        onVerseClick={onVerseClick}
        onVerseLongPress={onVerseLongPress}
      />

      {/* Lower Scroll Trigger */}
      <div ref={loaderRef} className="h-48 flex items-center justify-center">
        {isLoading && (
          <div className="w-6 h-6 border-2 border-pencil/30 border-t-gold rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
