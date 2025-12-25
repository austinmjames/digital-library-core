"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { MarketplaceVersion } from "@/lib/types/library";
import {
  fetchMarketplaceItems,
  installMarketplaceItem,
  reportContent,
} from "@/app/actions";

// Sub-components using absolute paths to resolve module errors
import { MarketplaceSearch } from "@/components/reader/translations/marketplace/MarketplaceSearch";
import { MarketplaceItemUI } from "@/components/reader/translations/marketplace/MarketplaceItem";
import { MarketplaceEmptyState } from "@/components/reader/translations/marketplace/MarketplaceEmptyState";
import { MarketplaceInvite } from "@/components/reader/translations/marketplace/MarketplaceInvite";

/**
 * MarketplaceView (Translation Sidebar)
 * Discovery logic for community layers.
 * * Note to User: The assignability error regarding 'loading' and 'groupedData'
 * suggests that CommentaryPanel.tsx is incorrectly importing this file instead
 * of '@/components/reader/commentary/MarketplaceView'.
 * Please check the import in CommentaryPanel.tsx.
 */
interface MarketplaceViewProps {
  onSelect: (id: string) => void;
}

export function MarketplaceView({ onSelect }: MarketplaceViewProps) {
  const [items, setItems] = useState<MarketplaceVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadMarketplace = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMarketplaceItems("translation");
      setItems(data as MarketplaceVersion[]);
    } catch (err) {
      console.error("Marketplace load failure:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketplace();
  }, [loadMarketplace]);

  const handleInstall = async (id: string) => {
    try {
      await installMarketplaceItem(id, "translation");
      // Immediately refresh list to apply the exclusion rule
      loadMarketplace();
    } catch (err) {
      console.error("Installation error:", err);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author_name?.toLowerCase().includes(searchQuery.toLowerCase());

      // RULE: Do not appear in Explore if already in my library
      return matchesSearch && !item.is_installed;
    });
  }, [items, searchQuery]);

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-pencil/40">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest">
          Consulting community...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <MarketplaceSearch value={searchQuery} onChange={setSearchQuery} />
      <div className="space-y-6">
        {filteredItems.length === 0 ? (
          <MarketplaceEmptyState />
        ) : (
          <div className="space-y-6">
            <header className="flex items-center gap-2 px-1">
              <Sparkles className="w-3 h-3 text-gold fill-gold" />
              <h3 className="text-xs font-black text-pencil uppercase tracking-[0.2em]">
                Community Wisdom
              </h3>
            </header>
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <MarketplaceItemUI
                  key={item.id}
                  item={item}
                  onSelect={onSelect}
                  onInstall={() => handleInstall(item.id)}
                  onReport={(reason: string) => reportContent(item.id, reason)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <MarketplaceInvite />
    </div>
  );
}
