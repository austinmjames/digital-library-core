"use client";

import { cn } from "@/lib/utils/utils";
import { Loader2 } from "lucide-react";
import React from "react";

/**
 * DrashButton Component (v2.0)
 * Filepath: components/ui/DrashButton.tsx
 * Role: Unified interactive primitive for the DrashX ecosystem.
 * PRD Alignment: Section 4.1 (Aesthetics) & Section 5.0 (Monetization).
 * Design: High-density typography, snappy scaling, and tier-aware variants.
 */

export type ButtonVariant =
  | "primary" // Ink (zinc-950)
  | "secondary" // Paper/Outline
  | "chaver" // Gold (amber-500 - Pro Tier)
  | "ghost" // Transparent
  | "danger"; // Rose

interface DrashButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const DrashButton = React.forwardRef<
  HTMLButtonElement,
  DrashButtonProps
>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-zinc-950 text-white hover:bg-zinc-800 shadow-xl shadow-zinc-950/10 border border-white/10",
      secondary:
        "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm",
      chaver:
        "bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-xl shadow-amber-500/20 border border-amber-600/20",
      ghost:
        "bg-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950",
      danger:
        "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100",
    };

    const sizes = {
      sm: "px-4 py-2 text-[9px] rounded-lg",
      md: "px-6 py-3.5 text-[10px] rounded-xl",
      lg: "px-10 py-5 text-[11px] rounded-2xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2.5 font-black uppercase tracking-[0.25em] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden relative group",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {/* Premium Shine Overlay for Primary/Chaver variants */}
        {(variant === "primary" || variant === "chaver") && (
          <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
        )}

        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0 transition-transform group-hover:-translate-x-0.5">
                {leftIcon}
              </span>
            )}
            <span className="relative z-10">{children}</span>
            {rightIcon && (
              <span className="shrink-0 transition-transform group-hover:translate-x-0.5">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

DrashButton.displayName = "DrashButton";
