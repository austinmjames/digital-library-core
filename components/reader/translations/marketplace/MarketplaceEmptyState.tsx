"use client";

import { Globe } from "lucide-react";

/**
 * components/reader/translations/marketplace/MarketplaceEmptyState.tsx
 * Visual feedback when no community projects match the search query.
 */
export function MarketplaceEmptyState() {
  return (
    <div className="py-20 text-center space-y-3 opacity-40 animate-in fade-in duration-500">
      <Globe className="w-12 h-12 mx-auto text-pencil/20" />
      <p className="text-sm font-medium text-ink">No public projects found.</p>
    </div>
  );
}
