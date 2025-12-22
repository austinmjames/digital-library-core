"use client";

import { useState, useEffect } from "react";
import { LIBRARY, Collection, Category, Book } from "@/lib/books";
import { cn } from "@/lib/utils";

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ref: string) => void;
  currentBook: string;
}

// Define the possible "Levels" of our drill-down menu
type MenuLevel = "COLLECTIONS" | "CATEGORIES" | "BOOKS" | "CHAPTERS";

export function NavigationMenu({ isOpen, onClose, onSelect, currentBook }: NavigationMenuProps) {
  // Navigation State
  const [level, setLevel] = useState<MenuLevel>("COLLECTIONS");
  
  // Selection Path
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Reset menu when opening
  useEffect(() => {
    if (isOpen) {
      // Optional: If you want to start fresh every time, uncomment below:
      // setLevel("COLLECTIONS");
      // setSelectedCollection(null);
      // ...
    }
  }, [isOpen]);

  // Back Button Logic
  const handleBack = () => {
    if (level === "CHAPTERS") {
      setLevel("BOOKS");
      setSelectedBook(null);
    } else if (level === "BOOKS") {
      setLevel("CATEGORIES");
      setSelectedCategory(null);
    } else if (level === "CATEGORIES") {
      setLevel("COLLECTIONS");
      setSelectedCollection(null);
    } else {
      onClose(); // Close if we are at the top level
    }
  };

  // Header Title Logic
  const getTitle = () => {
    if (level === "COLLECTIONS") return "Library";
    if (level === "CATEGORIES") return selectedCollection?.name;
    if (level === "BOOKS") return selectedCategory?.name;
    if (level === "CHAPTERS") return selectedBook?.name;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-paper/80 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md h-[60vh] md:h-[500px] bg-white shadow-2xl rounded-2xl border border-black/5 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* HEADER: Back Button + Title */}
        <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            {level !== "COLLECTIONS" && (
              <button 
                onClick={handleBack}
                className="w-8 h-8 flex items-center justify-center rounded-full text-pencil hover:bg-black/5 hover:text-ink transition-colors"
              >
                ←
              </button>
            )}
            <h2 className="text-base font-bold text-ink tracking-tight">
              {getTitle()}
            </h2>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 text-ink/50 hover:bg-black/10 transition-colors"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 bg-[#F9F9F9]">
          
          {/* LEVEL 1: COLLECTIONS (Tanakh, etc.) */}
          {level === "COLLECTIONS" && (
            <div className="grid grid-cols-1 gap-3">
              {LIBRARY.map((col) => (
                <button
                  key={col.name}
                  onClick={() => {
                    setSelectedCollection(col);
                    setLevel("CATEGORIES");
                  }}
                  className="p-6 bg-white border border-black/5 rounded-xl shadow-sm hover:shadow-md hover:border-black/10 transition-all text-left group"
                >
                  <span className="text-lg font-bold text-ink group-hover:text-charcoal">{col.name}</span>
                  <div className="text-xs text-pencil mt-1 uppercase tracking-wider">
                    {col.categories.length} Sections
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* LEVEL 2: CATEGORIES (Torah, Prophets...) */}
          {level === "CATEGORIES" && selectedCollection && (
            <div className="grid grid-cols-1 gap-3">
              {selectedCollection.categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setLevel("BOOKS");
                  }}
                  className="p-5 bg-white border border-black/5 rounded-xl shadow-sm hover:shadow-md hover:border-black/10 transition-all text-left flex items-center justify-between group"
                >
                  <span className="font-semibold text-ink">{cat.name}</span>
                  <span className="text-pencil/40 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              ))}
            </div>
          )}

          {/* LEVEL 3: BOOKS (Genesis, Exodus...) */}
          {level === "BOOKS" && selectedCategory && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedCategory.books.map((book) => (
                <button
                  key={book.name}
                  onClick={() => {
                    setSelectedBook(book);
                    setLevel("CHAPTERS");
                  }}
                  className={cn(
                    "p-4 bg-white border border-black/5 rounded-xl shadow-sm hover:shadow-md hover:border-black/10 transition-all text-center flex flex-col items-center justify-center gap-2 h-24",
                    currentBook === book.name && "ring-2 ring-ink ring-offset-2"
                  )}
                >
                  <span className="text-sm font-medium text-ink leading-tight">{book.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* LEVEL 4: CHAPTERS (1, 2, 3...) */}
          {level === "CHAPTERS" && selectedBook && (
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: selectedBook.chapters }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSelect(`${selectedBook.name} ${i + 1}`);
                    onClose();
                  }}
                  className="aspect-square flex items-center justify-center rounded-lg bg-white border border-black/5 text-sm font-mono text-ink hover:bg-ink hover:text-white transition-all shadow-sm active:scale-95"
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}