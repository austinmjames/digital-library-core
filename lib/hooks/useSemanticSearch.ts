import { supabase } from "@/lib/supabase/client";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

/**
 * useSemanticSearch Hook (v1.2 - Native Fetch & Strict Types)
 * Filepath: lib/hooks/useSemanticSearch.ts
 * Role: Performs a library-wide conceptual search using text embeddings.
 * Alignment: PRD Section 4.2 (Semantic Discovery).
 */

const apiKey = ""; // Provided by environment at runtime
const EMBED_MODEL = "text-embedding-004";
const EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${apiKey}`;

export interface SemanticSearchResult {
  id: string;
  ref: string;
  hebrew_text: string;
  english_text: string;
  similarity: number;
}

interface GeminiEmbedResponse {
  embedding: {
    values: number[];
  };
  error?: { message: string };
}

/**
 * Helper: Exponential backoff fetch for Gemini Embedding API
 */
async function fetchEmbeddingWithBackoff(
  text: string,
  retries = 5
): Promise<number[]> {
  let delay = 1000;
  const payload = {
    content: { parts: [{ text }] },
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(EMBED_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as GeminiEmbedResponse;

      if (response.ok && result.embedding?.values) {
        return result.embedding.values;
      }

      if (response.status === 429 || response.status >= 500) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      throw new Error(result.error?.message || "Embedding Request Failed");
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error("Maximum retries reached for Embedding request");
}

/**
 * Hook to perform library-wide semantic search.
 * Resolves: 'Cannot find module' by moving to native fetch.
 */
export const useSemanticSearch = (
  query: string,
  category: string = "All"
): UseQueryResult<SemanticSearchResult[], Error> => {
  return useQuery<SemanticSearchResult[], Error>({
    queryKey: ["semantic-search", query, category],
    enabled: query.length > 3,
    queryFn: async (): Promise<SemanticSearchResult[]> => {
      // 1. Vectorize the User Query using Gemini
      const embedding = await fetchEmbeddingWithBackoff(query);

      // 2. Query the Vector Bedrock via Supabase RPC
      const { data, error } = await supabase.rpc("semantic_search_verses", {
        query_embedding: embedding,
        p_lang: "en",
        match_threshold: 0.45,
        match_count: 20,
        p_category_filter: category,
      });

      if (error) {
        console.error("[SemanticEngine] Search error:", error.message);
        throw error;
      }

      // Explicitly cast the RPC results to the result interface
      return (data as unknown as SemanticSearchResult[]) || [];
    },
    // Cache conceptual results for 5 minutes
    staleTime: 1000 * 60 * 5,
  });
};
