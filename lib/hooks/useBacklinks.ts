import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * useBacklinks Hook
 * * Role: Phase 3 Creator Loop - Cross-Referencing.
 * Purpose: Finds all personal notes that "reference" a specific DrashRef.
 * Logic: Performs a text search on the 'content' column of user_notes.
 */

export interface Backlink {
  id: string;
  title: string;
  updated_at: string;
  excerpt: string;
}

export const useBacklinks = (targetRef: string) => {
  return useQuery({
    queryKey: ["backlinks", targetRef],
    enabled: !!targetRef,
    queryFn: async (): Promise<Backlink[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      // We search for the targetRef string within the JSONB/HTML content
      // Note: In a production scale, we would use a join table 'note_references'
      // populated by a TipTap server-side hook, but ilike works for the Creator Loop foundation.
      const { data, error } = await supabase
        .from("user_notes")
        .select("id, title, content, updated_at")
        .eq("user_id", user.id)
        .ilike("content", `%${targetRef}%`);

      if (error) {
        console.error("[Cross-Referencing] Backlink Error:", error.message);
        throw error;
      }

      return (data || []).map((note) => ({
        id: note.id,
        title: note.title || "Untitled Insight",
        updated_at: note.updated_at,
        // Strip HTML tags for the excerpt
        excerpt: note.content.replace(/<[^>]*>/g, "").substring(0, 100) + "...",
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minute cache
  });
};
