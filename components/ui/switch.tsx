"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * components/ui/switch.tsx
 * Iconic iOS-style toggle.
 * Active: Powder Blue (#A5C3D1)
 * Inactive: Muted Gray
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
}: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#A5C3D1]",
        checked ? "bg-[#A5C3D1]" : "bg-slate-200",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
          checked ? "translate-x-5.5" : "translate-x-0.5",
          // Tactile "pressed" look when switch is active
          checked && "shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        )}
      />
    </button>
  );
}
