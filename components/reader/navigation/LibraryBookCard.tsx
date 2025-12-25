"use client";

import React from "react";
import { ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavBook } from "@/lib/books";

interface LibraryBookCardProps {
  book: NavBook;
  isActive: boolean;
  onClick: () => void;
}

/**
 * navigation/LibraryBookCard.tsx
 * Specialized card for "My Library" navigation.
 * Design: No 'Install' buttons, focused on immediate access.
 */
export function LibraryBookCard({
  book,
  isActive,
  onClick,
}: LibraryBookCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-5 rounded-3xl border text-left transition-all duration-300 group flex items-center justify-between",
        isActive
          ? "bg-accent/5 border-accent/20 shadow-inner"
          : "bg-white border-pencil/10 hover:border-accent/30 hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
            isActive ? "bg-accent text-white" : "bg-pencil/5 text-pencil/40"
          )}
        >
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <span
            className={cn(
              "font-serif font-bold text-lg block leading-tight transition-colors",
              isActive ? "text-accent" : "text-ink group-hover:text-accent"
            )}
          >
            {book.name}
          </span>
          <span className="text-[10px] font-mono text-pencil/40 uppercase tracking-widest">
            {book.chapters} Chapters
          </span>
        </div>
      </div>

      <ChevronRight
        className={cn(
          "w-5 h-5 transition-all",
          isActive
            ? "text-accent"
            : "text-pencil/20 group-hover:translate-x-1 group-hover:text-accent"
        )}
      />
    </button>
  );
}
