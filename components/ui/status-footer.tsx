"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StatusFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * components/ui/status-footer.tsx
 * A shared UI primitive for sidebar and panel status bars.
 * * DESIGN TOKENS:
 * - Height: h-16 (Unified for all panels)
 * - Font: Segoe UI / Inter (Global inheritance)
 * - Colors: Paper & Ink (bg-paper/95, text-pencil)
 */
export function StatusFooter({ children, className }: StatusFooterProps) {
  return (
    <footer
      className={cn(
        "h-16 border-t border-pencil/10 bg-paper/95 backdrop-blur-xl shrink-0 flex items-center justify-center px-8 z-20",
        className
      )}
    >
      <div className="text-[11px] text-pencil font-bold uppercase tracking-[0.12em] text-center animate-in fade-in duration-700 max-w-[320px] leading-relaxed">
        {children}
      </div>
    </footer>
  );
}
