import React from "react";

/**
 * Skeleton Component
 * Filepath: components/ui/Skeleton.tsx
 * Role: Loading state placeholder.
 */

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-zinc-100 rounded-xl ${className}`} />
);
