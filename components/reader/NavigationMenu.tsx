"use client";

import { useState, useEffect } from "react";
import { NavCollection, fetchLibraryData } from "@/lib/books";
import { cn } from "@/lib/utils";
import { X, ArrowLeft, Book, ShoppingBag } from "lucide-react";
import { LibrarySearch } from "@/components/reader/navigation/LibrarySearch";
import { LibraryMy } from "@/components/reader/navigation/LibraryMy";
import { LibraryMarketplace } from "@/components/reader/navigation/LibraryMarketplace";
import { NavState } from "@/components/reader/navigation/types";
import { SegmentedControl } from "@/components/ui/segmented-control";

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentBook: string;
}

type MenuTab = "LIBRARY" | "MARKETPLACE";

/**
 * components/reader/NavigationMenu.tsx
 * Updated Layout:
 * - Desktop: Centered "pull-down" panel from the header area.
 * - Mobile: Fullscreen slide-over.
 */
export function NavigationMenu({
  isOpen,
  onClose,
  currentBook,
}: NavigationMenuProps) {
  const [activeTab, setActiveTab] = useState<MenuTab>("LIBRARY");
  const [navState, setNavState] = useState<NavState>({ level: "CATEGORY" });

  const [libraryData, setLibraryData] = useState<NavCollection[]>([]);
  const [marketplaceData, setMarketplaceData] = useState<NavCollection[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { library, marketplace } = await fetchLibraryData();
        setLibraryData(library);
        setMarketplaceData(marketplace);
      } catch (e) {
        console.error("Failed to load navigation", e);
      } finally {
        setLoading(false);
      }
    }
    if (isOpen && libraryData.length === 0) loadData();
  }, [isOpen, libraryData.length]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setNavState({ level: "CATEGORY" }), 300);
    }
  }, [isOpen]);

  // Reset level when switching tabs
  useEffect(() => {
    setNavState({ level: "CATEGORY" });
  }, [activeTab]);

  const handleBack = () => {
    switch (navState.level) {
      case "CHAPTER":
        setNavState((prev) => ({
          ...prev,
          level: "BOOK",
          selectedBook: undefined,
        }));
        break;
      case "BOOK":
        setNavState((prev) => ({
          ...prev,
          level: "SUBCATEGORY",
          selectedSubCategory: undefined,
        }));
        break;
      case "SUBCATEGORY":
        setNavState((prev) => ({
          ...prev,
          level: "CATEGORY",
          selectedCategory: undefined,
        }));
        break;
      default:
        // Do nothing if at root, or maybe close?
        // Usually back at root does nothing in this new layout as tabs are above
        break;
    }
  };

  const getBreadcrumb = () => {
    switch (navState.level) {
      case "SUBCATEGORY":
        return navState.selectedCategory?.name;
      case "BOOK":
        return navState.selectedSubCategory?.name;
      case "CHAPTER":
        return navState.selectedBook?.name;
      default:
        return activeTab === "LIBRARY" ? "My Library" : "Marketplace";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Pull-Down Panel */}
      <div
        className={cn(
          "fixed z-[70] bg-paper shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ease-spring",
          // Mobile: Full screen, slide from top
          "inset-x-0 top-0 h-full rounded-b-[2.5rem]",
          // Desktop: Centered pull-down, max-width constrained, starts from top
          "md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] md:h-[85vh] md:top-4 md:rounded-[2.5rem]",
          "animate-in slide-in-from-top-4 duration-500"
        )}
      >
        {/* Row 1: Search & Close */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-4 bg-paper/95 backdrop-blur-xl shrink-0 z-20">
          <div className="flex-1">
            <LibrarySearch onNavigate={onClose} />
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-pencil/5 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Row 2: Segmented Controls */}
        <div className="px-6 pb-6 border-b border-pencil/5 bg-paper/95 backdrop-blur-xl shrink-0 z-20">
          <SegmentedControl
            value={activeTab}
            onChange={(val) => setActiveTab(val as MenuTab)}
            options={[
              { value: "LIBRARY", label: "My Library", icon: Book },
              { value: "MARKETPLACE", label: "Marketplace", icon: ShoppingBag },
            ]}
          />
        </div>

        {/* Row 3: Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-paper">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Content Header with Back Button */}
            <div className="flex items-center gap-3 min-h-[32px]">
              {navState.level !== "CATEGORY" && (
                <button
                  onClick={handleBack}
                  className="w-8 h-8 rounded-full bg-pencil/5 flex items-center justify-center hover:bg-pencil/10 transition-colors animate-in zoom-in-50"
                >
                  <ArrowLeft className="w-4 h-4 text-pencil" />
                </button>
              )}

              <div>
                <h3 className="font-serif font-bold text-xl text-ink tracking-tight">
                  {navState.level === "CATEGORY"
                    ? activeTab === "LIBRARY"
                      ? "Collections"
                      : "Explore"
                    : getBreadcrumb()}
                </h3>
                {navState.level === "CATEGORY" && (
                  <p className="text-xs text-pencil/50 mt-0.5 font-medium">
                    {activeTab === "LIBRARY"
                      ? "Select a section to begin reading."
                      : "Discover new texts and translations."}
                  </p>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 text-pencil/40 text-sm font-medium">
                Loading...
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                {activeTab === "LIBRARY" ? (
                  <LibraryMy
                    data={libraryData}
                    navState={navState}
                    setNavState={setNavState}
                    currentBook={currentBook}
                    onClose={onClose}
                  />
                ) : (
                  <LibraryMarketplace
                    data={marketplaceData}
                    navState={navState}
                    setNavState={setNavState}
                    currentBook={currentBook}
                    onClose={onClose}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
