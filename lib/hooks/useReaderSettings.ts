import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Layout, Theme } from "@/types/reader";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useReaderSettings (v2.4)
 * Filepath: lib/hooks/useReaderSettings.ts
 * Role: Environment engine for "AA" menu with hardware-accelerated scaling.
 * PRD Alignment: Section 2.12 (Persistent Defaults) & 3.2 (The Reader).
 * Standard: Follows the clean dependency/tier-gating pattern seen in useNoteHistory (Canvas).
 */

export type ReaderContext = "GLOBAL" | "GROUP" | "PRIVATE";

interface ReaderSettings {
  theme: Theme;
  fontSize: number;
  lineHeight: number;
  layout: Layout;
  languageMode: "bi" | "he" | "en";
  context: ReaderContext;
}

export function useReaderSettings() {
  const supabase = createClient();
  const { user, isPro } = useAuth();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial State (Safe Hydration)
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("drashx-reader-settings");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("[Settings] Corrupt local cache", e);
        }
      }
    }
    return {
      theme: "paper",
      fontSize: 20,
      lineHeight: 1.6,
      layout: "stacked",
      languageMode: "bi",
      context: "GLOBAL",
    };
  });

  // 2. Performance Side-Effect: CSS Variable Injection
  // This allows VirtualVerseList (v2.3) to scale instantly via CSS without re-rendering the list.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;

    root.style.setProperty("--reader-font-size", `${settings.fontSize}px`);
    root.style.setProperty("--reader-line-height", `${settings.lineHeight}`);

    // Theme class management for global CSS targeting
    root.classList.remove("paper", "sepia", "dark");
    root.classList.add(settings.theme);
  }, [settings.fontSize, settings.lineHeight, settings.theme]);

  // 3. Cloud Sync Logic (Gated by Auth state, matching useNoteHistory pattern)
  useEffect(() => {
    const fetchCloudSettings = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data && !error) {
        const synced: ReaderSettings = {
          theme: data.default_theme as Theme,
          fontSize: data.font_size,
          lineHeight: data.line_height ?? 1.6,
          layout: (data.layout_mode as Layout) ?? "stacked",
          languageMode: (data.language_mode as "bi" | "he" | "en") ?? "bi",
          context: settings.context,
        };
        setSettings(synced);
        localStorage.setItem("drashx-reader-settings", JSON.stringify(synced));
      }
    };
    fetchCloudSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only refetch when user identity changes

  // 4. Persistence Orchestrator
  const updateSettings = useCallback(
    (patch: Partial<ReaderSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...patch };

        // a. Immediate local feedback
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "drashx-reader-settings",
            JSON.stringify(updated)
          );
        }

        // b. Debounced Cloud Persistence (Manifest API Resilience)
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        if (user) {
          syncTimeoutRef.current = setTimeout(async () => {
            await supabase.from("user_settings").upsert({
              user_id: user.id,
              default_theme: updated.theme,
              font_size: updated.fontSize,
              line_height: updated.lineHeight,
              layout_mode: updated.layout,
              language_mode: updated.languageMode,
              updated_at: new Date().toISOString(),
            });
          }, 2000);
        }

        return updated;
      });
    },
    [supabase, user]
  );

  return {
    ...settings,
    isPro, // Inherited from Canvas pattern
    setTheme: (theme: Theme) => updateSettings({ theme }),
    setContext: (context: ReaderContext) => updateSettings({ context }),
    setLayout: (layout: Layout) => updateSettings({ layout }),
    setLanguageMode: (languageMode: "bi" | "he" | "en") =>
      updateSettings({ languageMode }),
    increaseFont: () =>
      updateSettings({ fontSize: Math.min(settings.fontSize + 2, 48) }),
    decreaseFont: () =>
      updateSettings({ fontSize: Math.max(settings.fontSize - 2, 12) }),
    setLineHeight: (lineHeight: number) => updateSettings({ lineHeight }),
  };
}
