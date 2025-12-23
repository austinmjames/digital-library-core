/**
 * lib/types/library.ts
 * Core TypeScript interfaces for the Open Torah Library.
 */

export interface Verse {
  id: string; // e.g., "Genesis 1:1"
  c2_index: number; // e.g., 1
  he: string; // Hebrew HTML
  en: string; // English HTML
}

export interface ChapterData {
  id: string; // e.g., "Genesis.1"
  ref: string; // e.g., "Genesis 1"
  book: string; // e.g., "Genesis"
  chapterNum: number; // e.g., 1
  collection?: string; // e.g., "tanakh"
  verses: Verse[];
  nextRef?: string;
  prevRef?: string;
}

export interface BookMetadata {
  slug: string;
  title_en: string;
  title_he: string | null;
  categories: string[];
  order_id: number;
}
