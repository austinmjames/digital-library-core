"use client";

import { X, ShoppingBag } from "lucide-react";

interface MarketplaceHeaderProps {
  onClose: () => void;
}

/**
 * components/reader/marketplace/MarketplaceHeader.tsx
 * Updated: Segoe typography and imprinted icon container.
 */
export function MarketplaceHeader({ onClose }: MarketplaceHeaderProps) {
  return (
    <header className="h-20 border-b border-pencil/10 flex items-center justify-between px-8 bg-paper/95 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center imprint-sm">
          <ShoppingBag className="w-5 h-5 text-accent-foreground" />
        </div>
        <h2 className="text-2xl text-ink">Marketplace</h2>
      </div>
      <button
        onClick={onClose}
        className="p-3 rounded-full hover:bg-pencil/5 transition-all group active:scale-90"
      >
        <X className="w-6 h-6 text-pencil group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </header>
  );
}
