"use client";

import { Download } from "lucide-react";
import { MARKETPLACE_CATEGORIES } from "@/lib/constants";
// Removed unused cn import

interface MarketplaceVersion {
  id: string;
  title: string;
  author_name: string;
  description: string;
  category_id: string;
  segment_count: number;
}

interface MarketplaceItemProps {
  item: MarketplaceVersion;
  onSelect: (id: string) => void;
}

/**
 * components/reader/translations/marketplace/MarketplaceItem.tsx
 * A premium card representing a community translation project.
 */
export function MarketplaceItem({ item, onSelect }: MarketplaceItemProps) {
  const category = MARKETPLACE_CATEGORIES.find(
    (c) => c.id === item.category_id
  );

  return (
    <div
      className="p-4 rounded-2xl bg-white border border-pencil/10 hover:border-gold/30 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
      onClick={() => onSelect(item.id)}
    >
      {/* Visual background hint */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-gold/10 w-full" />

      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-serif font-bold text-ink group-hover:text-gold transition-colors leading-tight">
            {item.title}
          </h4>
          <p className="text-[11px] text-pencil font-medium mt-0.5">
            by {item.author_name}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-gold bg-gold/5 px-2 py-0.5 rounded-full border border-gold/10 uppercase tracking-tighter">
          {category?.label || "General"}
        </div>
      </div>

      {item.description && (
        <p className="text-[11px] text-pencil/70 line-clamp-2 italic mb-3 leading-relaxed">
          {item.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-pencil/5 pt-3">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-pencil/60 uppercase tracking-widest flex items-center gap-1.5 font-bold">
            <Download className="w-3 h-3" />
            {item.segment_count} Verses
          </span>
        </div>
        <span className="text-[10px] font-bold text-gold uppercase tracking-wider group-hover:translate-x-1 transition-transform flex items-center gap-1">
          Select Layer &rarr;
        </span>
      </div>
    </div>
  );
}
