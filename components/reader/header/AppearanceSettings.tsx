"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useTextSettings } from "@/components/context/text-settings-context";

/**
 * AppearanceSettings
 * Handles Dark Mode toggling and the iOS-style Font Size slider.
 */
export function AppearanceSettings() {
  const { setTheme, resolvedTheme } = useTheme();
  const { fontSize, setFontSize } = useTextSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="space-y-4">
      {/* Dark Mode Toggle */}
      <div className="px-1">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-2.5">
            {isDark ? (
              <Moon className="w-4 h-4 text-pencil group-hover:text-ink transition-colors" />
            ) : (
              <Sun className="w-4 h-4 text-pencil group-hover:text-ink transition-colors" />
            )}
            <span className="text-[10px] font-bold text-pencil uppercase tracking-wider group-hover:text-ink transition-colors">
              Dark Mode
            </span>
          </div>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "w-10 h-5.5 rounded-full transition-colors relative flex items-center",
              isDark ? "bg-indigo-600" : "bg-pencil/30"
            )}
          >
            <div
              className={cn(
                "absolute w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all duration-300",
                isDark ? "left-[1.25rem]" : "left-[0.125rem]"
              )}
            />
          </button>
        </div>
      </div>

      <div className="h-px bg-pencil/10 mx-1" />

      {/* Font Size Slider */}
      <div className="px-1 pt-1">
        <div className="flex items-center gap-3">
          <Type className="w-3 h-3 text-pencil/50" />
          <input
            type="range"
            min="14"
            max="32"
            step="2"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="flex-1 h-1 bg-pencil/20 rounded-full accent-ink cursor-pointer appearance-none transition-all hover:bg-pencil/30"
          />
          <Type className="w-4.5 h-4.5 text-ink" />
        </div>
      </div>
    </div>
  );
}
