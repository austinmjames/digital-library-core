"use client";

import { useState } from "react";
import { LIBRARY, NavCollection, NavCategory, NavBook } from "@/lib/books";
import { cn } from "@/lib/utils";
import { ChevronRight, ArrowLeft, X } from "lucide-react";

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentBook: string;
}

type MenuLevel = "COLLECTIONS" | "CATEGORIES" | "BOOKS" | "CHAPTERS";

interface SelectedContext {
  collection?: NavCollection;
  category?: NavCategory;
  book?: NavBook;
}

/**
 * components/reader/NavigationMenu.tsx
 * Premium drill-down navigation for the TorahPro library.
 * Resolves: Implicit 'any' type errors by explicitly typing map parameters.
 */
export function NavigationMenu({
  isOpen,
  onClose,
  currentBook,
}: NavigationMenuProps) {
  const [level, setLevel] = useState<MenuLevel>("COLLECTIONS");
  const [context, setContext] = useState<SelectedContext>({});

  const handleBack = () => {
    switch (level) {
      case "CHAPTERS":
        setLevel("BOOKS");
        break;
      case "BOOKS":
        setLevel("CATEGORIES");
        break;
      case "CATEGORIES":
        setLevel("COLLECTIONS");
        break;
      default:
        onClose();
    }
  };

  const getTitle = () => {
    if (level === "COLLECTIONS") return "Library";
    if (level === "CATEGORIES") return context.collection?.name;
    if (level === "BOOKS") return context.category?.name;
    return context.book?.name;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Navigation Card */}
      <div className="relative w-full max-w-md h-[65vh] bg-paper shadow-2xl rounded-2xl border border-pencil/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="h-14 border-b border-pencil/10 flex items-center justify-between px-4 bg-paper/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            {level !== "COLLECTIONS" && (
              <button
                onClick={handleBack}
                className="p-1 rounded-full hover:bg-black/5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-pencil" />
              </button>
            )}
            <h2 className="font-serif font-bold text-ink text-lg tracking-tight">
              {getTitle()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5 text-pencil" />
          </button>
        </div>

        {/* Scrollable List Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-2">
          {/* LEVEL 1: Collections */}
          {level === "COLLECTIONS" && (
            <div className="space-y-1">
              {LIBRARY.map((col: NavCollection) => (
                <button
                  key={col.name}
                  onClick={() => {
                    setContext({ collection: col });
                    setLevel("CATEGORIES");
                  }}
                  className="w-full p-4 rounded-xl bg-white border border-pencil/5 hover:border-gold/30 hover:shadow-sm transition-all text-left group flex items-center justify-between"
                >
                  <span className="font-serif font-bold text-lg text-ink group-hover:text-gold transition-colors">
                    {col.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-pencil/30 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          )}

          {/* LEVEL 2: Categories */}
          {level === "CATEGORIES" && context.collection && (
            <div className="space-y-1">
              {context.collection.categories.map((cat: NavCategory) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setContext({ ...context, category: cat });
                    setLevel("BOOKS");
                  }}
                  className="w-full p-4 rounded-xl bg-white border border-pencil/5 hover:border-gold/30 hover:shadow-sm transition-all text-left flex items-center justify-between group"
                >
                  <span className="font-sans font-medium text-ink group-hover:text-gold transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-xs text-pencil uppercase tracking-wider bg-black/5 px-2 py-1 rounded">
                    {cat.books.length} Books
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* LEVEL 3: Books */}
          {level === "BOOKS" && context.category && (
            <div className="grid grid-cols-2 gap-2">
              {context.category.books.map((book: NavBook) => (
                <button
                  key={book.name}
                  onClick={() => {
                    setContext({ ...context, book: book });
                    setLevel("CHAPTERS");
                  }}
                  className={cn(
                    "p-4 rounded-xl border border-pencil/5 hover:border-gold/30 hover:shadow-sm transition-all text-center flex flex-col items-center justify-center gap-1 min-h-[5rem]",
                    book.name === currentBook
                      ? "bg-gold text-white shadow-md border-transparent"
                      : "bg-white text-ink hover:text-gold"
                  )}
                >
                  <span className="font-serif font-medium leading-tight">
                    {book.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* LEVEL 4: Chapters */}
          {level === "CHAPTERS" && context.book && (
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: context.book.chapters }).map((_, i) => (
                <a
                  key={i}
                  href={`/library/${context.collection?.name.toLowerCase()}/${context.book?.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}/${i + 1}`}
                  className="aspect-square flex items-center justify-center rounded-lg border border-pencil/10 bg-white text-ink font-mono text-sm hover:bg-ink hover:text-paper hover:border-transparent transition-all"
                >
                  {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
