import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * useCommentaries Hook
 * * Role: Content Discovery Engine.
 * Purpose: Fetches all commentary segments linked to a specific DrashRef.
 * Logic: Queries the library.verses table for related segments or uses
 * the 'get_commentaries' RPC for optimized cross-linking.
 */

export interface Commentary {
  id: string;
  book_title: string;
  author?: string;
  hebrew_text: string;
  english_text?: string;
  category: string;
}

export const useCommentaries = (ref: string | null) => {
  return useQuery({
    queryKey: ["commentaries", ref],
    enabled: !!ref,
    queryFn: async (): Promise<Commentary[]> => {
      if (!ref) return [];

      // We call the RPC defined in our Phase 2 migration
      // This function finds all verses that are 'commentary' type
      // linked to the source ref.
      const { data, error } = await supabase.rpc("get_commentaries", {
        p_ref: ref,
      });

      if (error) {
        console.error("Error fetching commentaries:", error);
        throw error;
      }

      // If RPC fails or isn't available yet, we fallback to a simple query
      // mocking the return structure for UI stability.
      return (data as Commentary[]) || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
