"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MarketplaceSearchProps {
  value: string;
  onChange: (val: string) => void;
}

/**
 * components/reader/translations/marketplace/MarketplaceSearch.tsx
 * Specialized search input for filtering community layers.
 */
export function MarketplaceSearch({ value, onChange }: MarketplaceSearchProps) {
  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pencil/40 group-focus-within:text-gold transition-colors" />
      <Input
        placeholder="Search community versions..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 rounded-xl bg-pencil/5 border-transparent focus:bg-white transition-all shadow-inner focus:shadow-none"
      />
    </div>
  );
}
