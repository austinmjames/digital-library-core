"use client";

import { useState, useMemo, useCallback } from "react";
import { MarketplaceItem } from "@/lib/types/library";

export type MarketplaceCategory = "classic" | "modern" | "community";
export type ViewState = "OVERVIEW" | "CATEGORY" | "AUTHOR_SEARCH";

export function useCommentaryMarketplace(items: MarketplaceItem[]) {
  const [viewState, setViewState] = useState<ViewState>("OVERVIEW");
  const [activeCategory, setActiveCategory] =
    useState<MarketplaceCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  const { categories, authorMatches, filteredItems } = useMemo(() => {
    const groups = {
      classic: [] as MarketplaceItem[],
      modern: [] as MarketplaceItem[],
      community: [] as MarketplaceItem[],
    };

    const authorSearchList: MarketplaceItem[] = [];

    items.forEach((item) => {
      const author = item.author_name?.toLowerCase() || "";
      const isClassic = [
        "rashi",
        "ramban",
        "ibn ezra",
        "sforno",
        "rashbam",
        "malbim",
      ].some((c) => author.includes(c));
      const isModern = [
        "rebbe",
        "steinsaltz",
        "sacks",
        "kaplan",
        "hirsch",
        "lubavitch",
      ].some((m) => author.includes(m));

      if (isClassic) groups.classic.push(item);
      else if (isModern) groups.modern.push(item);
      else groups.community.push(item);

      if (selectedAuthor && item.author_name === selectedAuthor) {
        authorSearchList.push(item);
      }
    });

    const globalFilter = (list: MarketplaceItem[]) =>
      list.filter(
        (i) =>
          i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return {
      categories: groups,
      authorMatches: authorSearchList,
      filteredItems: globalFilter(items),
    };
  }, [items, searchQuery, selectedAuthor]);

  const handleAuthorClick = useCallback((name: string) => {
    setSelectedAuthor(name);
    setViewState("AUTHOR_SEARCH");
    setSearchQuery("");
  }, []);

  const handleViewMore = useCallback((type: MarketplaceCategory) => {
    setActiveCategory(type);
    setViewState("CATEGORY");
  }, []);

  const handleBack = useCallback(() => {
    if (viewState === "AUTHOR_SEARCH" && activeCategory) {
      setViewState("CATEGORY");
    } else {
      setViewState("OVERVIEW");
      setActiveCategory(null);
    }
    setSelectedAuthor(null);
  }, [viewState, activeCategory]);

  return {
    state: {
      viewState,
      activeCategory,
      searchQuery,
      selectedAuthor,
      categories,
      authorMatches,
      filteredItems,
    },
    actions: {
      setSearchQuery,
      handleAuthorClick,
      handleViewMore,
      handleBack,
      clearSearch: () => setSearchQuery(""),
    },
  };
}
