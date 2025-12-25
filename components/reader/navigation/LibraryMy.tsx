"use client";

import { NavCollection } from "@/lib/books";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { NavState } from "./types";

interface LibraryMyProps {
  data: NavCollection[];
  navState: NavState;
  setNavState: (state: NavState) => void;
  currentBook: string;
  onClose: () => void;
}

export function LibraryMy({
  data,
  navState,
  setNavState,
  currentBook,
  onClose,
}: LibraryMyProps) {
  const router = useRouter();

  // 1. Categories (Tanakh, Mishnah, etc.)
  if (navState.level === "CATEGORY") {
    return (
      <div className="space-y-2">
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
            className="w-full p-4 flex items-center justify-between bg-white border border-pencil/10 rounded-2xl hover:border-accent/30 transition-all group text-left"
          >
            <div>
              <span className="font-serif font-bold text-lg text-ink group-hover:text-accent transition-colors">
                {col.name}
              </span>
              <p className="text-[10px] text-pencil/50 font-medium mt-0.5 line-clamp-1">
                {col.description}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-pencil/30 group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    );
  }

  // 2. SubCategories (Torah, Prophets...)
  if (navState.level === "SUBCATEGORY" && navState.selectedCategory) {
    return (
      <div className="space-y-2">
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
            className="w-full p-4 flex items-center justify-between bg-white border border-pencil/10 rounded-2xl hover:border-accent/30 transition-all group text-left"
          >
            <div>
              <span className="font-sans font-bold text-base text-ink group-hover:text-accent transition-colors">
                {cat.name}
              </span>
              <span className="text-[10px] text-pencil/40 font-mono ml-2">
                {cat.books.length} Books
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-pencil/30 group-hover:text-accent transition-all" />
          </button>
        ))}
      </div>
    );
  }

  // 3. Books
  if (navState.level === "BOOK" && navState.selectedSubCategory) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {navState.selectedSubCategory.books.map((book) => (
          <button
            key={book.slug}
            onClick={() =>
              setNavState({ ...navState, level: "CHAPTER", selectedBook: book })
            }
            className={cn(
              "p-4 rounded-2xl border text-left transition-all group",
              book.name === currentBook
                ? "bg-accent/5 border-accent/20"
                : "bg-white border-pencil/10 hover:border-accent/30"
            )}
          >
            <span
              className={cn(
                "font-serif font-bold text-base block mb-1",
                book.name === currentBook
                  ? "text-accent"
                  : "text-ink group-hover:text-accent"
              )}
            >
              {book.name}
            </span>
            <span className="text-[10px] font-mono text-pencil/40 uppercase tracking-widest">
              {book.chapters} Chapters
            </span>
          </button>
        ))}
      </div>
    );
  }

  // 4. Chapters
  if (
    navState.level === "CHAPTER" &&
    navState.selectedBook &&
    navState.selectedCategory
  ) {
    return (
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
        {Array.from({ length: navState.selectedBook.chapters }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const collection = navState.selectedCategory!.name.toLowerCase();
              const book = navState.selectedBook!.slug;
              router.push(`/library/${collection}/${book}/${i + 1}`);
              onClose();
            }}
            className="aspect-square flex items-center justify-center rounded-xl border border-pencil/10 bg-white text-sm font-bold text-ink hover:bg-accent hover:text-white hover:border-transparent transition-all"
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  }

  return null;
}
