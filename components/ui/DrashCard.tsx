"use client";

import { cn } from "@/lib/utils/utils";
import React from "react";

/**
 * DrashCard Component (v2.0)
 * Filepath: components/ui/DrashCard.tsx
 * Role: Unified container primitive for the DrashX ecosystem.
 * PRD Alignment: Section 4.1 (Aesthetics) & Section 5.0 (Monetization).
 * Design: Leather-bound rounding, Paper/Ink variants, and snappy interactions.
 */

type CardVariant = "default" | "inverse" | "chaver" | "outline";

interface DrashCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  isPressable?: boolean;
  onClick?: () => void;
}

export const DrashCard = ({
  children,
  variant = "default",
  className,
  isPressable = false,
  onClick,
}: DrashCardProps) => {
  const variants = {
    // Standard Paper Aesthetic
    default: "bg-white border-zinc-100 shadow-sm text-zinc-900",

    // High-Contrast Ink (Zinc-950)
    inverse: "bg-zinc-950 border-white/5 shadow-2xl text-white",

    // Premium Chaver Tier (Gold Glow)
    chaver:
      "bg-white border-amber-200 shadow-[0_20px_50px_rgba(245,158,11,0.1)] text-zinc-900 ring-1 ring-amber-500/10",

    // Low-Density Scriptorium Style
    outline:
      "bg-transparent border-zinc-200 border-dashed border-2 shadow-none text-zinc-400",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[2.5rem] border overflow-hidden transition-all duration-500 relative",
        variants[variant],
        isPressable &&
          "cursor-pointer hover:shadow-2xl hover:border-zinc-300 active:scale-[0.98] hover:-translate-y-1",
        className
      )}
    >
      {/* Visual Depth Overlay (Paper Grain) */}
      {variant !== "outline" && (
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      )}

      {/* Subtle Accent for Chaver Tier */}
      {variant === "chaver" && (
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 shadow-[2px_0_10px_rgba(245,158,11,0.4)]" />
      )}

      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

/**
 * DrashCard Sub-Components for Structural Integrity
 */

export const DrashCardHeader = ({
  children,
  className,
  showDivider = false,
}: {
  children: React.ReactNode;
  className?: string;
  showDivider?: boolean;
}) => (
  <div
    className={cn(
      "p-8 pb-4 flex items-center justify-between",
      showDivider && "border-b border-zinc-50",
      className
    )}
  >
    {children}
  </div>
);

export const DrashCardContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("p-8 pt-4", className)}>{children}</div>;

export const DrashCardFooter = ({
  children,
  className,
  bgAlt = false,
}: {
  children: React.ReactNode;
  className?: string;
  bgAlt?: boolean;
}) => (
  <div
    className={cn(
      "p-6 px-8 mt-auto border-t border-zinc-50 flex items-center justify-between",
      bgAlt && "bg-zinc-50/50",
      className
    )}
  >
    {children}
  </div>
);
