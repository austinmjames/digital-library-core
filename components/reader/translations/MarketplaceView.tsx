"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Sub-components
import { MarketplaceSearch } from "./marketplace/MarketplaceSearch";
import { MarketplaceItem } from "./marketplace/MarketplaceItem";
import { MarketplaceEmptyState } from "./marketplace/MarketplaceEmptyState";
import { MarketplaceInvite } from "./marketplace/MarketplaceInvite";

interface MarketplaceVersion {
  id: string;
  title: string;
  author_name: string;
  description: string;
  category_id: string;
  segment_count: number;
  last_published_at: string;
}

interface MarketplaceViewProps {
  onSelect: (id: string) => void;
}

/**
 * components/reader/translations/MarketplaceView.tsx
 * Fixed: Exported as named function.
 */
export function MarketplaceView({ onSelect }: MarketplaceViewProps) {
  const [items, setItems] = useState<MarketplaceVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchMarketplace() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("public_marketplace_translations")
          .select("*")
          .order("last_published_at", { ascending: false });

        if (error) throw error;
        if (data) setItems(data as MarketplaceVersion[]);
      } catch (err) {
        console.error("Marketplace fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMarketplace();
  }, [supabase]);

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-pencil/40">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest">
          Opening Marketplace...
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
                Community Contributions
              </h3>
            </header>

            <div className="space-y-3">
              {filteredItems.map((item) => (
                <MarketplaceItem
                  key={item.id}
                  item={item}
                  onSelect={onSelect}
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
