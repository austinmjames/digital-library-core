"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  type?: "full" | "icon" | "responsive";
}

/**
 * components/ui/logo.tsx
 * The official DrashX Logo component.
 * Updated to use the renamed 'drashlogo.png' file.
 * * DESIGN LOGIC:
 * - Light mode: Original colors (Black "Drash", Medium Blue "X").
 * - Dark mode: Forced to pure white via 'brightness-0 invert' filter.
 */
export function Logo({ className, size = "md", type = "full" }: LogoProps) {
  // Sizing definitions for the branding image
  const sizes = {
    sm: { width: 120, height: 40, container: "w-32 h-10" },
    md: { width: 180, height: 60, container: "w-48 h-16" },
    lg: { width: 280, height: 90, container: "w-72 h-24" },
    xl: { width: 450, height: 150, container: "w-[450px] h-36" },
  };

  // Sizing for the icon-only version (DX)
  const iconSizes = {
    sm: { width: 36, height: 36, container: "w-9 h-9" },
    md: { width: 56, height: 56, container: "w-14 h-14" },
    lg: { width: 90, height: 90, container: "w-24 h-24" },
    xl: { width: 140, height: 140, container: "w-36 h-36" },
  };

  const current = type === "icon" ? iconSizes[size] : sizes[size];

  if (type === "responsive") {
    return (
      <>
        {/* Mobile: Show Icon (DX) */}
        <div className="md:hidden">
          <Logo type="icon" size="sm" className={className} />
        </div>
        {/* Desktop: Show Full Logo */}
        <div className="hidden md:block">
          <Logo type="full" size="md" className={className} />
        </div>
      </>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center transition-all duration-500",
        current.container,
        // Dark Mode Transformation: Turns the colored PNG into pure white
        "dark:brightness-0 dark:invert",
        className
      )}
    >
      <Image
        src="/drashlogo.png"
        alt="DrashX Logo"
        width={current.width}
        height={current.height}
        className="object-contain"
        priority
        onError={(e) => {
          // Fallback if image fails to load during build/env issues
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}
