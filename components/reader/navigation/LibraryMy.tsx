"use client";

import { NavCollection } from "@/lib/books";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { NavState } from "./types";
import { LibraryBookCard } from "./LibraryBookCard";

interface LibraryMyProps {
  data: NavCollection[];
  navState: NavState;
  setNavState: (state: NavState) => void;
  currentBook: string;
  onClose: () => void;
}

/**
 * navigation/LibraryMy.tsx
 * Resolved: Removed unused NavBook import.
 */
export function LibraryMy({
  data,
  navState,
  setNavState,
  currentBook,
  onClose,
}: LibraryMyProps) {
  const router = useRouter();

  if (navState.level === "CATEGORY") {
    return (
      <div className="space-y-3">
        {data.map((col) => (
          <button
            key={col.name}
            onClick={() =>
              setNavState({
                ...navState,
                level: "SUBCATEGORY",
                selectedCategory: col,
              })
            }
            className="w-full p-5 flex items-center justify-between bg-white border border-pencil/10 rounded-[2rem] hover:border-accent/30 transition-all group text-left shadow-sm active:scale-[0.99]"
          >
            <div className="space-y-1">
              <span className="font-serif font-bold text-xl text-ink group-hover:text-accent transition-colors">
                {col.name}
              </span>
              <p className="text-[11px] text-pencil/50 font-medium line-clamp-1 italic">
                {col.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-pencil/30 group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    );
  }

  if (navState.level === "SUBCATEGORY" && navState.selectedCategory) {
    return (
      <div className="space-y-3">
        {navState.selectedCategory.categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() =>
              setNavState({
                ...navState,
                level: "BOOK",
                selectedSubCategory: cat,
              })
            }
            className="w-full p-5 flex items-center justify-between bg-white border border-pencil/10 rounded-[2rem] hover:border-accent/30 transition-all group text-left shadow-sm active:scale-[0.99]"
          >
            <div>
              <span className="font-sans font-bold text-base text-ink group-hover:text-accent transition-colors">
                {cat.name}
              </span>
              <span className="text-[10px] font-mono text-pencil/40 ml-3 bg-pencil/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                {cat.books.length} Volumes
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-pencil/30 group-hover:text-accent transition-all" />
          </button>
        ))}
      </div>
    );
  }

  if (navState.level === "BOOK" && navState.selectedSubCategory) {
    return (
      <div className="grid grid-cols-1 gap-3">
        {navState.selectedSubCategory.books.map((book) => (
          <LibraryBookCard
            key={book.slug}
            book={book}
            isActive={book.name === currentBook}
            onClick={() =>
              setNavState({ ...navState, level: "CHAPTER", selectedBook: book })
            }
          />
        ))}
      </div>
    );
  }

  if (
    navState.level === "CHAPTER" &&
    navState.selectedBook &&
    navState.selectedCategory
  ) {
    return (
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 pt-2">
        {Array.from({ length: navState.selectedBook.chapters }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const collection = navState.selectedCategory!.name.toLowerCase();
              const book = navState.selectedBook!.slug;
              router.push(`/library/${collection}/${book}/${i + 1}`);
              onClose();
            }}
            className="aspect-square flex items-center justify-center rounded-2xl border border-pencil/10 bg-white text-sm font-bold text-ink hover:bg-accent hover:text-white hover:border-transparent hover:shadow-lg transition-all active:scale-90"
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  }

  return null;
}
