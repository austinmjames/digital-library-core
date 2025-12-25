import { useState, useCallback } from "react";
import { ChapterData, Verse } from "@/lib/types/library";

/**
 * PanelType
 * Unified sub-views. APPEARANCE is handled within ACCOUNT.
 */
export type PanelType =
  | "TODAY"
  | "COMMENTARY"
  | "MARKETPLACE"
  | "LAYERS"
  | "ACCOUNT";

/**
 * MasterPanelState
 * FIXED: Removed unused 'ReactNode' import.
 */
export type MasterPanelState = {
  state: {
    activeBook: string;
    activeChapter: number;
    isNavOpen: boolean;
    isPanelOpen: boolean;
    activePanel: PanelType;
    selectedVerseRef: string | null;
    editingVerse: Verse | null;
  };
  setters: {
    setActiveBook: (val: string) => void;
    setActiveChapter: (val: number) => void;
    setIsNavOpen: (val: boolean) => void;
    setIsPanelOpen: (val: boolean) => void;
    setActivePanel: (val: PanelType) => void;
    setSelectedVerseRef: (val: string | null) => void;
    setEditingVerse: (val: Verse | null) => void;
  };
  actions: {
    openPanel: (type: PanelType) => void;
    closePanel: () => void;
    togglePanel: () => void;
    openNav: () => void;
    clearSelection: () => void;
  };
};

export function useMasterPanel(initialChapter: ChapterData): MasterPanelState {
  const [activeBook, setActiveBook] = useState(initialChapter?.book || "");
  const [activeChapter, setActiveChapter] = useState(
    initialChapter?.chapterNum || 0
  );

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelType>("TODAY");

  const [selectedVerseRef, setSelectedVerseRef] = useState<string | null>(null);
  const [editingVerse, setEditingVerse] = useState<Verse | null>(null);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const openPanel = useCallback((type: PanelType) => {
    setActivePanel(type);
    setIsPanelOpen(true);
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedVerseRef(null);
    setEditingVerse(null);
  }, []);

  const openNav = useCallback(() => setIsNavOpen(true), []);

  return {
    state: {
      activeBook,
      activeChapter,
      isNavOpen,
      isPanelOpen,
      activePanel,
      selectedVerseRef,
      editingVerse,
    },
    setters: {
      setActiveBook,
      setActiveChapter,
      setIsNavOpen,
      setIsPanelOpen,
      setActivePanel,
      setSelectedVerseRef,
      setEditingVerse,
    },
    actions: {
      openPanel,
      closePanel,
      togglePanel,
      openNav,
      clearSelection,
    },
  };
}
