"use client";

import { cn } from "@/lib/utils/utils";
import React from "react";

/**
 * Badge Component (v2.0 - Scholarly Variants)
 * Filepath: components/ui/Badge.tsx
 * Role: Standardized status and tier indicators.
 * PRD Alignment: Section 2.2 (Social Identity) & 5.0 (Monetization).
 * Consistency: Aligned with Avatar.tsx (Canvas) typography and palette.
 */

export type BadgeVariant =
  | "default"
  | "talmid"
  | "chaver"
  | "verified"
  | "success"
  | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className,
}) => {
  const variants = {
    default: "bg-zinc-100 text-zinc-500 border-transparent",

    // Tier-Specific (Aligned with Avatar.tsx colors)
    talmid: "bg-zinc-950 text-white border-zinc-800 shadow-sm",
    chaver:
      "bg-amber-500 text-zinc-950 border-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.3)]",

    // Status-Specific
    verified: "bg-blue-50 text-blue-700 border-blue-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",

    // Low-Density
    outline: "bg-transparent border-zinc-200 text-zinc-400 font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
