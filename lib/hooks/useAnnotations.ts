import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * useAnnotations Hook
 * * Role: Phase 3 Creator Loop - Spatial Discovery.
 * Purpose: Fetches all personal notes for a specific book/section to
 * populate the "Ink Markers" in the reader margin.
 */

export interface AnnotationMarker {
  id: string;
  ref: string;
  excerpt: string;
  updated_at: string;
}

export const useAnnotations = (bookSlug: string, section: string) => {
  return useQuery({
    queryKey: ["annotations", bookSlug, section],
    enabled: !!bookSlug && !!section,
    queryFn: async (): Promise<AnnotationMarker[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      // We query by a prefix match on the 'ref' field
      // e.g., finding all notes where ref starts with 'Genesis.1'
      const refPrefix = `${bookSlug}.${section}`;

      const { data, error } = await supabase
        .from("user_notes")
        .select("id, ref, content, updated_at")
        .eq("user_id", user.id)
        .like("ref", `${refPrefix}%`);

      if (error) {
        console.error("[AnnotationEngine] Fetch error:", error.message);
        throw error;
      }

      return (data || []).map((note) => {
        // Extract a plain-text excerpt from TipTap JSON or raw string
        const contentStr =
          typeof note.content === "string"
            ? note.content
            : JSON.stringify(note.content);

        return {
          id: note.id,
          ref: note.ref,
          excerpt: contentStr.substring(0, 60) + "...",
          updated_at: note.updated_at,
        };
      });
    },
    staleTime: 1000 * 60 * 2, // 2 minute cache for active editing sessions
  });
};
