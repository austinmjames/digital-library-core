"use client";

import { cn } from "@/lib/utils/utils";
import { User } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

/**
 * Avatar Component (v1.1 - Next.js Optimized)
 * Filepath: components/ui/Avatar.tsx
 * Role: Optimized profile display using next/image.
 * Fixes: Resolves "no-img-element" linting error and improves LCP.
 */

interface AvatarProps {
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User Avatar",
  initials,
  size = "md",
  className,
}) => {
  const [hasError, setHasError] = useState(false);

  // Map semantic sizes to pixel values for next/image
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const pixelSize = sizeMap[size];

  const containerClasses = cn(
    "relative flex items-center justify-center rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0",
    {
      "w-6 h-6": size === "xs",
      "w-8 h-8": size === "sm",
      "w-12 h-12": size === "md",
      "w-16 h-16": size === "lg",
      "w-24 h-24": size === "xl",
    },
    className
  );

  // Render logic for different states
  const renderContent = () => {
    // 1. If we have a source and no error, use optimized Next.js Image
    if (src && !hasError) {
      return (
        <Image
          src={src}
          alt={alt}
          width={pixelSize}
          height={pixelSize}
          className="object-cover w-full h-full"
          onError={() => setHasError(true)}
          // Priority loading for large avatars in the hero section
          priority={size === "xl"}
        />
      );
    }

    // 2. Fallback to Initials
    if (initials) {
      return (
        <span
          className={cn(
            "font-bold text-zinc-500 uppercase tracking-tighter select-none",
            {
              "text-[8px]": size === "xs",
              "text-[10px]": size === "sm",
              "text-xs": size === "md",
              "text-lg": size === "lg",
              "text-2xl": size === "xl",
            }
          )}
        >
          {initials.substring(0, 2)}
        </span>
      );
    }

    // 3. Absolute fallback: Generic User Icon
    return <User className="text-zinc-300" size={pixelSize * 0.5} />;
  };

  return <div className={containerClasses}>{renderContent()}</div>;
};
