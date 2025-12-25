"use client";

import { useState, useMemo, useCallback } from "react";
import { MarketplaceItem } from "@/lib/types/library";
import { MARKETPLACE_CATEGORIES } from "@/lib/constants";

type ViewState = "OVERVIEW" | "CATEGORY";

/**
 * useTranslationMarketplace
 * Logic engine for the Translation discovery experience.
 * Categorizes and ranks community interpretation projects.
 */
export function useTranslationMarketplace(items: MarketplaceItem[]) {
  const [viewState, setViewState] = useState<ViewState>("OVERVIEW");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Process data into categorized groups
  const { categories, filteredItems } = useMemo(() => {
    const groups: Record<string, MarketplaceItem[]> = {};

    // Initialize groups from constants
    MARKETPLACE_CATEGORIES.forEach((cat) => (groups[cat.id] = []));

    items.forEach((item) => {
      // In a real DB, item would have a category_id.
      // For now, we use simple keyword matching or default to 'plain'.
      const desc = item.description?.toLowerCase() || "";
      let catId = "plain";

      if (
        desc.includes("mystic") ||
        desc.includes("kabbalah") ||
        desc.includes("inner")
      )
        catId = "mystical";
      else if (desc.includes("academic") || desc.includes("scholarly"))
        catId = "scholarly";
      else if (desc.includes("poetic") || desc.includes("interpretive"))
        catId = "interpretive";

      if (groups[catId]) groups[catId].push(item);
    });

    const globalFilter = (list: MarketplaceItem[]) =>
      list.filter(
        (i) =>
          i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return {
      categories: groups,
      filteredItems: globalFilter(items),
    };
  }, [items, searchQuery]);

  // 2. State Handlers
  const handleViewMore = useCallback((catId: string) => {
    setActiveCategory(catId);
    setViewState("CATEGORY");
  }, []);

  const handleBack = useCallback(() => {
    setViewState("OVERVIEW");
    setActiveCategory(null);
  }, []);

  return {
    state: {
      viewState,
      activeCategory,
      searchQuery,
      categories,
      filteredItems,
    },
    actions: {
      setSearchQuery,
      handleViewMore,
      handleBack,
      clearSearch: () => setSearchQuery(""),
    },
  };
}
