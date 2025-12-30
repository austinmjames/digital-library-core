import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * useAISuggestions & useAIExplanation Hooks (v2.2 - Lint Fix)
 * Filepath: lib/hooks/useAISuggestions.ts
 * Role: Advanced conceptual discovery and lateral linking across the library.
 * Alignment: PRD Section 4.2 (Semantic Discovery).
 */

const apiKey = ""; // Provided by environment at runtime
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

interface SemanticMatch {
  id: string;
  ref: string;
  similarity: number;
  hebrew_text: string;
  english_text: string;
}

interface GeminiRequest {
  contents: { parts: { text: string }[] }[];
  systemInstruction?: { parts: { text: string }[] };
  generationConfig?: Record<string, unknown>;
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  error?: { message: string };
}

/**
 * Helper: Exponential backoff fetch for Gemini API
 */
async function fetchWithBackoff(
  payload: GeminiRequest,
  retries = 5
): Promise<GeminiResponse> {
  let delay = 1000;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) return (await response.json()) as GeminiResponse;

      // If rate limited or server error, wait and retry
      if (response.status === 429 || response.status >= 500) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      const errorData = (await response.json()) as GeminiResponse;
      throw new Error(errorData.error?.message || "AI Request Failed");
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error("Maximum retries reached for AI request");
}

/**
 * Hook to fetch conceptual suggestions based on text context
 */
export function useAISuggestions(activeText: string, activeRef: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["ai-suggestions", activeRef],
    enabled: !!activeText && !!activeRef,
    queryFn: async (): Promise<SemanticMatch[]> => {
      // 1. Check Supabase Cache first
      const { data: cached } = await supabase
        .from("ai_insights")
        .select("insight_content")
        .eq("ref", activeRef)
        .single();

      if (cached) {
        try {
          return JSON.parse(cached.insight_content) as SemanticMatch[];
        } catch {
          // Fixed: Removed unused '_err' identifier to resolve linting error
          console.error("Cache corruption for:", activeRef);
        }
      }

      // 2. If not cached, call Gemini with Semantic discovery prompt
      const systemPrompt = `You are a DrashX AI Scholar. Your task is to identify 3 semantically related passages 
      from the Jewish canon (Tanakh, Talmud, Halakhah) that share deep conceptual themes with the provided text.
      Return the results as a JSON array of objects with keys: id, ref, similarity (0.0-1.0), hebrew_text, english_text.`;

      const userQuery = `Find related concepts for the passage: "${activeText}" (Reference: ${activeRef})`;

      const payload: GeminiRequest = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING" },
                ref: { type: "STRING" },
                similarity: { type: "NUMBER" },
                hebrew_text: { type: "STRING" },
                english_text: { type: "STRING" },
              },
              required: [
                "id",
                "ref",
                "similarity",
                "hebrew_text",
                "english_text",
              ],
            },
          },
        },
      };

      const result = await fetchWithBackoff(payload);
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error("AI returned empty synthesis.");
      const matches: SemanticMatch[] = JSON.parse(text);

      // 3. Populate Cache asynchronously (don't block return)
      supabase
        .from("ai_insights")
        .upsert({
          ref: activeRef,
          prompt_hash: "v2-discovery",
          insight_content: text,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.warn("Failed to cache AI insight:", error.message);
        });

      return matches;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hour cache
  });
}

/**
 * Hook to explain the conceptual connection between two passages
 */
export function useAIExplanation(sourceText: string, targetText: string) {
  return useQuery({
    queryKey: [
      "ai-explanation",
      sourceText.substring(0, 20),
      targetText.substring(0, 20),
    ],
    enabled: !!sourceText && !!targetText,
    queryFn: async (): Promise<string> => {
      const userQuery = `Explain the deep conceptual connection between these two texts in one concise paragraph (max 3 sentences).
      Text A: ${sourceText}
      Text B: ${targetText}`;

      const payload: GeminiRequest = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: {
          parts: [
            {
              text: "You are a senior Beit Midrash instructor specializing in conceptual synthesis.",
            },
          ],
        },
      };

      const result = await fetchWithBackoff(payload);
      return (
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Synthesis connection unavailable."
      );
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}
