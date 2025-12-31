"use client";

import { useReaderSettings } from "@/lib/hooks/useReaderSettings";
import { cn } from "@/lib/utils/utils";
import { Layout, Theme } from "@/types/reader";
import {
  CheckCircle2,
  Languages,
  Layout as LayoutIcon,
  Loader2,
  Minus,
  Monitor,
  Plus,
  Sparkles,
  Type,
} from "lucide-react";

/**
 * AppearanceSettings (v2.0)
 * Filepath: components/settings/AppearanceSettings.tsx
 * Role: Manages global reading defaults synced via useReaderSettings hook.
 * PRD Alignment: Section 2.12 (Persistent Defaults) & 3.2 (The Reader).
 */

interface ThemeOption {
  id: Theme;
  label: string;
  class: string;
}

export const AppearanceSettings = () => {
  // Wire into the central settings engine
  const {
    theme,
    setTheme,
    fontSize,
    increaseFont,
    decreaseFont,
    layout,
    setLayout,
    languageMode,
    setLanguageMode,
  } = useReaderSettings();

  // Mocked sync state for the UI - in a full implementation,
  // the hook would expose an 'isSyncing' boolean.
  const isSyncing = false;

  const themes: ThemeOption[] = [
    { id: "paper", label: "Paper", class: "bg-[#faf9f6]" },
    { id: "sepia", label: "Sepia", class: "bg-[#f4ecd8]" },
    { id: "dark", label: "Obsidian", class: "bg-zinc-950" },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <section className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-12">
        {/* 1. Header & Sync Status */}
        <div className="flex items-center justify-between border-b border-zinc-50 pb-8">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
              Reading Environment
            </h3>
            <p className="text-xs text-zinc-400 font-medium italic">
              Global defaults for your Digital Beit Midrash.
            </p>
          </div>
          {isSyncing ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full text-[9px] font-black text-amber-600 uppercase tracking-widest border border-amber-100">
              <Loader2 size={12} className="animate-spin" /> Syncing
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full text-[9px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
              <CheckCircle2 size={12} /> Encrypted & Synced
            </div>
          )}
        </div>

        <div className="grid gap-10">
          {/* Theme Selector */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-all">
                <Monitor size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-900">
                  Interface Tone
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Visual mode persistence
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "w-12 h-12 rounded-2xl border-2 transition-all flex items-center justify-center relative",
                    t.class,
                    theme === t.id
                      ? "border-zinc-950 scale-110 shadow-2xl ring-4 ring-zinc-900/5"
                      : "border-zinc-100 hover:border-zinc-300 hover:scale-105"
                  )}
                  title={t.label}
                >
                  {theme === t.id && (
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full absolute -bottom-3 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Selector */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-all">
                <Type size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-900">
                  Scholarship Scale
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Text size for deep focus
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100 shadow-inner">
              <button
                onClick={decreaseFont}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-zinc-400 hover:text-zinc-950 shadow-sm transition-all active:scale-90"
              >
                <Minus size={16} />
              </button>
              <span className="text-sm font-black text-zinc-900 px-6 font-mono tracking-tighter w-20 text-center">
                {fontSize}PX
              </span>
              <button
                onClick={increaseFont}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-zinc-400 hover:text-zinc-950 shadow-sm transition-all active:scale-90"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Layout Mode (Added for PRD 3.2 Consistency) */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-all">
                <LayoutIcon size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-900">
                  Manuscript Layout
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Spatial distribution of text
                </p>
              </div>
            </div>
            <div className="flex bg-zinc-100 p-1 rounded-2xl gap-1">
              {(["stacked", "side-by-side"] as Layout[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLayout(mode)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    layout === mode
                      ? "bg-zinc-950 text-white shadow-lg"
                      : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {mode.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Language Mode */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-all">
                <Languages size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-900">
                  Translation Layer
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Toggle English context
                </p>
              </div>
            </div>
            <div className="flex bg-zinc-100 p-1 rounded-2xl gap-1">
              {(["bi", "he", "en"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLanguageMode(mode)}
                  className={cn(
                    "w-12 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    languageMode === mode
                      ? "bg-zinc-950 text-white shadow-lg"
                      : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pro-Tip Info Box */}
        <div className="p-6 bg-zinc-950 text-white rounded-[2rem] border border-white/5 flex items-start gap-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl -mr-12 -mt-12 pointer-events-none" />
          <div className="p-2.5 bg-white/10 rounded-xl mt-0.5">
            <Sparkles size={16} className="text-amber-400" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-400">
              Scholarship Tip
            </p>
            <p className="text-xs font-medium text-zinc-400 leading-relaxed italic">
              Adjust your environment in real-time while reading using the
              <span className="text-white font-black mx-1 tracking-widest uppercase">
                &ldquo;AA&rdquo;
              </span>
              menu. Your changes will sync automatically to these global
              defaults.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
