import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * useUserNotes Hook (v2.1 - Strict Type Safety)
 * Filepath: lib/hooks/useUserNotes.ts
 * Role: Handles personal scholarship (Notes) anchored to the canon.
 * PRD Alignment: Section 2.3 (Knowledge Management - Creator Loop).
 * Fix: Replaced 'any' types with Record<string, unknown> for TipTap JSON support.
 */

export interface UserNote {
  id: string;
  ref: string;
  title?: string;
  content: Record<string, unknown> | string; // Support for TipTap JSON or raw text
  is_public: boolean;
  updated_at: string;
  path: string;
}

interface SaveNotePayload {
  content: Record<string, unknown> | string;
  title?: string;
  ref?: string;
  is_public?: boolean;
}

export const useUserNotes = (idOrRef: string | null) => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // 1. Fetch logic (Handles both ID-based Studio lookup and Ref-based Reader lookup)
  const { data: note, isLoading } = useQuery({
    queryKey: ["user-note", idOrRef, user?.id],
    enabled: !!idOrRef && !!user,
    queryFn: async (): Promise<UserNote | null> => {
      if (!user || !idOrRef) return null;

      // Determine if searching by UUID or DrashRef
      const isUuid = idOrRef.match(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
      );

      let query = supabase
        .from("user_notes")
        .select("*")
        .eq("user_id", user.id);

      if (isUuid) {
        query = query.eq("id", idOrRef);
      } else {
        query = query.eq("ref", idOrRef);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("[CreatorLoop] Fetch error:", error.message);
        throw error;
      }
      return data as UserNote | null;
    },
  });

  // 2. Upsert (Save/Update) Mutation
  const saveNote = useMutation({
    mutationFn: async (payload: SaveNotePayload) => {
      if (!user) throw new Error("Authentication required for scholarship.");

      const targetRef = payload.ref || note?.ref || idOrRef;
      if (!targetRef)
        throw new Error("A DrashRef is required to anchor this insight.");

      // Generate LTREE path: Convert 'Genesis.1.1' to 'Genesis_1_1' for standard ltree indexing
      const ltreePath = targetRef.replace(/\./g, "_").replace(/\s+/g, "");

      const { data, error } = await supabase
        .from("user_notes")
        .upsert(
          {
            id: note?.id, // If ID exists, Supabase performs an UPDATE
            user_id: user.id,
            ref: targetRef,
            path: ltreePath,
            title: payload.title || note?.title || "Untitled Insight",
            content: payload.content,
            is_public: payload.is_public ?? note?.is_public ?? false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (error) {
        console.error("[CreatorLoop] Persistence failed:", error.message);
        throw error;
      }
      return data as UserNote;
    },
    onSuccess: (savedData) => {
      // Invalidate both ID and Ref keys to ensure UI consistency
      queryClient.invalidateQueries({ queryKey: ["user-note", idOrRef] });
      queryClient.invalidateQueries({ queryKey: ["user-note", savedData.id] });
      queryClient.invalidateQueries({ queryKey: ["user-note", savedData.ref] });
    },
  });

  return {
    note,
    isLoading,
    saveNote,
    // Helper to check if a specific note is a new draft
    isDraft: !note?.id,
  };
};
