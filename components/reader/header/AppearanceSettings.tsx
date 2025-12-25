"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useTextSettings } from "@/components/context/text-settings-context";
import { Switch } from "@/components/ui/switch";

/**
 * components/reader/header/AppearanceSettings.tsx
 * Updated: Font Size slider range set to 10-26pt.
 */
export function AppearanceSettings() {
  const { setTheme, resolvedTheme } = useTheme();
  const { fontSize, setFontSize } = useTextSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="space-y-6 py-2 px-1 font-sans">
      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between group px-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-500/5 group-hover:bg-slate-500/10 transition-colors imprint-sm">
            {isDark ? (
              <Moon className="w-4 h-4 text-pencil" />
            ) : (
              <Sun className="w-4 h-4 text-pencil" />
            )}
          </div>
          <span className="text-[11px] font-bold text-pencil uppercase tracking-wider group-hover:text-ink transition-colors">
            Dark Mode
          </span>
        </div>

        <Switch
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </div>

      <div className="h-px bg-slate-100 mx-1" />

      {/* Font Size Slider */}
      <div className="space-y-4 px-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-pencil/40 uppercase tracking-[0.2em]">
            Typography Scale
          </span>
          <span className="text-[10px] font-mono font-bold text-accent-foreground bg-accent/20 px-2 py-0.5 rounded-full imprint-sm">
            {fontSize}pt
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Type className="w-3.5 h-3.5 text-pencil/30" />
          <div className="relative flex-1 flex items-center h-6">
            <input
              type="range"
              min="10"
              max="26"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-full accent-accent cursor-pointer appearance-none transition-all hover:bg-slate-300"
            />
          </div>
          <Type className="w-5 h-5 text-ink" />
        </div>
      </div>
    </div>
  );
}
