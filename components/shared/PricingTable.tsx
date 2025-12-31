"use client";

import { DrashButton } from "@/components/ui/DrashButton";
import { cn } from "@/lib/utils/utils";
import { Check, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import React, { useState } from "react";

/**
 * PricingTable Component (v2.0)
 * Filepath: components/shared/PricingTable.tsx
 * Role: Monetization UI for 'Talmid' (Free) and 'Chaver' (Pro) tiers.
 * PRD Alignment: Section 5.0 (Monetization) & Section 4.1 (Aesthetics).
 */

interface PricingCardProps {
  tier: string;
  price: string;
  description: string;
  features: string[];
  isPro?: boolean;
  onUpgrade?: () => Promise<void>;
}

const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  price,
  description,
  features,
  isPro = false,
  onUpgrade,
}) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!onUpgrade) return;
    setLoading(true);
    await onUpgrade();
    setLoading(false);
  };

  return (
    <div
      className={cn(
        "p-10 rounded-[3rem] border-2 flex flex-col transition-all duration-500 relative overflow-hidden group",
        isPro
          ? "bg-zinc-950 text-white border-zinc-800 shadow-2xl scale-[1.05] z-10"
          : "bg-white text-zinc-900 border-zinc-100 hover:border-zinc-200"
      )}
    >
      {/* Decorative Gradient for Pro Tier */}
      {isPro && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
      )}

      <div className="mb-10 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3
            className={cn(
              "text-[10px] font-black uppercase tracking-[0.4em]",
              isPro ? "text-amber-500" : "text-zinc-400"
            )}
          >
            {tier}
          </h3>
          {isPro && (
            <span className="px-2.5 py-1 bg-amber-500 text-zinc-950 text-[8px] font-black rounded-full uppercase tracking-widest shadow-lg">
              Scholar Choice
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black tracking-tighter">{price}</span>
          <span
            className={cn(
              "text-xs font-black uppercase tracking-widest",
              isPro ? "text-zinc-500" : "text-zinc-300"
            )}
          >
            /mo
          </span>
        </div>

        <p
          className={cn(
            "mt-6 text-xs leading-relaxed font-medium italic",
            isPro ? "text-zinc-400" : "text-zinc-500"
          )}
        >
          {description}
        </p>
      </div>

      <ul className="space-y-5 mb-12 flex-grow relative z-10">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-4">
            <div
              className={cn(
                "mt-0.5 p-1 rounded-lg transition-colors",
                isPro
                  ? "bg-zinc-900 text-amber-500"
                  : "bg-zinc-50 text-zinc-300"
              )}
            >
              <Check size={12} strokeWidth={4} />
            </div>
            <span
              className={cn(
                "text-[11px] font-bold leading-snug tracking-tight",
                isPro ? "text-zinc-300" : "text-zinc-600"
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <DrashButton
        variant={isPro ? "primary" : "secondary"}
        className={cn(
          "w-full py-5 rounded-2xl relative overflow-hidden group/btn shadow-xl",
          isPro
            ? "bg-white text-zinc-950 hover:bg-zinc-100"
            : "bg-zinc-950 text-white hover:bg-zinc-800"
        )}
        onClick={handleAction}
        disabled={loading}
      >
        <div className="flex items-center justify-center gap-3">
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">
                {isPro ? "Initiate Pro Pass" : "Start Study"}
              </span>
              {isPro ? (
                <Sparkles size={14} className="text-amber-500" />
              ) : (
                <ShieldCheck size={14} className="text-zinc-400" />
              )}
            </>
          )}
        </div>
      </DrashButton>
    </div>
  );
};

export const PricingTable = () => {
  const handleCheckout = async (tier: string) => {
    console.log(`[Stripe] Initializing checkout for ${tier}...`);
    // Placeholder for actual checkout redirection logic
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto py-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PricingCard
        tier="Talmid"
        price="$0"
        description="Ideal for casual discovery and building your primary scholarly foundations."
        features={[
          "Full access to canonical library",
          "Unlimited personal annotations",
          "Standard cross-referencing",
          "Public Circle participation",
          "Encrypted cloud sync",
        ]}
        onUpgrade={() => handleCheckout("talmid")}
      />

      <PricingCard
        tier="Chaver"
        price="$12"
        description="For devoted scholars requiring deep semantic synthesis and AI logic extraction."
        isPro={true}
        features={[
          "Sage AI: Contextual Insights",
          "Vector-powered Semantic Search",
          "Private Learning Circles",
          "Custom Manuscript Export (PDF/MD)",
          "Scholarly Badge & Avatar",
          "Phase 7 Early Ingestion Access",
        ]}
        onUpgrade={() => handleCheckout("chaver")}
      />
    </div>
  );
};
