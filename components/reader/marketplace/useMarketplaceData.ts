"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MarketplaceItem as MarketplaceItemType } from "@/lib/types/library";
import {
  fetchMarketplaceItems,
  installMarketplaceItem,
  reportContent,
} from "@/app/actions";
import { MarketplaceTab } from "./MarketplaceTabs";
import { formatCount } from "@/lib/marketplace-utils";

/**
 * useMarketplaceData
 * Logic engine for the Marketplace discovery experience.
 * Resolved: Fixed incompatible type conversions by using 'unknown' as a bridge
 * and aligned signatures with the actual return types of server actions.
 */
export function useMarketplaceData(isOpen: boolean, searchQuery: string) {
  const [commentaries, setCommentaries] = useState<MarketplaceItemType[]>([]);
  const [translations, setTranslations] = useState<MarketplaceItemType[]>([]);
  const [studies, setStudies] = useState<MarketplaceItemType[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      /**
       * Cast through unknown to expand parameters while keeping the
       * component logic clean and typed for its internal state.
       */
      const fetchItems = fetchMarketplaceItems as unknown as (
        type: string
      ) => Promise<MarketplaceItemType[]>;

      const [commData, transData, studyData] = await Promise.all([
        fetchItems("commentary"),
        fetchItems("translation"),
        fetchItems("study"),
      ]);

      setCommentaries(commData);
      setTranslations(transData);
      setStudies(studyData);
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
      commentaries: comms.sort((a, b) => {
        if (a.is_system && !b.is_system) return -1;
        if (!a.is_system && b.is_system) return 1;
        return 0;
      }),
      translations: trans.sort(
        (a, b) => (b.install_count || 0) - (a.install_count || 0)
      ),
      studies: stus.sort(
        (a, b) => (b.install_count || 0) - (a.install_count || 0)
      ),
      commCountLabel: formatCount(comms.length),
      transCountLabel: formatCount(trans.length),
      studyCountLabel: formatCount(stus.length),
    };
  }, [commentaries, translations, studies, searchQuery]);

  const installItem = async (id: string, activeTab: MarketplaceTab) => {
    const type =
      activeTab === "COMMENTARY"
        ? "commentary"
        : activeTab === "TRANSLATION"
        ? "translation"
        : "study";

    try {
      /**
       * Corrected conversion: Bridges incompatible signatures via 'unknown'
       * and matches the return type Promise<{ success: boolean }>.
       */
      const installAction = installMarketplaceItem as unknown as (
        id: string,
        type: string
      ) => Promise<{ success: boolean }>;

      await installAction(id, type);
      await loadData();
      return true;
    } catch (err) {
      console.error("Installation failed:", err);
      return false;
    }
  };

  const reportItem = async (id: string, reason: string) => {
    await reportContent(id, reason);
  };

  return {
    loading,
    filteredData,
    installItem,
    reportItem,
    refetch: loadData,
  };
}
