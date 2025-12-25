"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MarketplaceItem as MarketplaceItemType } from "@/lib/types/library";
import { fetchMarketplaceItems, reportContent } from "@/app/actions";
import { formatCount } from "@/lib/marketplace-utils";

/**
 * useMarketplaceData
 * Logic engine for the Marketplace sidebar.
 * Resolved: Removed unused variables 'CollaboratorRow' and 'sharedRes'.
 */
export function useMarketplaceData(isOpen: boolean, searchQuery: string) {
  const [commentaries, setCommentaries] = useState<MarketplaceItemType[]>([]);
  const [translations, setTranslations] = useState<MarketplaceItemType[]>([]);
  const [studies, setStudies] = useState<MarketplaceItemType[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [commData, transData] = await Promise.all([
        fetchMarketplaceItems("commentary"),
        fetchMarketplaceItems("translation"),
      ]);

      setCommentaries(commData);
      setTranslations(transData);
      setStudies([]); // Placeholder for actual studies data
    } catch (err) {
      console.error("Marketplace data load failure:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen, loadData]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const filterFn = (item: MarketplaceItemType) => {
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.author_name?.toLowerCase().includes(query);

      return matchesSearch && !item.is_installed;
    };

    const comms = commentaries.filter(filterFn);
    const trans = translations.filter(filterFn);
    const stus = studies.filter(filterFn);

    return {
      commentaries: comms,
      translations: trans,
      studies: stus,
      commCountLabel: formatCount(comms.length),
      transCountLabel: formatCount(trans.length),
      studyCountLabel: formatCount(stus.length),
    };
  }, [commentaries, translations, studies, searchQuery]);

  return {
    loading,
    filteredData,
    refetch: loadData,
    reportItem: reportContent,
  };
}
