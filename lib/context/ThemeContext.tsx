"use client";

import { createClient } from "@/lib/supabase/client";
import { Layout, Theme } from "@/types/reader";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Reader Settings Context (v2.0)
 * Filepath: lib/context/ThemeContext.tsx
 * Role: Single source of truth for the 'AA' Reading Environment.
 * PRD Alignment: Section 2.12 (Appearance Persistence) & 3.2 (The Reader).
 * Logic: Dual-layer persistence (LocalStorage for speed + Supabase for cross-device sync).
 */

export type ReaderContextMode = "GLOBAL" | "GROUP" | "PRIVATE";

interface ReaderSettings {
  theme: Theme;
  fontSize: number;
  lineHeight: number;
  layout: Layout;
  languageMode: "bi" | "he" | "en";
  contextMode: ReaderContextMode;
}

interface SettingsContextType extends ReaderSettings {
  setTheme: (t: Theme) => void;
  setContextMode: (c: ReaderContextMode) => void;
  setLayout: (l: Layout) => void;
  setLanguageMode: (m: "bi" | "he" | "en") => void;
  increaseFont: () => void;
  decreaseFont: () => void;
  setLineHeight: (h: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const supabase = createClient();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [settings, setSettings] = useState<ReaderSettings>({
    theme: "paper",
    fontSize: 20,
    lineHeight: 1.6,
    layout: "stacked",
    languageMode: "bi",
    contextMode: "GLOBAL",
  });

  const [mounted, setMounted] = useState(false);

  // 1. Initial Load (Hydration)
  useEffect(() => {
    const initSettings = async () => {
      // a. Immediate load from LocalStorage to prevent flicker
      const saved = localStorage.getItem("drashx-settings");
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch (e) {
          console.error("Local settings corrupt:", e);
        }
      }

      // b. Background Cloud Sync (Supabase)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
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
            contextMode: "GLOBAL", // Session-based, usually defaults to global
          };
          setSettings(synced);
        }
      }
      setMounted(true);
    };

    initSettings();
  }, [supabase]);

  // 2. DOM & Variable Side-Effects
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    // Theme class application
    root.classList.remove("paper", "sepia", "dark");
    root.classList.add(settings.theme);

    // CSS Variable injection for high-performance font scaling
    root.style.setProperty("--reader-font-size", `${settings.fontSize}px`);
    root.style.setProperty("--reader-line-height", `${settings.lineHeight}`);

    // Browser HUD color sync
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const colors = { paper: "#faf9f6", sepia: "#f4ecd8", dark: "#09090b" };
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", colors[settings.theme]);
    }

    localStorage.setItem("drashx-settings", JSON.stringify(settings));
  }, [settings, mounted]);

  // 3. Debounced Cloud Persistence
  const persistToCloud = useCallback(
    (updated: ReaderSettings) => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

      syncTimeoutRef.current = setTimeout(async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

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
    },
    [supabase]
  );

  // 4. Action Handlers
  const update = (patch: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      persistToCloud(next);
      return next;
    });
  };

  const actions = {
    setTheme: (theme: Theme) => update({ theme }),
    setContextMode: (contextMode: ReaderContextMode) => update({ contextMode }),
    setLayout: (layout: Layout) => update({ layout }),
    setLanguageMode: (languageMode: "bi" | "he" | "en") =>
      update({ languageMode }),
    increaseFont: () =>
      update({ fontSize: Math.min(settings.fontSize + 2, 48) }),
    decreaseFont: () =>
      update({ fontSize: Math.max(settings.fontSize - 2, 12) }),
    setLineHeight: (lineHeight: number) => update({ lineHeight }),
  };

  return (
    <SettingsContext.Provider value={{ ...settings, ...actions }}>
      {/* Visibility hidden until mounted to prevent hydration flash of mismatched themes */}
      <div className={mounted ? "contents" : "invisible"}>{children}</div>
    </SettingsContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
