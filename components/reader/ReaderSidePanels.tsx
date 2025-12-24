"use client";

import React from "react";
import { NavigationMenu } from "./NavigationMenu";
import { CommentaryPanel } from "./CommentaryPanel";
import { TranslationPanel } from "./TranslationPanel";
import { TranslationEditor } from "./TranslationEditor";
import { TodayMenu } from "./TodayMenu";
import { Verse } from "@/lib/types/library";

interface ReaderSidePanelsProps {
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  activeBook: string;
  activeChapter: number;
  selectedVerseRef: string | null;
  setSelectedVerseRef: (ref: string | null) => void;
  isTransPanelOpen: boolean;
  setIsTransPanelOpen: (open: boolean) => void;
  isTodayOpen: boolean;
  setIsTodayOpen: (open: boolean) => void;
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
  // Validating these exist
  editingVerse: Verse | null;
  setEditingVerse: (verse: Verse | null) => void;
  bookSlug?: string;
}

/**
 * ReaderSidePanels
 * Manages all overlay interactions (Navigation, Commentary, Translations, Today Menu, and the Editor).
 */
export function ReaderSidePanels({
  isNavOpen,
  setIsNavOpen,
  activeBook,
  activeChapter,
  selectedVerseRef,
  setSelectedVerseRef,
  isTransPanelOpen,
  setIsTransPanelOpen,
  isTodayOpen,
  setIsTodayOpen,
  activeLayerId,
  setActiveLayerId,
  editingVerse,
  setEditingVerse,
  bookSlug,
}: ReaderSidePanelsProps) {
  return (
    <>
      <NavigationMenu
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        currentBook={activeBook}
      />

      <TodayMenu isOpen={isTodayOpen} onClose={() => setIsTodayOpen(false)} />

      <CommentaryPanel
        verseRef={selectedVerseRef}
        onClose={() => setSelectedVerseRef(null)}
      />

      <TranslationPanel
        isOpen={isTransPanelOpen}
        onClose={() => setIsTransPanelOpen(false)}
        activeVersionId={activeLayerId}
        onSelectVersion={(id: string | null) =>
          setActiveLayerId(id ?? "jps-1985")
        }
      />

      {editingVerse && (
        <TranslationEditor
          isOpen={!!editingVerse}
          onClose={() => setEditingVerse(null)}
          bookSlug={bookSlug || activeBook.toLowerCase()}
          chapterNum={activeChapter}
          verseNum={editingVerse.c2_index}
          verseRef={editingVerse.id}
          sourceText={editingVerse.he}
          initialTranslation={editingVerse.en}
          versionId={activeLayerId.length > 20 ? activeLayerId : undefined}
        />
      )}
    </>
  );
}
