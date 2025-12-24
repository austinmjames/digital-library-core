/**
 * lib/types/library.ts
 * Core TypeScript interfaces for the Open Torah Library.
 */

export interface Verse {
  id: string; // e.g., "Genesis 1:1"
  c2_index: number; // e.g., 1
  he: string; // Hebrew HTML
  en: string; // English HTML
  parashaStart?: string; // Title of the Parashah if it starts at this verse
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

export interface LibraryMarker {
  id: string;
  book_slug: string;
  c1_index: number;
  c2_index: number;
  label: string;
  type: "parasha" | "aliyah" | "daf" | "haftarah" | "custom";
  user_id?: string;
}

export interface UserSchedule {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  schedule_type: "calendar" | "sequence";
  created_at: string;
  items?: ScheduleItem[];
}

export interface ScheduleItem {
  id: string;
  schedule_id: string;
  day_number?: number;
  target_date?: string;
  marker_id: string;
  is_completed: boolean;
  marker?: LibraryMarker;
}

export interface AuthorMetadata {
  id?: string;
  author_name: string;
  era?: string;
  died?: string;
  description_en?: string;
  description_he?: string;
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

// --- ADDED DISCUSSION TYPES ---
export interface DiscussionGroup {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at?: string;
}

export interface DiscussionMessage {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string; // Cached display name for performance
  verse_ref: string;
  content: string;
  created_at: string;
}
// -----------------------------

export interface CollectionMetadata {
  id: string;
  name: string;
  owner_id: string;
  permission: "owner" | "collaborator" | "viewer";
  is_collaborative: boolean;
  share_code?: string;
  is_in_library: boolean;
  metadata?: AuthorMetadata;
  collaborators?: { email: string }[];
}

export interface Commentary {
  id: string;
  author_en: string;
  author_he: string;
  text_en?: string;
  text_he?: string;
  verse_ref: string;
  source_ref: string;
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

export type CommentaryGroup = "Personal" | "Classic" | "Community";
export type ImportAction = (code: string) => Promise<boolean>;
export type PermissionLevel = "owner" | "collaborator" | "viewer";
