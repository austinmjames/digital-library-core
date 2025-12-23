/**
 * lib/types/library.ts
 * Core TypeScript interfaces for the Open Torah Library.
 */

export interface Verse {
  id: string;
  c2_index: number;
  he: string;
  en: string;
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
}

export interface BookMetadata {
  slug: string;
  title_en: string;
  title_he: string | null;
  categories: string[];
  order_id: number;
}

export interface Commentary {
  id: string;
  verse_ref: string;
  author_en: string;
  author_he: string;
  text_en: string;
  text_he: string;
  source_ref: string;
}

export interface UserCommentary {
  id: string;
  user_id: string;
  user_email?: string; // Hidden in UI, used for logic
  user_name?: string; // Name snapshot for attribution
  verse_ref: string;
  book_slug: string;
  chapter_num: number;
  verse_num: number;
  content: string;
  collection_name: string;
  created_at: string;
  updated_at?: string;
}

// --- Commentary Sharing & Management Types ---

export type PermissionLevel = "owner" | "collaborator" | "viewer";

export interface CollaboratorInfo {
  email: string;
  permission: PermissionLevel;
  name?: string;
}

export interface CollectionMetadata {
  name: string;
  owner_id: string;
  permission: PermissionLevel;
  owner_name?: string;
  is_collaborative?: boolean;
  share_code?: string;
  collaborators?: CollaboratorInfo[];
}

/**
 * Unified type for import handlers to ensure consistency
 * between parents and children.
 */
export type ImportAction = (code: string) => Promise<boolean>;

// --- Group Discussion Types ---

export interface DiscussionGroup {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  member_count?: number;
}

export interface DiscussionMessage {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  verse_ref: string;
  content: string;
  created_at: string;
}
