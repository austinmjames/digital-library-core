"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Commentary,
  UserCommentary,
  CollectionMetadata,
  AuthorMetadata,
} from "@/lib/types/library";

/**
 * DB Row interfaces to satisfy strict typing and remove 'any'
 */
interface CommentaryCollectionRow {
  id: string;
  name: string;
  description: string | null;
  author_display_name: string | null;
  owner_id: string;
  is_collaborative: boolean;
  share_code: string | null;
  install_count: number | null;
  metadata?: AuthorMetadata[];
}

interface CollaboratorRow {
  is_in_library: boolean;
  permission: "owner" | "collaborator" | "viewer";
  collection: CommentaryCollectionRow;
}

/**
 * useCommentaryData
 * Updated to remove 'any' and strictly type Supabase response mappings.
 */
export function useCommentaryData(verseRef: string | null, user: User | null) {
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [userCommentaries, setUserCommentaries] = useState<UserCommentary[]>(
    []
  );
  const [collections, setCollections] = useState<CollectionMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!verseRef) return;
    setLoading(true);
    try {
      const [libRes, userRes, ownedRes, sharedRes] = await Promise.all([
        supabase
          .from("library_commentaries")
          .select("*")
          .eq("verse_ref", verseRef),
        user
          ? supabase
              .from("user_commentaries")
              .select("*")
              .eq("verse_ref", verseRef)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [] }),
        user
          ? supabase
              .from("commentary_collections")
              .select("*, metadata:author_metadata(*)")
              .eq("owner_id", user.id)
          : Promise.resolve({ data: [] }),
        user
          ? supabase
              .from("collection_collaborators")
              .select(
                "is_in_library, permission, collection:commentary_collections(*, metadata:author_metadata(*))"
              )
              .eq("user_email", user.email)
          : Promise.resolve({ data: [] }),
      ]);

      setCommentaries((libRes.data as Commentary[]) || []);
      setUserCommentaries((userRes.data as unknown as UserCommentary[]) || []);

      const ownedMapped: CollectionMetadata[] = (
        (ownedRes.data as CommentaryCollectionRow[]) || []
      ).map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description || "",
        author_display_name: c.author_display_name || "",
        owner_id: c.owner_id,
        permission: "owner" as const,
        is_collaborative: c.is_collaborative,
        share_code: c.share_code || undefined,
        is_in_library: true,
        install_count: c.install_count || 0,
        metadata: c.metadata?.[0] as AuthorMetadata,
      }));

      const sharedMapped: CollectionMetadata[] = (
        (sharedRes.data as unknown as CollaboratorRow[]) || []
      ).map((s) => ({
        id: s.collection.id,
        name: s.collection.name,
        description: s.collection.description || "",
        author_display_name: s.collection.author_display_name || "",
        owner_id: s.collection.owner_id,
        permission: s.permission,
        is_collaborative: s.collection.is_collaborative,
        share_code: s.collection.share_code || undefined,
        is_in_library: s.is_in_library,
        install_count: s.collection.install_count || 0,
        metadata: s.collection.metadata?.[0] as AuthorMetadata,
      }));

      const all = [...ownedMapped, ...sharedMapped];
      if (all.length === 0) {
        all.push({
          id: "default",
          name: "My Commentary",
          owner_id: user?.id || "anon",
          permission: "owner",
          is_in_library: true,
          is_collaborative: false,
          install_count: 0,
        });
      }
      setCollections(all);
    } finally {
      setLoading(false);
    }
  }, [verseRef, user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    commentaries,
    userCommentaries,
    collections,
    loading,
    refetch: fetchData,
  };
}
