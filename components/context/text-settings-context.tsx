"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "@/components/context/auth-context";
import { createClient } from "@/lib/supabase/client";

/**
 * components/context/text-settings-context.tsx
 * Unified Display Mode and persistent preferences.
 * Updated: Default font size set to 16pt.
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
  const { user } = useAuth();
  const supabase = createClient();

  // 1. Initial State with Local Fallback
  const [displayMode, setDisplayMode] =
    useState<DisplayMode>("bilingual-parallel");
  // Default font size updated to 16
  const [fontSize, setFontSize] = useState(16);
  const [showFootnotes, setShowFootnotes] = useState(true);

  // Guard to prevent double-syncing on initial load
  const isInitialMount = useRef(true);

  // 2. Load Settings (Local Storage -> Cloud)
  useEffect(() => {
    // Load local first for instant UI
    const saved = localStorage.getItem("torahpro-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.displayMode) setDisplayMode(parsed.displayMode);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.showFootnotes !== undefined)
          setShowFootnotes(parsed.showFootnotes);
      } catch (e) {
        console.error("Failed to load local settings", e);
      }
    }

    // If user is logged in, overwrite local with Cloud preferences
    async function loadCloudSettings() {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("display_mode, font_size, show_footnotes")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        if (data.display_mode) setDisplayMode(data.display_mode as DisplayMode);
        if (data.font_size) setFontSize(data.font_size);
        if (data.show_footnotes !== undefined)
          setShowFootnotes(data.show_footnotes);
      }
    }

    loadCloudSettings();
    isInitialMount.current = false;
  }, [user, supabase]);

  // 3. Persist Settings (Local Storage & Cloud Sync)
  useEffect(() => {
    // Save to LocalStorage for offline/guest persistence
    localStorage.setItem(
      "torahpro-settings",
      JSON.stringify({ displayMode, fontSize, showFootnotes })
    );

    // Sync to Cloud if user exists (Debounced slightly in a real app, but direct for now)
    async function syncToCloud() {
      if (!user || isInitialMount.current) return;

      try {
        await supabase
          .from("profiles")
          .update({
            display_mode: displayMode,
            font_size: fontSize,
            show_footnotes: showFootnotes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      } catch (err) {
        console.warn("Cloud settings sync failed:", err);
      }
    }

    syncToCloud();
  }, [displayMode, fontSize, showFootnotes, user, supabase]);

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
