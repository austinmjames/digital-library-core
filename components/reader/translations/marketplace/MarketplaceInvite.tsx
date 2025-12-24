"use client";

import { Globe } from "lucide-react";

/**
 * components/reader/translations/marketplace/MarketplaceInvite.tsx
 * Promotional footer inviting users to become authors.
 */
export function MarketplaceInvite() {
  return (
    <div className="bg-indigo-600/[0.03] rounded-2xl p-6 border border-indigo-600/10 shadow-inner">
      <div className="flex items-center gap-3 mb-2">
        <Globe className="w-5 h-5 text-indigo-600" />
        <h4 className="font-serif font-bold text-indigo-900 text-sm italic">
          Join the Sovereignty Project
        </h4>
      </div>
      <p className="text-xs text-indigo-800/70 leading-relaxed font-medium">
        OpenTorah is a collaborative sanctuary. Every public project is vetted
        by the community to help others experience the text through fresh eyes.
      </p>
    </div>
  );
}
