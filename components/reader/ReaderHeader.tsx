"use client";

import { ReaderContext } from "@/lib/hooks/useReaderSettings";
import { cn } from "@/lib/utils/utils";
import { Theme } from "@/types/reader";
import {
  ArrowLeft,
  BookOpen,
  Globe,
  Lock,
  Menu,
  Minus,
  Moon,
  Plus,
  Settings2,
  Sun,
  Type,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * ReaderHeader (v2.1)
 * Filepath: components/reader/ReaderHeader.tsx
 * Role: Primary navigation, appearance control (AA), and context layer switching.
 * PRD Alignment: Section 3.2 (The Reader) & 2.12 (Appearance Persistence).
 * Fix: Resolved 'any' type cast in theme selection logic.
 */

interface ReaderHeaderProps {
  book: string;
  chapter: string;
  toggleSidebar: () => void;
  context: ReaderContext;
  setContext: (c: ReaderContext) => void;
  fontSize: number;
  increaseFont: () => void;
  decreaseFont: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export const ReaderHeader = ({
  book,
  chapter,
  toggleSidebar,
  context,
  setContext,
  fontSize,
  increaseFont,
  decreaseFont,
  theme,
  setTheme,
}: ReaderHeaderProps) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="h-20 border-b border-zinc-200/60 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-40 transition-all">
      {/* 1. Left: Breadcrumbs & Navigation */}
      <div className="flex items-center gap-6">
        <Link
          href="/library"
          className="p-3 -ml-2 rounded-2xl hover:bg-zinc-950 hover:text-white text-zinc-400 transition-all active:scale-95 shadow-sm hover:shadow-xl"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-black text-xl tracking-tighter text-zinc-900 leading-none">
              {book}
            </h1>
            <div className="w-1 h-1 rounded-full bg-amber-500 mt-1" />
          </div>
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mt-1.5">
            {chapter}
          </span>
        </div>
      </div>

      {/* 2. Center: Context Switcher (PRD 3.2 - Communal Layers) */}
      <nav className="hidden md:flex bg-zinc-100/80 p-1 rounded-2xl border border-zinc-200/50 shadow-inner">
        {[
          { id: "GLOBAL", label: "Global", icon: Globe },
          { id: "GROUP", label: "Group", icon: Users },
          { id: "PRIVATE", label: "Private", icon: Lock },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setContext(item.id as ReaderContext)}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              context === item.id
                ? "bg-zinc-950 text-white shadow-xl scale-[1.02]"
                : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <item.icon
              size={12}
              className={context === item.id ? "text-amber-400" : ""}
            />
            {item.label}
          </button>
        ))}
      </nav>

      {/* 3. Right: Appearance & TOC Controls */}
      <div className="flex items-center gap-3">
        {/* AA Appearance Menu */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-3 rounded-2xl transition-all active:scale-95 shadow-sm",
              showSettings
                ? "bg-zinc-950 text-white shadow-xl"
                : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-950"
            )}
          >
            <Type size={20} strokeWidth={showSettings ? 2.5 : 2} />
          </button>

          {showSettings && (
            <div className="absolute right-0 top-14 w-72 bg-white border border-zinc-200 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-8">
                {/* Font Size Scaling */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Typography
                    </span>
                    <Settings2 size={12} className="text-zinc-300" />
                  </div>
                  <div className="flex items-center justify-between bg-zinc-50 rounded-2xl p-2 border border-zinc-100">
                    <button
                      onClick={decreaseFont}
                      className="p-3 bg-white rounded-xl shadow-sm text-zinc-900 hover:bg-zinc-100 transition-all active:scale-90"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-sm font-black text-zinc-900 font-mono tracking-tighter">
                      {fontSize}PX
                    </span>
                    <button
                      onClick={increaseFont}
                      className="p-3 bg-white rounded-xl shadow-sm text-zinc-900 hover:bg-zinc-100 transition-all active:scale-90"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                    Interface Tone
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        id: "paper",
                        label: "Paper",
                        icon: Sun,
                        color: "bg-[#FAF9F6] border-zinc-200",
                      },
                      {
                        id: "sepia",
                        label: "Sepia",
                        icon: BookOpen,
                        color: "bg-[#F4ECD8] border-orange-200",
                      },
                      {
                        id: "dark",
                        label: "Night",
                        icon: Moon,
                        color: "bg-zinc-950 border-zinc-800 text-white",
                      },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as Theme)}
                        className={cn(
                          "flex flex-col items-center justify-center py-4 rounded-2xl border transition-all gap-2 relative group",
                          t.color,
                          theme === t.id
                            ? "ring-2 ring-amber-500 ring-offset-2 scale-[1.05] shadow-lg"
                            : "hover:border-zinc-400 opacity-60 hover:opacity-100"
                        )}
                      >
                        <t.icon
                          size={16}
                          className={theme === t.id ? "text-amber-500" : ""}
                        />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-zinc-100 mx-1" />

        {/* TOC / Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-3 bg-zinc-950 text-white rounded-2xl shadow-xl hover:bg-zinc-800 transition-all active:scale-95 group"
        >
          <Menu
            size={20}
            className="group-hover:rotate-180 transition-transform duration-500"
          />
        </button>
      </div>
    </header>
  );
};
