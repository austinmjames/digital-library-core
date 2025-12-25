"use client";

import { useState, useMemo, useCallback } from "react";
import { MarketplaceItem } from "@/lib/types/library";

export type StudiesCategory = "cycles" | "curriculum" | "community";
type ViewState = "OVERVIEW" | "CATEGORY";

export function useStudiesMarketplace(items: MarketplaceItem[]) {
  const [viewState, setViewState] = useState<ViewState>("OVERVIEW");
  const [activeCategory, setActiveCategory] = useState<StudiesCategory | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const { categories, filteredItems } = useMemo(() => {
    const groups = {
      cycles: [] as MarketplaceItem[],
      curriculum: [] as MarketplaceItem[],
      community: [] as MarketplaceItem[],
    };

    items.forEach((item: MarketplaceItem) => {
      const desc = item.description?.toLowerCase() || "";
      const name = item.name.toLowerCase();

      const isCycle = ["yomi", "parasha", "daily", "cycle"].some(
        (k) => name.includes(k) || desc.includes(k)
      );
      const isCurriculum = [
        "yeshiva",
        "program",
        "course",
        "curriculum",
        "929",
      ].some((k) => name.includes(k) || desc.includes(k));

      if (isCycle) groups.cycles.push(item);
      else if (isCurriculum) groups.curriculum.push(item);
      else groups.community.push(item);
    });

    const query = searchQuery.toLowerCase();
    const globalFilter = (list: MarketplaceItem[]) =>
      list.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.author_name?.toLowerCase().includes(query)
      );

    return {
      categories: groups,
      filteredItems: globalFilter(items),
    };
  }, [items, searchQuery]);

  const handleViewMore = useCallback((type: StudiesCategory) => {
    setActiveCategory(type);
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
