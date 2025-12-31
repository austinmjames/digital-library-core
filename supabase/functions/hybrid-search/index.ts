// @ts-expect-error: Deno types are resolved at runtime by Supabase
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * DrashX Semantic Search Function (v2.1 - Type Safe)
 * Filepath: supabase/functions/hybrid-search/index.ts
 * Role: Generates embeddings via OpenAI and executes Hybrid Search RPC.
 * Fix: Resolved 'Deno' name errors, replaced 'any' types, and handled unknown errors.
 */

interface OpenAIEmbeddingResponse {
  data: {
    embedding: number[];
  }[];
}

// @ts-expect-error: Deno is a global available in Supabase Edge Functions
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      // @ts-expect-error: Deno environment access
      Deno.env.get("SUPABASE_URL") ?? "",
      // @ts-expect-error: Deno environment access
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { query, threshold = 0.4, limit = 15 } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    /**
     * fetchEmbeddingWithRetry
     * Role: Obtains vector representation from OpenAI with exponential backoff.
     */
    const fetchEmbeddingWithRetry = async (
      text: string,
      retries = 5
    ): Promise<OpenAIEmbeddingResponse> => {
      let delay = 1000;
      for (let i = 0; i < retries; i++) {
        try {
          // @ts-expect-error: Deno environment access
          const apiKey = Deno.env.get("OPENAI_API_KEY");
          const response = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              input: text,
              model: "text-embedding-3-small",
            }),
          });

          if (response.ok)
            return (await response.json()) as OpenAIEmbeddingResponse;

          // Only retry on rate limits or server errors
          if (response.status !== 429 && response.status < 500) {
            const errData = await response.json();
            throw new Error(errData.error?.message || "OpenAI API Error");
          }
        } catch (err) {
          if (i === retries - 1) throw err;
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
      throw new Error("Failed to fetch embedding after maximum retries");
    };

    const embeddingData = await fetchEmbeddingWithRetry(query);
    const query_embedding = embeddingData.data[0].embedding;

    // Execute the Hybrid Search RPC defined in the Canvas
    const { data: results, error } = await supabaseClient.rpc(
      "hybrid_search_verses",
      {
        query_text: query,
        query_embedding: query_embedding,
        match_threshold: threshold,
        match_count: limit,
      }
    );

    if (error) throw error;

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An internal error occurred";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
