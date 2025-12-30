/**
 * Embedding Pipeline (v1.1 - Native Fetch)
 * Filepath: scripts/generate-embeddings.ts
 * Role: Phase 5 Bedrock - Data Population.
 * Purpose: Iterates through library.verses, generates semantic embeddings, and updates the DB.
 * Fixes:
 * 1. Removed @google/generative-ai dependency in favor of native fetch to resolve module errors.
 * 2. Un-commented processEmbeddings() to resolve unused function warning.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role bypasses RLS for bulk ETL
);

const API_KEY = process.env.GEMINI_API_KEY || "";
const EMBED_MODEL = "text-embedding-004";
const EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${API_KEY}`;

interface GeminiEmbedResponse {
  embedding: {
    values: number[];
  };
  error?: { message: string };
}

/**
 * Helper: Generates embedding using native fetch with exponential backoff.
 */
async function getEmbedding(text: string, retries = 5): Promise<number[]> {
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

      // Handle rate limits (429) or server errors (500+)
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
  throw new Error(`Max retries reached for text: ${text.substring(0, 20)}...`);
}

async function processEmbeddings() {
  console.log("--- 🧠 Starting Embedding Pipeline ---");

  // 1. Fetch verses that lack embeddings
  const { data: verses, error } = await supabase
    .from("verses")
    .select("id, english_text, hebrew_text")
    .is("embedding_en", null)
    .limit(50);

  if (error) {
    console.error("[EmbeddingEngine] Fetch error:", error.message);
    return;
  }

  if (!verses || verses.length === 0) {
    console.log("[EmbeddingEngine] All verses fully vectorized.");
    return;
  }

  console.log(
    `[EmbeddingEngine] Processing batch of ${verses.length} verses...`
  );

  for (const verse of verses) {
    try {
      // 2. Prioritize English text for embedding (PRD Section 4.2)
      const textToEmbed = verse.english_text || verse.hebrew_text;
      if (!textToEmbed) continue;

      const embedding = await getEmbedding(textToEmbed);

      // 3. Persist to the vector column
      const { error: updateError } = await supabase
        .from("verses")
        .update({
          embedding_en: embedding,
          updated_at: new Date().toISOString(),
        })
        .eq("id", verse.id);

      if (updateError) throw updateError;

      console.log(`[EmbeddingEngine] Success: ${verse.id}`);
    } catch (e) {
      console.error(
        `[EmbeddingEngine] Failed verse ${verse.id}:`,
        e instanceof Error ? e.message : e
      );
    }
  }

  // 4. Recursive tail call for next batch
  processEmbeddings();
}

// Start the pipeline
processEmbeddings();
