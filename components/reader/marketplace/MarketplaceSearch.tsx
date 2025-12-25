"use client";

import { Search } from "lucide-react";

interface MarketplaceSearchProps {
  value: string;
  onChange: (val: string) => void;
}

/**
 * components/reader/marketplace/MarketplaceSearch.tsx
 * Updated focus states to use the Powder Blue accent variable.
 */
export function MarketplaceSearch({ value, onChange }: MarketplaceSearchProps) {
  return (
    <div className="relative group px-8 pt-6">
      <Search className="absolute left-11 top-[calc(50%+12px)] -translate-y-1/2 w-3.5 h-3.5 text-pencil/30 group-focus-within:text-accent transition-colors" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by title or author..."
        className="w-full bg-pencil/5 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:ring-2 ring-accent/20 outline-none transition-all placeholder:text-pencil/40 imprint-sm"
      />
    </div>
  );
}
