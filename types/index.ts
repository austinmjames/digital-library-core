import { TOCNode } from "@/components/reader/TOCSidebar";

/**
 * Shared Type Definitions (v1.1 - Unified Reader Types)
 * Filepath: types/index.ts
 * Role: Centralized domain types.
 * Fixes: Added missing 'toc', 'en_title' to BookMetadata and extended Verse type.
 */

export type StructureType =
  | "CHAPTER_VERSE"
  | "DAF_LINE"
  | "SIMAN_SEIF"
  | "NAMED_SECTION";

export interface Verse {
  id: string;
  book_id: string;
  ref: string;
  hebrew_text: string;
  english_text: string;
  c1: number;
  c2: number;
  c3?: number;
  // UI-specific fields
  global_index?: number;
  has_notes?: boolean;
}

export interface BookMetadata {
  id: string;
  slug: string;
  en_title: string; // Matches Reader usage
  he_title: string;
  structure_type: StructureType;
  category: string;
  total_sections: number;
  next_book_slug: string | null;
  prev_book_slug: string | null;
  description?: string;
  toc: TOCNode[]; // Required for Sidebar
}

export interface UserNote {
  id: string;
  ref: string;
  title: string | null;
  content: Record<string, unknown>;
  is_public: boolean;
  updated_at: string;
}

export interface AvatarConfig {
  type: "generated" | "upload";
  icon?: string;
  color?: string;
  url?: string;
}

export interface UserProfile {
  id: string;
  tier: "free" | "pro";
  display_name: string | null;
  avatar_config: AvatarConfig | null;
  bio?: string;
  location?: string;
  website_url?: string;
  joined_at?: string;
}

// Re-export TOCNode if needed centrally, or keep import
export type { TOCNode };
