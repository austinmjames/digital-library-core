/**
 * lib/types/library.ts
 * Master type registry for OpenTorah.
 */

// --- Core Text Types ---

export interface Verse {
  id: string;
  c2_index: number;
  he: string;
  en: string;
  parashaStart?: string;
}

export interface ChapterData {
  id: string;
  ref: string;
  book: string;
  chapterNum: number;
  collection?: string;
  verses: Verse[];
  nextRef?: string;
  prevRef?: string;
  activeTranslation?: string;
}

// --- Commentary & User Content ---

export interface Commentary {
  id: string;
  author_en: string;
  author_he: string;
  text_en?: string;
  text_he?: string;
  verse_ref: string;
  source_ref: string;
  category?: string; // Added to support "Modern" tagging
}

export interface UserCommentary {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  collection_name: string;
  collection_id?: string | null;
  verse_ref: string;
  created_at: string;
}

export interface UserTranslation {
  id?: string;
  version_id: string;
  book_slug: string;
  c1: number;
  c2: number;
  custom_content: string;
  user_id: string;
}

// --- Navigation & Grouping ---

// Updated "Library" to "Community"
export type CommentaryGroup =
  | "My Commentary"
  | "Community"
  | "Classics"
  | "Modern Rabbis";

/**
 * CommentaryTab
 * Centralized navigation type for the Commentary sidebar.
 */
export type CommentaryTab =
  | "MY_COMMENTARIES"
  | "MARKETPLACE"
  | "DISCUSSION"
  | "MANAGE_BOOKS";

// --- PARTITION RE-EXPORTS ---
export * from "./social";
export * from "./study";
