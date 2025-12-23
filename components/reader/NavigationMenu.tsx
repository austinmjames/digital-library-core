"use client";

import { useState, useEffect } from "react";
import { NavCollection, NavBook, fetchLibraryData } from "@/lib/books";
import { cn } from "@/lib/utils";
import {
  X,
  Book,
  ShoppingBag,
  Plus,
  Trash2,
  Loader2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentBook: string;
}

type MenuTab = "LIBRARY" | "MARKETPLACE";

export function NavigationMenu({
  isOpen,
  onClose,
  currentBook,
}: NavigationMenuProps) {
  const [activeTab, setActiveTab] = useState<MenuTab>("LIBRARY");

  // Data State
  const [libraryData, setLibraryData] = useState<NavCollection[]>([]);
  const [marketplaceData, setMarketplaceData] = useState<NavCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State for expanding categories
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  // Fetch Data on Mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const { library, marketplace } = await fetchLibraryData();
        setLibraryData(library);
        setMarketplaceData(marketplace);

        // Auto-expand all categories initially for better UX
        const allCats: Record<string, boolean> = {};
        [...library, ...marketplace].forEach((col) => {
          col.categories.forEach((cat) => {
            allCats[cat.name] = true;
          });
        });
        setExpandedCategories(allCats);
      } catch (e) {
        console.error("Failed to load navigation", e);
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen && libraryData.length === 0) {
      loadData();
    }
  }, [isOpen, libraryData.length]);

  const handleTabChange = (tab: MenuTab) => {
    setActiveTab(tab);
  };

  /**
   * Mock function to move books. In production, this calls a Server Action.
   */
  const moveBook = (bookSlug: string, source: "LIBRARY" | "MARKETPLACE") => {
    const sourceList = source === "LIBRARY" ? libraryData : marketplaceData;
    const targetList = source === "LIBRARY" ? marketplaceData : libraryData;
    const setSource =
      source === "LIBRARY" ? setLibraryData : setMarketplaceData;
    const setTarget =
      source === "LIBRARY" ? setMarketplaceData : setLibraryData;

    // Deep clone
    const newSource = JSON.parse(JSON.stringify(sourceList)) as NavCollection[];
    const newTarget = JSON.parse(JSON.stringify(targetList)) as NavCollection[];

    let bookToMove: NavBook | null = null;
    let targetCollectionName = "";
    let targetCollectionDesc: string | undefined = undefined;
    let targetCategoryName = "";
    let targetCategoryDesc: string | undefined = undefined;

    // 1. Find and remove from source
    for (const col of newSource) {
      for (const cat of col.categories) {
        const idx = cat.books.findIndex((b) => b.slug === bookSlug);
        if (idx !== -1) {
          bookToMove = cat.books[idx];
          targetCollectionName = col.name;
          targetCollectionDesc = col.description;
          targetCategoryName = cat.name;
          targetCategoryDesc = cat.description;
          cat.books.splice(idx, 1);
          break;
        }
      }
      if (bookToMove) break;
    }

    if (!bookToMove) return;

    // 2. Add to target
    // We use findIndex to avoid 'undefined' reference issues with object references
    let targetColIndex = newTarget.findIndex(
      (c) => c.name === targetCollectionName
    );

    if (targetColIndex === -1) {
      newTarget.push({
        name: targetCollectionName,
        description: targetCollectionDesc,
        categories: [],
      });
      targetColIndex = newTarget.length - 1;
    }

    const targetCol = newTarget[targetColIndex];
    let targetCat = targetCol.categories.find(
      (c) => c.name === targetCategoryName
    );

    if (!targetCat) {
      targetCat = {
        name: targetCategoryName,
        description: targetCategoryDesc,
        books: [],
      };
      targetCol.categories.push(targetCat);
    }

    targetCat.books.push(bookToMove);

    setSource(newSource);
    setTarget(newTarget);
  };

  const activeData = activeTab === "LIBRARY" ? libraryData : marketplaceData;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper animate-in slide-in-from-bottom-5 duration-300">
      {/* --- Header --- */}
      <div className="flex-none flex items-center justify-between px-6 h-20 border-b border-pencil/10 bg-paper/95 backdrop-blur-md z-10">
        <h2 className="font-serif font-bold text-3xl text-ink tracking-tight">
          {activeTab === "LIBRARY" ? "My Library" : "Marketplace"}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-pencil/10 transition-colors group"
        >
          <X className="w-6 h-6 text-pencil group-hover:text-ink transition-colors" />
        </button>
      </div>

      {/* --- Tab Switcher --- */}
      <div className="flex-none px-6 py-4 bg-paper border-b border-pencil/5">
        <div className="flex p-1 bg-pencil/10 rounded-xl relative max-w-md mx-auto md:mx-0">
          <div
            className={cn(
              "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-all duration-300 ease-spring",
              activeTab === "MARKETPLACE"
                ? "translate-x-[calc(100%+4px)]"
                : "translate-x-0"
            )}
          />
          <button
            onClick={() => handleTabChange("LIBRARY")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold z-10 transition-colors duration-300",
              activeTab === "LIBRARY"
                ? "text-ink"
                : "text-pencil hover:text-ink"
            )}
          >
            <Book className="w-4 h-4" />
            Library
          </button>
          <button
            onClick={() => handleTabChange("MARKETPLACE")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold z-10 transition-colors duration-300",
              activeTab === "MARKETPLACE"
                ? "text-ink"
                : "text-pencil hover:text-ink"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            Marketplace
          </button>
        </div>
      </div>

      {/* --- Content --- */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-32">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-pencil/50 gap-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium tracking-widest uppercase">
              Loading Books...
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12">
            {activeData.map((col) => {
              // Calculate total books in collection for the header
              const totalBooks = col.categories.reduce(
                (acc, cat) => acc + cat.books.length,
                0
              );
              if (totalBooks === 0) return null;

              return (
                <div
                  key={col.name}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  {/* Collection Header */}
                  <div className="mb-6 pb-2 border-b-2 border-pencil/10">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="text-2xl font-serif font-bold text-ink">
                        {col.name}
                      </h3>
                      <span className="text-xs font-bold text-pencil/50 uppercase tracking-widest bg-pencil/5 px-2 py-1 rounded">
                        {totalBooks} Books
                      </span>
                    </div>
                    {col.description && (
                      <p className="text-sm text-pencil/70 max-w-2xl">
                        {col.description}
                      </p>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="space-y-8 pl-0 md:pl-4">
                    {col.categories.map((cat) => {
                      if (cat.books.length === 0) return null;
                      const isExpanded = expandedCategories[cat.name];

                      return (
                        <div key={cat.name} className="relative">
                          {/* Vertical line connector for hierarchy visual */}
                          <div className="absolute left-[-16px] top-4 bottom-0 w-px bg-pencil/10 hidden md:block" />

                          {/* Sub-Category Header */}
                          <button
                            onClick={() => toggleCategory(cat.name)}
                            className="flex items-center gap-2 w-full text-left group mb-3"
                          >
                            <div className="p-1 rounded bg-pencil/10 text-pencil/60 group-hover:text-ink transition-colors">
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-ink/80 group-hover:text-ink transition-colors">
                                {cat.name}
                              </h4>
                            </div>
                          </button>
                          {cat.description && isExpanded && (
                            <p className="text-xs text-pencil/60 mb-4 pl-7 max-w-xl">
                              {cat.description}
                            </p>
                          )}

                          {/* Books List */}
                          {isExpanded && (
                            <div className="grid grid-cols-1 gap-2 pl-2 md:pl-7">
                              {cat.books.map((book) => (
                                <div
                                  key={book.slug}
                                  className="group relative flex items-center justify-between p-4 rounded-xl bg-white border border-pencil/10 hover:border-gold/30 hover:shadow-sm transition-all"
                                >
                                  <a
                                    href={`/library/${col.name
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")}/${book.slug}/1`}
                                    className="flex-1 flex flex-col gap-1 pr-4"
                                  >
                                    <div className="flex items-baseline gap-3">
                                      <span
                                        className={cn(
                                          "font-serif text-lg font-bold transition-colors",
                                          book.name === currentBook
                                            ? "text-gold"
                                            : "text-ink group-hover:text-gold"
                                        )}
                                      >
                                        {book.name}
                                      </span>
                                      <span className="text-[10px] font-mono text-pencil/50 bg-pencil/5 px-1.5 py-0.5 rounded">
                                        {book.chapters} Chapters
                                      </span>
                                    </div>
                                    {book.description && (
                                      <p className="text-xs text-pencil line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                                        {book.description}
                                      </p>
                                    )}
                                  </a>

                                  {/* Action Button */}
                                  <div className="shrink-0">
                                    {activeTab === "MARKETPLACE" ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          moveBook(book.slug, "MARKETPLACE");
                                        }}
                                        className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 transition-colors"
                                        title="Add to Library"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          moveBook(book.slug, "LIBRARY");
                                        }}
                                        className="p-2 rounded-full bg-pencil/5 text-pencil/40 hover:bg-red-50 hover:text-red-500 hover:border-red-100 border border-transparent transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Remove from Library"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {activeData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-60">
                <div className="w-16 h-16 rounded-full bg-pencil/5 flex items-center justify-center">
                  <Book className="w-8 h-8 text-pencil/30" />
                </div>
                <p className="text-lg text-ink font-serif">
                  Your {activeTab === "LIBRARY" ? "Library" : "Marketplace"} is
                  empty.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
