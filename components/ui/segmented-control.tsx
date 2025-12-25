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
 * Updated: Made component more compact with smaller padding and icons.
 * Updated: Active state now uses standard ink color for a more neutral scholarly look.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const activeIndex = options.findIndex((opt) => opt.value === value);
  const segmentWidth = 100 / options.length;

  // Rule: If 3 or more options, we transition to an icon-only mode
  const isIconOnly = options.length >= 3;

  return (
    <div
      className={cn(
        "p-1 gap-1 bg-slate-200/40 rounded-2xl relative shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.08)] border border-black/[0.02] flex",
        className
      )}
    >
      {/* Tactile Sliding Handle */}
      <div
        className="absolute top-1 bottom-1 rounded-[0.7rem] bg-white shadow-sm transition-all duration-300 ease-spring z-0"
        style={{
          width: `calc(${segmentWidth}% - 3px)`,
          left: `calc(${activeIndex * segmentWidth}% + ${
            activeIndex === 0 ? "1px" : "0px"
          })`,
          marginLeft: activeIndex === 0 ? "0" : "1.5px",
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
              "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider z-10 transition-all flex items-center justify-center gap-1.5 outline-none active:scale-95",
              isActive ? "text-ink" : "text-pencil/50 hover:text-pencil"
            )}
            aria-selected={isActive}
            role="tab"
          >
            {Icon && (
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors stroke-[2px]",
                  isActive ? "text-ink opacity-100" : "text-pencil/40"
                )}
              />
            )}

            {!isIconOnly && (
              <span className="leading-none">{option.label}</span>
            )}

            {!isIconOnly && option.countLabel && (
              <span
                className={cn(
                  "text-[9px] font-mono transition-opacity",
                  isActive ? "opacity-100" : "opacity-40"
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
