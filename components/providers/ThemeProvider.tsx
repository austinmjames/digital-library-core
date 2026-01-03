"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { ReactNode, useEffect } from "react";

/**
 * Global Theme Orchestrator (v1.1)
 * Filepath: components/providers/ThemeProvider.tsx
 * Role: Synchronizes the scholar's registry theme preference with the DOM root.
 * Fixes: Proper TypeScript typing for profile metadata.
 */

interface ScholarProfile {
  theme?: "light" | "dark" | "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();

  useEffect(() => {
    // Cast profile safely to extract registry preferences
    const preferredTheme = (profile as ScholarProfile)?.theme || "system";
    const root = window.document.documentElement;

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    if (preferredTheme === "dark") {
      applyTheme(true);
    } else if (preferredTheme === "light") {
      applyTheme(false);
    } else {
      // Default to System Preference
      const isSystemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      applyTheme(isSystemDark);

      // Listener for real-time system changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches);

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [profile]);

  return <>{children}</>;
}
