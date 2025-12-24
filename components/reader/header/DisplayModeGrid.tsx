"use client";

import { Rows, Columns, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useTextSettings,
  DisplayMode,
} from "@/components/context/text-settings-context";

/**
 * DisplayModeGrid
 * Handles the 2x2 selection for Hebrew, English, Stacked, and Parallel views.
 */
export function DisplayModeGrid() {
  const { displayMode, setDisplayMode } = useTextSettings();

  const modes: { id: DisplayMode; label: string; icon: LucideIcon | string }[] =
    [
      { id: "hebrew", label: "Hebrew", icon: "אב" },
      { id: "english", label: "English", icon: "Aa" },
      { id: "bilingual-stacked", label: "Stacked", icon: Rows },
      { id: "bilingual-parallel", label: "Parallel", icon: Columns },
    ];

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {modes.map((mode) => {
        const isActive = displayMode === mode.id;
        const Icon = mode.icon;

        return (
          <button
            key={mode.id}
            onClick={() => setDisplayMode(mode.id)}
            title={mode.label}
            className={cn(
              "flex items-center justify-center py-3 rounded-[1.2rem] transition-all duration-300",
              isActive
                ? "bg-gold text-white shadow-md shadow-gold/25"
                : "bg-pencil/15 text-pencil/80 hover:text-ink hover:bg-pencil/25"
            )}
          >
            {typeof Icon === "string" ? (
              <span
                className={cn(
                  "text-[16px] font-bold leading-none",
                  mode.id === "hebrew" ? "font-hebrew pt-0.5" : "font-serif"
                )}
              >
                {Icon}
              </span>
            ) : (
              <Icon className="w-4.5 h-4.5" />
            )}
          </button>
        );
      })}
    </div>
  );
}
