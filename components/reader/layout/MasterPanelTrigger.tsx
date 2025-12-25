"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MasterPanelTriggerProps {
  isOpen: boolean;
  onClick: () => void;
}

/**
 * components/reader/layout/MasterPanelTrigger.tsx
 * Floating vertical tab for the DrashX Master Panel.
 */
export function MasterPanelTrigger({
  isOpen,
  onClick,
}: MasterPanelTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed right-0 top-1/2 -translate-y-1/2 z-[55] transition-all duration-500 ease-spring group",
        "h-24 w-6 bg-paper border-l border-y border-pencil/10 rounded-l-2xl shadow-[-4px_0_12px_rgba(0,0,0,0.05)]",
        "hover:w-8 hover:bg-white flex items-center justify-center",
        // Matches new widths in MasterPanel: md:w-[480px] lg:w-[550px]
        isOpen &&
          "translate-x-full md:translate-x-[-480px] lg:translate-x-[-550px]"
      )}
    >
      <div className="flex flex-col items-center gap-1">
        {isOpen ? (
          <ChevronRight className="w-4 h-4 text-accent animate-in fade-in" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-pencil group-hover:text-accent animate-in fade-in" />
        )}
        <div className="w-1 h-8 rounded-full bg-pencil/10 group-hover:bg-accent/20 transition-colors" />
      </div>
    </button>
  );
}
