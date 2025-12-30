import React from "react";

/**
 * DrashCard Component
 * Filepath: components/ui/Card.tsx
 * Role: Standardized container component.
 */

export const DrashCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={`bg-white border border-zinc-100 rounded-3xl shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);
