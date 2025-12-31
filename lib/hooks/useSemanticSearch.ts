import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * useSearch Hook (v2.3 - Unified Discovery & Type Safety)
 * Filepath: lib/hooks/useSearch.ts
 * Role: Central discovery engine combining Keyword (Catalog) and Vector (Verse) search.
 * PRD Alignment: Section 4.3 (Hybrid Search) & 5.0 (Monetization Gate).
 * Fix: Added explicit export for 'useSemanticSearch' to resolve Vercel build errors.
 */

export interface SearchResult {
  id: string;
  ref: string;
  en_title?: string;
  he_title?: string;
  hebrew_text?: string;
  english_text?: string;
  similarity?: number;
  type: "book" | "verse";
}

interface DeepSearchResult {
  id: string;
  ref: string;
  hebrew_text: string;
  english_text: string;
  similarity?: number;
}

interface CatalogBook {
  id: string;
  slug: string;
  en_title: string;
  he_title: string;
  category_path: string;
}

/**
 * Primary Hybrid Search Hook
 */
export function useSearch(query: string, categoryFilter: string = "All") {
  const supabase = createClient();
  const { isPro } = useAuth();

  return useQuery({
    queryKey: ["hybrid-search", query, categoryFilter, isPro],
    enabled: query.length >= 3,
    queryFn: async (): Promise<SearchResult[]> => {
      // 1. Catalog Search (Books)
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

      // 2. Deep Search (Verse level)
      let deepResults: SearchResult[] = [];

      if (isPro) {
        // Semantic Search via Edge Function
        const { data, error } = await supabase.functions.invoke<{
          data: DeepSearchResult[];
        }>("semantic-search", {
          body: {
            query,
            threshold: 0.4,
            limit: 15,
            category: categoryFilter !== "All" ? categoryFilter : undefined,
          },
        });

        if (!error && data) {
          deepResults = (data as unknown as DeepSearchResult[]).map((v) => ({
            ...v,
            type: "verse",
          }));
        }
      } else {
        // Fallback: Keyword Search
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

      const { data: catalogData } = await catalogDataPromise;

      const formattedCatalog: SearchResult[] = (
        (catalogData as unknown as CatalogBook[]) || []
      ).map((b) => ({
        id: b.id,
        ref: b.slug,
        en_title: b.en_title,
        he_title: b.he_title,
        type: "book",
      }));

      return [...formattedCatalog, ...deepResults];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Alias for backward compatibility with app/library/semantic-search/page.tsx
 * This resolves the Vercel build error: "Export useSemanticSearch doesn't exist"
 */
export const useSemanticSearch = useSearch;
