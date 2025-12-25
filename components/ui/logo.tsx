"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  type?: "full" | "icon" | "responsive";
}

/**
 * components/ui/logo.tsx
 * Updated: Replaced image asset with pure text-based branding.
 * - Desktop: "DrashX." (Sleek, Modern, iOS-inspired).
 * - Mobile: "DX." (Semibold).
 * - Dark Mode: All white text.
 */
export function Logo({ className, size = "md", type = "full" }: LogoProps) {
  // Size mappings for text scaling
  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl",
  };

  const currentSize = textSizes[size];

  // Mobile Icon (DX.)
  if (type === "icon") {
    return (
      <div
        className={cn(
          "font-sans font-bold tracking-tight flex items-baseline select-none leading-none",
          currentSize,
          className
        )}
      >
        {/* Updated to solid grey minimalist style as requested */}
        <span className="text-pencil dark:text-white">DrashX</span>
      </div>
    );
  }

  // Full Logo (DrashX.)
  if (type === "full") {
    return (
      <div
        className={cn(
          "font-sans flex items-baseline select-none leading-none tracking-tight",
          currentSize,
          className
        )}
      >
        <span className="font-semibold text-ink dark:text-white tracking-tight">
          Drash
        </span>
        <span className="font-bold text-pencil/60 dark:text-white">X</span>
        <span className="font-bold text-pencil/60 dark:text-white">.</span>
      </div>
    );
  }

  // Responsive Wrapper
  return (
    <>
      <div className="md:hidden">
        <Logo type="icon" size={size} className={className} />
      </div>
      <div className="hidden md:block">
        <Logo type="full" size={size} className={className} />
      </div>
    </>
  );
}
