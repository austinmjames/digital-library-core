"use client";

import { cn } from "@/lib/utils/utils";
import React from "react";

/**
 * Skeleton Component (v2.0)
 * Filepath: components/ui/Skeleton.tsx
 * Role: Premium loading placeholder for async data ingestion.
 * PRD Alignment: Section 4.1 (Aesthetics - High Fidelity).
 * Design: Support for DrashCard rounding and subtle paper-shimmer.
 */

interface SkeletonProps {
  className?: string;
  variant?: "rect" | "circle" | "card";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rect",
}) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-zinc-200/40 relative overflow-hidden",
        {
          // Geometry Alignment with Design System
          "rounded-md": variant === "rect",
          "rounded-full": variant === "circle",
          "rounded-[2.5rem]": variant === "card",
        },
        className
      )}
    >
      {/* High-Fidelity Shimmer Overlay 
        Provides a subtle diagonal movement to simulate light reflecting off parchment
      */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
