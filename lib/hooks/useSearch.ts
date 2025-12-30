import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * useSearch Hook
 * * Role: Discovery Engine - Search Controller.
 * Purpose: Performs full-text and fuzzy search across books and categories.
 * Logic: Leverages Supabase's text search capabilities.
 */

export interface SearchResult {
  id: string;
  en_title: string;
  he_title: string;
  slug: string;
  category: string;
  author?: string;
  type: "book" | "category";
}

export const useSearch = (query: string, categoryFilter?: string) => {
  return useQuery({
    queryKey: ["search", query, categoryFilter],
    enabled: query.length >= 2,
    queryFn: async (): Promise<SearchResult[]> => {
      let supabaseQuery = supabase
        .from("books")
        .select("id, en_title, he_title, slug, category, author")
        // We use the 'or' filter to search both English and Hebrew titles
        .or(`en_title.ilike.%${query}%,he_title.ilike.%${query}%`);

      if (categoryFilter && categoryFilter !== "All") {
        supabaseQuery = supabaseQuery.eq("category", categoryFilter);
      }

      const { data, error } = await supabaseQuery.limit(20);

      if (error) {
        console.error("[Search] Error:", error.message);
        throw error;
      }

      return (data || []).map((item) => ({
        ...item,
        type: "book",
      }));
    },
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
  });
};
