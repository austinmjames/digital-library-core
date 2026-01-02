"use client";

import { cn } from "@/lib/utils/utils";
import {
  Book,
  Flame,
  GraduationCap,
  Hash,
  Library,
  LucideIcon,
  Microscope,
  PenTool,
  Scroll,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import Image from "next/image";
import React from "react";

/**
 * Avatar Component (v3.1 - Robustness Fix)
 * Filepath: components/ui/Avatar.tsx
 * Role: Renders images, custom icons, or text logos based on scholar configuration.
 * Fix: Added defensive guard for config.value to prevent runtime crashes (substring error).
 */

export interface AvatarConfig {
  type: "icon" | "text" | "image";
  value: string; // Icon name, text string, or image URL
  color: string; // Tailwind text color class
  bg: string; // Tailwind bg color class
}

interface AvatarProps {
  src?: string | null;
  config?: AvatarConfig;
  initials?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  book: Book,
  scroll: Scroll,
  pen: PenTool,
  flame: Flame,
  sparkles: Sparkles,
  hash: Hash,
  shield: Shield,
  grad: GraduationCap,
  lab: Microscope,
  library: Library,
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  config,
  initials,
  size = "md",
  className,
}) => {
  const sizeMap = {
    sm: "w-10 h-10 text-xs rounded-xl",
    md: "w-16 h-16 text-sm rounded-2xl",
    lg: "w-24 h-24 text-xl rounded-[2rem]",
    xl: "w-40 h-40 text-4xl rounded-[3rem]",
  };

  const iconSizeMap = {
    sm: 18,
    md: 28,
    lg: 40,
    xl: 64,
  };

  // 1. Rendering Logic: Prioritize Image -> Custom Config -> Initials -> Default
  if (src || (config?.type === "image" && config.value)) {
    return (
      <div
        className={cn(
          "relative overflow-hidden shrink-0 shadow-xl border border-zinc-100",
          sizeMap[size],
          className
        )}
      >
        <Image
          src={src || config?.value || ""}
          alt="Avatar"
          fill
          className="object-cover"
        />
      </div>
    );
  }

  // Defensive Check: Only attempt custom rendering if config AND value are present
  if (config && config.value) {
    const Icon = ICON_MAP[config.value];
    return (
      <div
        className={cn(
          "flex items-center justify-center shrink-0 shadow-lg transition-all border border-white/10",
          sizeMap[size],
          config.bg,
          config.color,
          className
        )}
      >
        {config.type === "icon" && Icon ? (
          <Icon size={iconSizeMap[size]} strokeWidth={2.5} />
        ) : (
          <span className="font-black uppercase tracking-tighter select-none">
            {config.value.substring(0, 2)}
          </span>
        )}
      </div>
    );
  }

  // Fallback: If no config/value, use initials or the standard User icon
  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-400 border border-zinc-200",
        sizeMap[size],
        className
      )}
    >
      {initials ? (
        <span className="font-black uppercase">{(initials || "?")[0]}</span>
      ) : (
        <User size={iconSizeMap[size] * 0.8} />
      )}
    </div>
  );
};
