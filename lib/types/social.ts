/**
 * lib/types/social.ts
 * Types for Marketplace, Authors, Collections, and Discussions.
 */

export interface MarketplaceItem {
  id: string;
  // Updated to include 'book' for Library exploration
  type: "translation" | "commentary" | "book";
  name: string;
  description?: string;
  author_name?: string;
  install_count: number;
  is_system?: boolean;
  is_installed?: boolean;
  last_updated?: string;
}

export interface MarketplaceVersion extends MarketplaceItem {
  type: "translation";
  category_id?: string;
  segment_count?: number;
}

export interface TranslationProject {
  id: string;
  title: string;
  name: string;
  description?: string;
  author_display_name?: string;
  status: string;
  install_count: number;
  created_at: string;
}

export interface AuthorMetadata {
  id?: string;
  author_name: string;
  era?: string;
  died?: string;
  description_en?: string;
  description_he?: string;
}

export interface CollectionMetadata {
  id: string;
  name: string;
  description?: string;
  author_display_name?: string;
  owner_id: string;
  permission: "owner" | "collaborator" | "viewer";
  is_collaborative: boolean;
  share_code?: string;
  is_in_library: boolean;
  install_count: number;
  metadata?: AuthorMetadata;
  collaborators?: { email: string }[];
}

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
  user_name: string;
  verse_ref: string;
  content: string;
  created_at: string;
}

export type PermissionLevel = "owner" | "collaborator" | "viewer";
