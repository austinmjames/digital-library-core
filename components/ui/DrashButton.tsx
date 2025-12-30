import React from "react";

/**
 * DrashButton Component
 * Filepath: components/ui/Button.tsx
 * Role: Standardized button component with theme variants.
 * Alignment: Design System (Zinc/Orange/Rose palette).
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const DrashButton: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200",
    secondary: "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50",
    ghost: "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100",
    danger: "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[10px] rounded-lg",
    md: "px-5 py-2.5 text-[11px] rounded-xl",
    lg: "px-8 py-4 text-xs rounded-2xl",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
