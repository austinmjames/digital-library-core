import { useState, useCallback } from "react";
import { ChapterData, Verse } from "@/lib/types/library";

/**
 * ReaderLayoutState
 * Updated to include Profile and Appearance panel states.
 */
export type ReaderLayoutState = {
  state: {
    activeBook: string;
    activeChapter: number;
    isNavOpen: boolean;
    isTransPanelOpen: boolean;
    isTodayOpen: boolean;
    isMarketplaceOpen: boolean;
    isProfileOpen: boolean; // New
    isAppearanceOpen: boolean; // New
    selectedVerseRef: string | null;
    editingVerse: Verse | null;
    isPanelOpen: boolean;
  };
  setters: {
    setActiveBook: (val: string) => void;
    setActiveChapter: (val: number) => void;
    setIsNavOpen: (val: boolean) => void;
    setIsTransPanelOpen: (val: boolean) => void;
    setIsTodayOpen: (val: boolean) => void;
    setIsMarketplaceOpen: (val: boolean) => void;
    setIsProfileOpen: (val: boolean) => void; // New
    setIsAppearanceOpen: (val: boolean) => void; // New
    setSelectedVerseRef: (val: string | null) => void;
    setEditingVerse: (val: Verse | null) => void;
  };
  actions: {
    closeSideMenus: () => void;
    openNav: () => void;
    openTranslations: () => void;
    openMarketplace: () => void;
    openProfile: () => void; // New
    openAppearance: () => void; // New
    toggleToday: () => void;
    clearSelection: () => void;
  };
};

export function useReaderLayoutState(
  initialChapter: ChapterData
): ReaderLayoutState {
  const [activeBook, setActiveBook] = useState(initialChapter?.book || "");
  const [activeChapter, setActiveChapter] = useState(
    initialChapter?.chapterNum || 0
  );

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isTransPanelOpen, setIsTransPanelOpen] = useState(false);
  const [isTodayOpen, setIsTodayOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);

  const [selectedVerseRef, setSelectedVerseRef] = useState<string | null>(null);
  const [editingVerse, setEditingVerse] = useState<Verse | null>(null);

  const isPanelOpen =
    !!selectedVerseRef ||
    !!editingVerse ||
    isTransPanelOpen ||
    isTodayOpen ||
    isMarketplaceOpen ||
    isProfileOpen ||
    isAppearanceOpen;

  const closeSideMenus = useCallback(() => {
    setIsTransPanelOpen(false);
    setIsTodayOpen(false);
    setIsMarketplaceOpen(false);
    setIsProfileOpen(false);
    setIsAppearanceOpen(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedVerseRef(null);
    setEditingVerse(null);
  }, []);

  const openNav = useCallback(() => setIsNavOpen(true), []);

  const openTranslations = useCallback(() => {
    closeSideMenus();
    setIsTransPanelOpen(true);
    clearSelection();
  }, [closeSideMenus, clearSelection]);

  const openMarketplace = useCallback(() => {
    closeSideMenus();
    setIsMarketplaceOpen(true);
    clearSelection();
  }, [closeSideMenus, clearSelection]);

  const openProfile = useCallback(() => {
    closeSideMenus();
    setIsProfileOpen(true);
    clearSelection();
  }, [closeSideMenus, clearSelection]);

  const openAppearance = useCallback(() => {
    closeSideMenus();
    setIsAppearanceOpen(true);
    clearSelection();
  }, [closeSideMenus, clearSelection]);

  const toggleToday = useCallback(() => {
    const next = !isTodayOpen;
    closeSideMenus();
    setIsTodayOpen(next);
    clearSelection();
  }, [isTodayOpen, closeSideMenus, clearSelection]);

  return {
    state: {
      activeBook,
      activeChapter,
      isNavOpen,
      isTransPanelOpen,
      isTodayOpen,
      isMarketplaceOpen,
      isProfileOpen,
      isAppearanceOpen,
      selectedVerseRef,
      editingVerse,
      isPanelOpen,
    },
    setters: {
      setActiveBook,
      setActiveChapter,
      setIsNavOpen,
      setIsTransPanelOpen,
      setIsTodayOpen,
      setIsMarketplaceOpen,
      setIsProfileOpen,
      setIsAppearanceOpen,
      setSelectedVerseRef,
      setEditingVerse,
    },
    actions: {
      closeSideMenus,
      openNav,
      openTranslations,
      openMarketplace,
      openProfile,
      openAppearance,
      toggleToday,
      clearSelection,
    },
  };
}
