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
 * Internal interfaces for raw Supabase response shapes.
 * This resolves the "Unexpected any" errors by explicitly typing DB results.
 */
interface DBAuthorMetadata {
  author_name: string;
  era?: string;
  died?: string;
  description_en?: string;
}

interface DBOwnedCollection {
  id: string;
  name: string;
  owner_id: string;
  is_collaborative: boolean;
  share_code?: string;
  metadata?: DBAuthorMetadata[];
}

interface DBSharedCollection {
  is_in_library: boolean;
  permission: "collaborator" | "viewer";
  collection: DBOwnedCollection;
}

/**
 * useCommentaryData
 * Strictly typed hook for managing commentary state and metadata mapping.
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

      // Mapping owned projects with explicit types
      const ownedMapped: CollectionMetadata[] = (
        (ownedRes.data as unknown as DBOwnedCollection[]) || []
      ).map((c) => ({
        id: c.id,
        name: c.name,
        owner_id: c.owner_id,
        permission: "owner" as const,
        is_collaborative: c.is_collaborative,
        share_code: c.share_code,
        is_in_library: true,
        metadata: c.metadata?.[0]
          ? ({
              author_name: c.metadata[0].author_name,
              era: c.metadata[0].era,
              died: c.metadata[0].died,
              description_en: c.metadata[0].description_en,
            } as AuthorMetadata)
          : undefined,
      }));

      // Mapping shared projects with explicit types
      const sharedMapped: CollectionMetadata[] = (
        (sharedRes.data as unknown as DBSharedCollection[]) || []
      ).map((s) => ({
        id: s.collection.id,
        name: s.collection.name,
        owner_id: s.collection.owner_id,
        permission: s.permission,
        is_collaborative: s.collection.is_collaborative,
        share_code: s.collection.share_code,
        is_in_library: s.is_in_library,
        metadata: s.collection.metadata?.[0]
          ? ({
              author_name: s.collection.metadata[0].author_name,
              era: s.collection.metadata[0].era,
              died: s.collection.metadata[0].died,
              description_en: s.collection.metadata[0].description_en,
            } as AuthorMetadata)
          : undefined,
      }));

      const all = [...ownedMapped, ...sharedMapped];

      // Default fallback
      if (all.length === 0) {
        all.push({
          id: "default",
          name: "My Commentary",
          owner_id: user?.id || "anon",
          permission: "owner",
          is_in_library: true,
          is_collaborative: false,
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
