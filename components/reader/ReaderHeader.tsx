// Filepath: src/components/reader/ReaderHeader.tsx

import { ReaderContext, Theme } from "@/lib/types/reader";
import { Menu, MessageSquare, Minus, Plus } from "lucide-react";
import React from "react";

interface ReaderHeaderProps {
  book: string;
  chapter: string | number;
  toggleSidebar: () => void;
  // Settings Props (Passed from hook)
  context: ReaderContext;
  setContext: (ctx: ReaderContext) => void;
  fontSize: number;
  increaseFont: () => void;
  decreaseFont: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
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
}) => {
  const isDark = theme === "dark";

  return (
    <header
      className={`
      h-16 border-b flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm backdrop-blur-md transition-colors
      ${
        isDark
          ? "bg-zinc-900/90 border-zinc-800 text-white"
          : "bg-white/90 border-zinc-200 text-zinc-900"
      }
    `}
    >
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <button className="md:hidden text-zinc-600">
          <Menu size={24} />
        </button>

        {/* Breadcrumbs */}
        <div className="flex flex-col">
          <h1 className="text-lg font-serif font-bold leading-none">{book}</h1>
          <span
            className={`text-xs uppercase tracking-wide mt-1 ${
              isDark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            Chapter {chapter}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        {/* Context Switcher */}
        <div
          className={`hidden sm:flex items-center border rounded-md px-3 py-1.5 shadow-sm transition-colors ${
            isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-300"
          }`}
        >
          <span className="text-[10px] font-bold text-zinc-400 mr-2 tracking-wider">
            CONTEXT
          </span>
          <select
            value={context}
            onChange={(e) => setContext(e.target.value as ReaderContext)}
            className={`text-sm bg-transparent border-none outline-none font-medium cursor-pointer ${
              isDark ? "text-zinc-200" : "text-zinc-800"
            }`}
          >
            <option value="global">Global Community</option>
            <option value="dafyomi">Daf Yomi Group</option>
            <option value="private">Private Study</option>
          </select>
        </div>

        <div className="h-6 w-px bg-zinc-200 mx-2" />

        {/* Font Controls */}
        <div
          className={`hidden md:flex items-center rounded-xl p-1 gap-1 ${
            isDark ? "bg-zinc-800" : "bg-zinc-100/50"
          }`}
        >
          <button
            onClick={decreaseFont}
            className={`p-1.5 rounded-lg transition-all ${
              isDark
                ? "hover:bg-zinc-700 text-zinc-400"
                : "hover:bg-white text-zinc-500"
            }`}
          >
            <Minus size={14} />
          </button>
          <span
            className={`text-[10px] font-bold w-6 text-center ${
              isDark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            {fontSize}
          </span>
          <button
            onClick={increaseFont}
            className={`p-1.5 rounded-lg transition-all ${
              isDark
                ? "hover:bg-zinc-700 text-zinc-400"
                : "hover:bg-white text-zinc-500"
            }`}
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Theme Toggles */}
        <div
          className={`flex p-1 rounded-xl gap-1 ${
            isDark ? "bg-zinc-800" : "bg-zinc-100/50"
          }`}
        >
          {(["paper", "sepia", "dark"] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`
                  w-6 h-6 rounded-lg transition-all border-2 
                  ${
                    theme === t
                      ? "border-orange-400 scale-110"
                      : "border-transparent opacity-40 hover:opacity-100"
                  }
                  ${
                    t === "paper"
                      ? "bg-white"
                      : t === "sepia"
                      ? "bg-[#f4ecd8]"
                      : "bg-zinc-900"
                  }
                `}
            />
          ))}
        </div>

        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-full transition-colors ${
            isDark
              ? "hover:bg-zinc-800 text-zinc-400"
              : "hover:bg-zinc-100 text-zinc-600"
          }`}
        >
          <MessageSquare size={20} />
        </button>
      </div>
    </header>
  );
};
