import { DrashButton } from "@/components/ui/DrashButton"; // Updated import
import { Check } from "lucide-react";
import React from "react";

/**
 * PricingTable Component
 * Filepath: components/shared/PricingTable.tsx
 * Role: Phase 6 - Monetization UI.
 * Purpose: Displays tiered subscription options for the DrashX Pro upgrade.
 */

interface PricingCardProps {
  tier: string;
  price: string;
  description: string;
  features: string[];
  isPro?: boolean;
  onUpgrade?: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  price,
  description,
  features,
  isPro = false,
  onUpgrade,
}) => (
  <div
    className={`p-8 rounded-[2.5rem] border-2 flex flex-col transition-all duration-500 ${
      isPro
        ? "bg-zinc-950 text-white border-zinc-800 shadow-2xl scale-105 z-10"
        : "bg-white text-zinc-900 border-zinc-100 hover:border-zinc-200"
    }`}
  >
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em]">{tier}</h3>
        {isPro && (
          <span className="px-2 py-0.5 bg-amber-500 text-black text-[9px] font-bold rounded-full uppercase">
            Recommended
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold">{price}</span>
        <span
          className={isPro ? "text-zinc-500 text-sm" : "text-zinc-400 text-sm"}
        >
          /mo
        </span>
      </div>
      <p
        className={`mt-4 text-xs leading-relaxed ${
          isPro ? "text-zinc-400" : "text-zinc-500"
        }`}
      >
        {description}
      </p>
    </div>

    <ul className="space-y-4 mb-10 flex-grow">
      {features.map((feature, i) => (
        <li key={i} className="flex items-start gap-3">
          <div
            className={`mt-0.5 p-0.5 rounded-full ${
              isPro
                ? "bg-amber-500/20 text-amber-500"
                : "bg-zinc-100 text-zinc-400"
            }`}
          >
            <Check size={12} strokeWidth={3} />
          </div>
          <span
            className={`text-[11px] font-medium leading-tight ${
              isPro ? "text-zinc-300" : "text-zinc-600"
            }`}
          >
            {feature}
          </span>
        </li>
      ))}
    </ul>

    <DrashButton
      variant={isPro ? "primary" : "secondary"}
      className={`w-full py-4 ${
        isPro ? "bg-white text-black hover:bg-zinc-200" : ""
      }`}
      onClick={onUpgrade}
    >
      {isPro ? "Unlock Pro Access" : "Start for Free"}
    </DrashButton>
  </div>
);

export const PricingTable = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto py-12">
      <PricingCard
        tier="Seeker"
        price="$0"
        description="Perfect for casual study and individual exploration of the canon."
        features={[
          "Full access to canonical library",
          "Unlimited personal notes",
          "Basic cross-referencing",
          "Public group participation",
        ]}
      />
      <PricingCard
        tier="Sage"
        price="$12"
        description="For serious scholars who want advanced AI synthesis and global impact."
        isPro={true}
        features={[
          "Advanced AI Contextual Assistant",
          "Unlimited Vector Semantic Search",
          "Unlimited Private Study Groups",
          "Custom Manuscript Exports",
          "Early access to Phase 7 features",
          "Pro Scholar badge & avatar",
        ]}
        onUpgrade={() => console.log("Stripe Redirect...")}
      />
    </div>
  );
};
