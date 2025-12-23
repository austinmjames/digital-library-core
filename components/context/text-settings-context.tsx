"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * components/context/text-settings-context.tsx
 * Unified Display Mode and persistent preferences.
 */

export type DisplayMode =
  | "hebrew"
  | "english"
  | "bilingual-stacked"
  | "bilingual-parallel";

interface TextSettings {
  displayMode: DisplayMode;
  fontSize: number;
  showFootnotes: boolean;
  setDisplayMode: (mode: DisplayMode) => void;
  setFontSize: (size: number) => void;
  setShowFootnotes: (show: boolean) => void;
}

const TextSettingsContext = createContext<TextSettings | undefined>(undefined);

export function TextSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize state
  const [displayMode, setDisplayMode] =
    useState<DisplayMode>("bilingual-parallel");
  const [fontSize, setFontSize] = useState(18);
  const [showFootnotes, setShowFootnotes] = useState(true);

  // Optional: Add simple persistence across refreshes
  useEffect(() => {
    const saved = localStorage.getItem("torahpro-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.displayMode) setDisplayMode(parsed.displayMode);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.showFootnotes !== undefined)
          setShowFootnotes(parsed.showFootnotes);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "torahpro-settings",
      JSON.stringify({
        displayMode,
        fontSize,
        showFootnotes,
      })
    );
  }, [displayMode, fontSize, showFootnotes]);

  return (
    <TextSettingsContext.Provider
      value={{
        displayMode,
        fontSize,
        showFootnotes,
        setDisplayMode,
        setFontSize,
        setShowFootnotes,
      }}
    >
      {children}
    </TextSettingsContext.Provider>
  );
}

export const useTextSettings = () => {
  const context = useContext(TextSettingsContext);
  if (!context) {
    throw new Error(
      "useTextSettings must be used within a TextSettingsProvider"
    );
  }
  return context;
};
