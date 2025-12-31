"use client";

import { cn } from "@/lib/utils/utils";
import { Sparkles, User } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

/**
 * Avatar Component (v2.0 - Tier Aware)
 * Filepath: components/ui/Avatar.tsx
 * Role: Optimized profile display with Chaver (Pro) tier visual hooks.
 * PRD Alignment: Section 2.2 (Social Identity) & 5.0 (Monetization).
 */

interface AvatarProps {
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tier?: "free" | "pro"; // Added for PRD monetization alignment
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User Avatar",
  initials,
  size = "md",
  tier = "free",
  className,
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 160, // Increased for Profile Hero sections
  };

  const pixelSize = sizeMap[size];
  const isPro = tier === "pro";

  const containerClasses = cn(
    "relative flex items-center justify-center overflow-hidden shrink-0 transition-all duration-500",
    {
      // Geometry Tokens
      "rounded-lg": size === "xs",
      "rounded-xl": size === "sm",
      "rounded-2xl": size === "md",
      "rounded-[2rem]": size === "lg",
      "rounded-[3rem]": size === "xl",

      // Tier Styling
      "bg-zinc-50 border border-zinc-100": !isPro,
      "bg-zinc-950 border-2 border-amber-500/30 shadow-xl scale-[1.02]": isPro,

      // Sizing
      "w-6 h-6": size === "xs",
      "w-8 h-8": size === "sm",
      "w-12 h-12": size === "md",
      "w-16 h-16": size === "lg",
      "w-40 h-40": size === "xl",
    },
    className
  );

  const renderContent = () => {
    if (src && !hasError) {
      return (
        <Image
          src={src}
          alt={alt}
          width={pixelSize}
          height={pixelSize}
          className="object-cover w-full h-full"
          onError={() => setHasError(true)}
          priority={size === "xl"}
        />
      );
    }

    if (initials) {
      return (
        <span
          className={cn(
            "font-black uppercase tracking-tighter select-none transition-colors",
            isPro ? "text-white" : "text-zinc-400",
            {
              "text-[8px]": size === "xs",
              "text-[10px]": size === "sm",
              "text-sm": size === "md",
              "text-xl": size === "lg",
              "text-5xl": size === "xl",
            }
          )}
        >
          {initials.substring(0, 1)}
        </span>
      );
    }

    return (
      <User
        className={isPro ? "text-amber-500/50" : "text-zinc-200"}
        size={pixelSize * 0.5}
      />
    );
  };

  return (
    <div className={containerClasses}>
      {renderContent()}

      {/* Premium Badge Overlay (PRD 5.0) */}
      {isPro && size !== "xs" && (
        <div
          className={cn(
            "absolute bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg border-2 border-zinc-950",
            {
              "-bottom-1 -right-1 p-0.5 rounded-lg": size === "sm",
              "-bottom-1 -right-1 p-1 rounded-xl": size === "md",
              "bottom-1 right-1 p-1.5 rounded-2xl": size === "lg",
              "bottom-2 right-2 p-2.5 rounded-[1.25rem]": size === "xl",
            }
          )}
        >
          <Sparkles size={size === "xl" ? 18 : 10} fill="currentColor" />
        </div>
      )}

      {/* Pro Glow Accent */}
      {isPro && (
        <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />
      )}
    </div>
  );
};
