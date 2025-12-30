import React from "react";

/**
 * Badge Component
 * Filepath: components/ui/Badge.tsx
 * Role: Standardized status/label indicator.
 */

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = "bg-zinc-100 text-zinc-600",
}) => (
  <span
    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter ${color}`}
  >
    {children}
  </span>
);
