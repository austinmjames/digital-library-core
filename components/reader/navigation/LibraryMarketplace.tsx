"use client";

import { NavCollection } from "@/lib/books";
import { NavState } from "@/components/reader/navigation/types";
import { MarketplaceBookCard } from "@/components/reader/marketplace/shared/MarketplaceBookCard";
import { useRouter } from "next/navigation";
import { installMarketplaceItem } from "@/app/actions/marketplace";

interface LibraryMarketplaceProps {
  data: NavCollection[];
  navState: NavState;
  setNavState: (state: NavState) => void;
}

/**
 * navigation/LibraryMarketplace.tsx
 * Refactored to use MarketplaceBookCard. Resolved: Fixed 'book' typing and removed unused vars.
 */
export function LibraryMarketplace({
  data,
  navState,
  setNavState,
}: LibraryMarketplaceProps) {
  const router = useRouter();

  const handleInstall = async (id: string) => {
    try {
      await installMarketplaceItem(id, "commentary");
      router.refresh();
    } catch (err) {
      console.error("Install failed:", err);
    }
  };

  if (navState.level === "CATEGORY") {
    return (
      <div className="space-y-4">
        {data.map((col) => (
          <MarketplaceBookCard
            key={col.name}
            item={{
              id: col.name,
              type: "book",
              name: col.name,
              description: col.description,
              install_count: 0,
              is_installed: false,
            }}
            onInstall={() => Promise.resolve()}
            onOpen={() =>
              setNavState({
                ...navState,
                level: "SUBCATEGORY",
                selectedCategory: col,
              })
            }
          />
        ))}
      </div>
    );
  }

  if (navState.level === "BOOK" && navState.selectedSubCategory) {
    return (
      <div className="space-y-4">
        {navState.selectedSubCategory.books.map((book) => (
          <MarketplaceBookCard
            key={book.slug}
            item={{
              id: book.slug,
              type: "book",
              name: book.name,
              description: book.description || `Explore ${book.name}.`,
              install_count: 0,
              is_installed: false,
            }}
            onInstall={() => handleInstall(book.slug)}
            onOpen={() =>
              setNavState({ ...navState, level: "CHAPTER", selectedBook: book })
            }
          />
        ))}
      </div>
    );
  }

  return null;
}
