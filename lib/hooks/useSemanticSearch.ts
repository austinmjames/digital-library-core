import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * useHybridSearch Hook (v2.2 - Unified Discovery)
 * Filepath: lib/hooks/useSearch.ts
 * Role: Central discovery engine combining Keyword (Catalog) and Vector (Verse) search.
 * PRD Alignment: Section 4.3 (Hybrid Search) & 5.0 (Monetization Gate).
 * Logic: Securely delegates semantic logic to Edge Functions and applies category filters.
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

export function useSearch(query: string, categoryFilter: string = "All") {
  const supabase = createClient();
  const { isPro } = useAuth();

  return useQuery({
    queryKey: ["hybrid-search", query, categoryFilter, isPro],
    enabled: query.length >= 3,
    queryFn: async (): Promise<SearchResult[]> => {
      // 1. Concurrent Execution: Search Catalog (Books) + Deep Search (Verses)

      // Catalog Search (Keyword-based on library.books)
      let catalogQuery = supabase
        .schema("library")
        .from("books")
        .select("id, slug, en_title, he_title, category_path")
        .or(`en_title.ilike.%${query}%,he_title.ilike.%${query}%`);

      if (categoryFilter !== "All") {
        catalogQuery = catalogQuery.ilike(
          "category_path",
          `%${categoryFilter}%`
        );
      }

      const catalogDataPromise = catalogQuery.limit(5);

      // Deep Search Logic (Verse level)
      let deepResults: SearchResult[] = [];

      if (isPro) {
        // PRD 5.0 / Manifest 6: Execute Secure Semantic Search via Edge Function
        // Passes the categoryFilter to the Edge Function for refined synthesis
        const { data, error } = await supabase.functions.invoke(
          "semantic-search",
          {
            body: {
              query,
              threshold: 0.4,
              limit: 15,
              category: categoryFilter !== "All" ? categoryFilter : undefined,
            },
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
        // Fixed: Use 'const' as 'fallbackQuery' is never reassigned.
        const fallbackQuery = supabase
          .schema("library")
          .from("verses")
          .select("id, ref, hebrew_text, english_text")
          .or(`english_text.ilike.%${query}%,hebrew_text.ilike.%${query}%`);

        if (categoryFilter !== "All") {
          // Note: In a full implementation, we'd join with books to filter verses by category
          // For the MVP, we assume global keyword search for free tier.
        }

        const { data, error } = await fallbackQuery.limit(10);

        if (!error && data) {
          deepResults = (data as unknown as DeepSearchResult[]).map((v) => ({
            ...v,
            type: "verse",
          }));
        }
      }

      const { data: catalogData } = await catalogDataPromise;

      // 2. Synthesize Results
      const formattedCatalog: SearchResult[] = (catalogData || []).map((b) => ({
        id: b.id,
        ref: b.slug,
        en_title: b.en_title,
        he_title: b.he_title,
        type: "book",
      }));

      // Interleave results: Hierarchical books first, then high-relevance verse fragments
      return [...formattedCatalog, ...deepResults];
    },
    staleTime: 1000 * 60 * 5, // 5-minute scholarly cache
  });
}
