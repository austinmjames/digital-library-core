import { Verse } from "@/types/reader";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes verse data from shorthand (he/en) to full manifest schema (hebrew_text/english_text)
 * Use this at the API boundary or when loading mock data.
 */
export function normalizeVerse(raw: Verse): Verse {
  return {
    ...raw,
    id: raw.id || `temp-${raw.ref}`,
    hebrew_text: raw.hebrew_text || raw.he,
    english_text: raw.english_text || raw.en,
    global_index: raw.global_index || 0,
  };
}

export function normalizeVerses(rawArray: Verse[]): Verse[] {
  return rawArray.map(normalizeVerse);
}
