import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * useHybridSearch Hook (v2.1 - Strict Type Safety)
 * Filepath: lib/hooks/useSearch.ts
 * Role: Central discovery engine combining Keyword (Catalog) and Vector (Verse) search.
 * PRD Alignment: Section 4.3 (Hybrid Search) & 5.0 (Monetization Gate).
 * Fix: Replaced 'any' types with strict DeepSearchResult interface for deep search results.
 */

export interface SearchResult {
  id: string;
  ref: string;
  en_title?: string; // For Book results
  he_title?: string; // For Book results
  hebrew_text?: string; // For Verse results
  english_text?: string; // For Verse results
  similarity?: number;
  type: "book" | "verse";
}

/**
 * Internal interface for raw verse-level search results
 */
interface DeepSearchResult {
  id: string;
  ref: string;
  hebrew_text: string;
  english_text: string;
  similarity?: number;
}

export function useSearch(query: string, categoryFilter?: string) {
  const supabase = createClient();
  const { isPro } = useAuth();

  return useQuery({
    queryKey: ["hybrid-search", query, categoryFilter, isPro],
    enabled: query.length >= 3,
    queryFn: async (): Promise<SearchResult[]> => {
      // 1. Concurrent Execution: Search Catalog (Books) + Deep Search (Verses)

      // Catalog Search (Keyword-based on library.books)
      const catalogQuery = supabase
        .schema("library")
        .from("books")
        .select("id, slug, en_title, he_title, category_path")
        .or(`en_title.ilike.%${query}%,he_title.ilike.%${query}%`)
        .limit(5);

      // Deep Search Logic (Verse level)
      let deepResults: SearchResult[] = [];

      if (isPro) {
        // PRD 5.0 / Manifest 6: Execute Semantic Search via Edge Function
        const { data, error } = await supabase.functions.invoke(
          "semantic-search",
          {
            body: { query, threshold: 0.4, limit: 15 },
          }
        );

        if (!error && data) {
          deepResults = (data as DeepSearchResult[]).map((v) => ({
            ...v,
            type: "verse",
          }));
        }
      } else {
        // Fallback: Standard Keyword Search on library.verses
        const { data, error } = await supabase
          .schema("library")
          .from("verses")
          .select("id, ref, hebrew_text, english_text")
          .or(`english_text.ilike.%${query}%,hebrew_text.ilike.%${query}%`)
          .limit(10);

        if (!error && data) {
          deepResults = (data as unknown as DeepSearchResult[]).map((v) => ({
            ...v,
            type: "verse",
          }));
        }
      }

      const { data: catalogData } = await catalogQuery;

      // 2. Synthesize Results
      const formattedCatalog: SearchResult[] = (catalogData || []).map((b) => ({
        id: b.id,
        ref: b.slug,
        en_title: b.en_title,
        he_title: b.he_title,
        type: "book",
      }));

      // Interleave results: Books first, then high-relevance verses
      return [...formattedCatalog, ...deepResults];
    },
    staleTime: 1000 * 60 * 5, // 5-minute scholarly cache
  });
}
