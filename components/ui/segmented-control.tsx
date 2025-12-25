"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SegmentedControlOption<T> {
  value: T;
  label: string;
  icon?: React.ElementType;
  countLabel?: string;
}

interface SegmentedControlProps<T> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * components/ui/segmented-control.tsx
 * Reusable "Paper & Ink" tab switcher.
 * Updated: Automatically hides text labels and counts if 3+ tabs are present to maintain a clean UI.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const activeIndex = options.findIndex((opt) => opt.value === value);
  const segmentWidth = 100 / options.length;

  // Rule: If 3 or more options, we transition to an icon-only "Discovery" mode
  const isIconOnly = options.length >= 3;

  return (
    <div
      className={cn(
        "p-1.5 gap-1 bg-slate-200/40 rounded-2xl relative shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.08)] border border-black/[0.02] flex",
        className
      )}
    >
      {/* Tactile Sliding Handle */}
      <div
        className="absolute top-1.5 bottom-1.5 rounded-[0.8rem] bg-white shadow-sm transition-all duration-300 ease-spring z-0"
        style={{
          width: `calc(${segmentWidth}% - 4px)`,
          left: `calc(${activeIndex * segmentWidth}% + ${
            activeIndex === 0 ? "1.5px" : "0px"
          })`,
          marginLeft: activeIndex === 0 ? "0" : "2px",
        }}
      />

      {options.map((option) => {
        const isActive = option.value === value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            title={option.label}
            className={cn(
              "flex-1 py-2 text-[11px] font-bold uppercase tracking-wider z-10 transition-colors flex items-center justify-center gap-2 outline-none",
              isActive ? "text-ink" : "text-pencil/70 hover:text-ink"
            )}
            aria-selected={isActive}
            role="tab"
          >
            {Icon && (
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-accent-foreground" : "text-pencil/40"
                )}
              />
            )}

            {!isIconOnly && <span>{option.label}</span>}

            {!isIconOnly && option.countLabel && (
              <span
                className={cn(
                  "text-[10px] font-mono transition-opacity",
                  isActive ? "opacity-70" : "opacity-40"
                )}
              >
                ({option.countLabel})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
