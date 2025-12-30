// Filepath: src/components/reader/VerseSegment.tsx

import { Theme, Verse } from "@/lib/types/reader";
import React from "react";

interface VerseSegmentProps {
  verse: Verse;
  isActive: boolean;
  onClick: (verse: Verse) => void;
  theme: Theme;
  fontSize: number;
}

export const VerseSegment: React.FC<VerseSegmentProps> = ({
  verse,
  isActive,
  onClick,
  theme,
  fontSize,
}) => {
  const isDark = theme === "dark";

  return (
    <div
      id={verse.ref}
      onClick={() => onClick(verse)}
      className={`
        group flex flex-col md:flex-row gap-4 md:gap-8 py-6 px-4 md:px-12 border-b cursor-pointer transition-colors
        ${
          isDark
            ? "border-zinc-800 hover:bg-zinc-900"
            : "border-zinc-100 hover:bg-zinc-50"
        }
        ${
          isActive
            ? isDark
              ? "bg-zinc-900 ring-1 ring-zinc-700"
              : "bg-amber-50/50"
            : ""
        }
      `}
    >
      {/* Hebrew Column */}
      <div className="md:w-1/2 text-right md:order-2">
        <p
          className={`font-serif leading-relaxed ${
            isDark ? "text-zinc-100" : "text-zinc-900"
          }`}
          style={{
            fontFamily: '"Noto Serif Hebrew", serif',
            fontSize: `${fontSize + 4}px`,
          }}
        >
          {verse.he}
          <span className="text-xs text-zinc-300 mr-2 font-sans select-none">
            {verse.c2}
          </span>
        </p>
      </div>

      {/* English Column */}
      <div className="md:w-1/2 md:order-1">
        <p
          className={`font-sans leading-relaxed ${
            isDark ? "text-zinc-300" : "text-zinc-700"
          }`}
          style={{ fontSize: `${fontSize}px` }}
        >
          <span className="text-xs text-zinc-300 mr-2 font-bold select-none">
            {verse.c2}
          </span>
          {verse.en}
        </p>

        {/* Interaction Rail (Visible on Hover/Active) */}
        <div
          className={`
          mt-3 flex gap-2 opacity-0 transition-opacity
          ${isActive ? "opacity-100" : "group-hover:opacity-100"}
        `}
        >
          <button
            className={`text-xs border px-2 py-1 rounded shadow-sm ${
              isDark
                ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                : "bg-white border-zinc-200 text-zinc-600"
            }`}
          >
            Comment
          </button>
          <button
            className={`text-xs border px-2 py-1 rounded shadow-sm ${
              isDark
                ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                : "bg-white border-zinc-200 text-zinc-600"
            }`}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};
