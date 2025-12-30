// Filepath: src/lib/hooks/useReaderSettings.ts

import { LayoutMode, ReaderContext, Theme } from "@/lib/types/reader";
import { useCallback, useEffect, useState } from "react";

interface ReaderSettings {
  theme: Theme;
  fontSize: number;
  layout: LayoutMode;
  context: ReaderContext;
}

export function useReaderSettings() {
  // 1. Initialize State (Lazy load from localStorage)
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    // Check if window is defined (SSR safety)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("drashx-reader-settings");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse reader settings", e);
        }
      }
    }
    return {
      theme: "paper",
      fontSize: 20,
      layout: "stacked",
      context: "global",
    };
  });

  // 2. Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem("drashx-reader-settings", JSON.stringify(settings));
  }, [settings]);

  // 3. Actions
  const setTheme = useCallback((theme: Theme) => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const setContext = useCallback((context: ReaderContext) => {
    setSettings((prev) => ({ ...prev, context }));
  }, []);

  const setLayout = useCallback((layout: LayoutMode) => {
    setSettings((prev) => ({ ...prev, layout }));
  }, []);

  const increaseFont = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 2, 48),
    }));
  }, []);

  const decreaseFont = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 2, 12),
    }));
  }, []);

  return {
    ...settings,
    setTheme,
    setContext,
    setLayout,
    increaseFont,
    decreaseFont,
  };
}
