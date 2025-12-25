"use client";

import { ShoppingBag } from "lucide-react";

/**
 * components/reader/marketplace/MarketplaceHeader.tsx
 * FIXED: Removed required 'onClose' prop since it's now handled by the Master Panel.
 */
export function MarketplaceHeader() {
  return (
    <header className="h-20 border-b border-pencil/10 flex items-center justify-between px-8 bg-paper/95 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-black/[0.03]">
          <ShoppingBag className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-2xl text-ink font-bold tracking-tight">
          Marketplace
        </h2>
      </div>
    </header>
  );
}
