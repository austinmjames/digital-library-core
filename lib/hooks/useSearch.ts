import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * useSearch Hook (v2.5 - Type Alignment)
 * Filepath: lib/hooks/useSearch.ts
 * Role: Central discovery engine combining Keyword and Vector search.
 * Fix: Standardized SearchResult interface to ensure slug and category are present.
 */

export interface SearchResult {
  id: string;
  ref: string;
  slug: string; // Mandatory for routing
  category: string; // Mandatory for UI labeling
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

export function useSearch(query: string, categoryFilter: string = "All") {
  const supabase = createClient();
  const { isPro } = useAuth();

  return useQuery({
    queryKey: ["hybrid-search", query, categoryFilter, isPro],
    enabled: query.length >= 3,
    queryFn: async (): Promise<SearchResult[]> => {
      // 1. Catalog Search
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

      const { data: catalogData } = await catalogQuery.limit(5);

      // 2. Deep Search
      let deepResults: SearchResult[] = [];

      if (isPro) {
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
          // Narrowing the response to valid SearchResults
          deepResults = (data as unknown as DeepSearchResult[]).map((v) => ({
            ...v,
            slug: v.ref,
            category: "Verse",
            type: "verse" as const,
          }));
        }
      } else {
        const { data, error } = await supabase
          .schema("library")
          .from("verses")
          .select("id, ref, hebrew_text, english_text")
          .or(`english_text.ilike.%${query}%,hebrew_text.ilike.%${query}%`)
          .limit(10);

        if (!error && data) {
          deepResults = (data as unknown as DeepSearchResult[]).map((v) => ({
            ...v,
            slug: v.ref,
            category: "Verse",
            type: "verse" as const,
          }));
        }
      }

      const formattedCatalog: SearchResult[] = (
        (catalogData as unknown as CatalogBook[]) || []
      ).map((b) => ({
        id: b.id,
        ref: b.slug,
        slug: b.slug,
        en_title: b.en_title,
        he_title: b.he_title,
        category: b.category_path,
        type: "book" as const,
      }));

      return [...formattedCatalog, ...deepResults];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export const useSemanticSearch = useSearch;
