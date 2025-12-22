"use client";

import React, { createContext, useContext, useState } from "react";

type Language = "he" | "both" | "en";
type Layout = "stacked" | "side-by-side";

interface TextSettings {
  language: Language;
  layout: Layout;
  fontSize: number;
  showFootnotes: boolean;
  setLanguage: (lang: Language) => void;
  setLayout: (layout: Layout) => void;
  setFontSize: (size: number) => void;
  setShowFootnotes: (show: boolean) => void;
}

const TextSettingsContext = createContext<TextSettings | undefined>(undefined);

export function TextSettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("both");
  const [layout, setLayout] = useState<Layout>("stacked");
  const [fontSize, setFontSize] = useState(18);
  const [showFootnotes, setShowFootnotes] = useState(true);

  return (
    <TextSettingsContext.Provider 
      value={{ 
        language, 
        layout, 
        fontSize, 
        showFootnotes, 
        setLanguage, 
        setLayout, 
        setFontSize, 
        setShowFootnotes 
      }}
    >
      {children}
    </TextSettingsContext.Provider>
  );
}

export const useTextSettings = () => {
  const context = useContext(TextSettingsContext);
  if (!context) throw new Error("useTextSettings must be used within a TextSettingsProvider");
  return context;
};