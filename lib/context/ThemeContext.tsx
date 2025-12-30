"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Theme Context Provider
 * Filepath: lib/context/ThemeContext.tsx
 * Role: Phase 1/2 Refinement - Global Style Persistence.
 * Purpose: Manages the 'paper', 'sepia', and 'dark' design tokens across the app.
 */

export type Theme = "paper" | "sepia" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("paper");
  const [mounted, setMounted] = useState(false);

  // 1. Initial hydration: load from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("drashx-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    setMounted(true);
  }, []);

  // 2. Sync to localStorage and Document Body
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("drashx-theme", theme);

    // Apply class to HTML element for global CSS targeting
    const root = window.document.documentElement;
    root.classList.remove("paper", "sepia", "dark");
    root.classList.add(theme);

    // Sync metadata theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const colors = { paper: "#faf9f6", sepia: "#f4ecd8", dark: "#09090b" };
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", colors[theme]);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "paper") return "sepia";
      if (prev === "sepia") return "dark";
      return "paper";
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {/* Prevent hydration flicker by not rendering children until mounted */}
      <div style={{ visibility: mounted ? "visible" : "hidden" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
