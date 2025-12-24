"use client";

import { useState, useEffect } from "react";
import { Globe, Search, Download, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { MARKETPLACE_CATEGORIES } from "@/lib/constants";

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
 * MarketplaceView (Translations)
 * Connects to the public_marketplace_translations view to show community projects.
 */
export default function MarketplaceView({ onSelect }: MarketplaceViewProps) {
  const [items, setItems] = useState<MarketplaceVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchMarketplace() {
      setLoading(true);
      // Fetch from the custom view created in the SQL migration
      const { data, error } = await supabase
        .from("public_marketplace_translations")
        .select("*")
        .order("last_published_at", { ascending: false });

      if (data) setItems(data as MarketplaceVersion[]);
      if (error) console.error("Marketplace fetch error:", error);
      setLoading(false);
    }
    fetchMarketplace();
  }, [supabase]);

  // Filter based on search input
  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pencil/40" />
        <Input
          placeholder="Search community versions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-xl bg-pencil/5 border-transparent focus:bg-white transition-all shadow-inner focus:shadow-none"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-pencil/40">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-widest">
            Opening Marketplace...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center space-y-3 opacity-40">
          <Globe className="w-12 h-12 mx-auto text-pencil/20" />
          <p className="text-sm font-medium">No public projects found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Featured/Latest Section */}
          <div>
            <h3 className="text-xs font-bold text-pencil uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
              <Sparkles className="w-3 h-3 text-gold fill-gold" />
              Latest Contributions
            </h3>

            <div className="space-y-3">
              {filteredItems.map((v) => {
                const category = MARKETPLACE_CATEGORIES.find(
                  (c) => c.id === v.category_id
                );

                return (
                  <div
                    key={v.id}
                    className="p-4 rounded-2xl bg-white border border-pencil/10 hover:border-gold/30 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                    onClick={() => onSelect(v.id)}
                  >
                    {/* Progress Indicator Background */}
                    <div className="absolute bottom-0 left-0 h-0.5 bg-gold/10 w-full" />

                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-serif font-bold text-ink group-hover:text-gold transition-colors leading-tight">
                          {v.title}
                        </h4>
                        <p className="text-[11px] text-pencil font-medium mt-0.5">
                          by {v.author_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gold bg-gold/5 px-2 py-0.5 rounded-full border border-gold/10">
                        {category?.label || "General"}
                      </div>
                    </div>

                    {v.description && (
                      <p className="text-[11px] text-pencil/70 line-clamp-2 italic mb-3 leading-relaxed">
                        {v.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-pencil/5 pt-3">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-pencil/60 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                          <Download className="w-3 h-3" />
                          {v.segment_count} Verses
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-gold uppercase tracking-wider group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Select Layer &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Community Invite Footer */}
      <div className="bg-indigo-600/[0.03] rounded-2xl p-6 border border-indigo-600/10">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          <h4 className="font-bold text-indigo-900 text-sm italic">
            Join the Sovereignty Project
          </h4>
        </div>
        <p className="text-xs text-indigo-800/70 leading-relaxed">
          OpenTorah is a collaborative sanctuary. Every public project is vetted
          by the community to help others experience the text.
        </p>
      </div>
    </div>
  );
}
