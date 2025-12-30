import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn (Class Name Merger)
 * Filepath: lib/utils.ts
 * Role: Standardizes Tailwind class merging across the Scriptorium.
 * Context: Prevents style conflicts in complex components like the Library Tabs and Reader.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
