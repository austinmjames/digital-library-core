import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * lib/utils.ts
 * Standard utility for merging Tailwind CSS classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * hasEnvVars
 * Helper for development to verify Supabase environment variables.
 */
export const hasEnvVars =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * formatHebrewChapter
 * Basic gematria/numeral helper.
 */
export function formatHebrewChapter(n: number): string {
  const letters = [
    "",
    "א",
    "ב",
    "ג",
    "ד",
    "ה",
    "ו",
    "ז",
    "ח",
    "ט",
    "י",
    "יא",
    "יב",
    "יג",
    "יד",
    "טו",
    "טז",
    "יז",
    "יח",
    "יט",
    "כ",
  ];
  return letters[n] || n.toString();
}
