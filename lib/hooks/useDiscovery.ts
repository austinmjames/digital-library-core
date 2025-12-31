import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * useDiscovery (v1.2 - Community Layer Added)
 * Filepath: lib/hooks/useDiscovery.ts
 * Role: Unified engine for scholarly discovery (Annotations + AI Insights + Community).
 * PRD Alignment: Section 3.2 (Radar Layer - Community Discovery) & 5.0 (Monetization).
 */

// --- Shared Types ---

export interface AnnotationMarker {
  id: string;
  ref: string;
  note_count: number;
  type: "personal" | "community" | "ai";
}

export interface SemanticMatch {
  id: string;
  ref: string;
  similarity: number;
  hebrew_text: string;
  english_text: string;
}

// --- Gemini API Interfaces ---

interface GeminiRequest {
  contents: { parts: { text: string }[] }[];
  systemInstruction?: { parts: { text: string }[] };
  generationConfig?: {
    responseMimeType?: "application/json" | "text/plain";
    [key: string]: unknown;
  };
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  error?: { message: string };
}

// --- AI Engine Constants ---

const apiKey = ""; // Provided by environment at runtime
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

// --- AI Helper Logic ---

async function fetchGeminiWithBackoff(
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

      if (response.ok) {
        return (await response.json()) as GeminiResponse;
      }

      if (response.status === 429 || response.status >= 500) {
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
        continue;
      }

      const errorData = (await response.json()) as GeminiResponse;
      throw new Error(errorData.error?.message || "AI Request Failed");
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }
  throw new Error("Maximum retries reached for AI request");
}

// --- Discovery Hooks ---

/**
 * useAnnotations (Personal)
 * Role: Fetches and aggregates personal annotations for the Radar.
 */
export const useAnnotations = (bookSlug: string, chapter: string) => {
  const supabase = createClient();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["annotations-radar-personal", bookSlug, chapter, user?.id],
    enabled: !!bookSlug && !!chapter && !!user,
    queryFn: async (): Promise<AnnotationMarker[]> => {
      const pathPrefix = `${bookSlug}.${chapter}`.replace(/\s+/g, "_");

      const { data, error } = await supabase
        .from("user_notes")
        .select("id, ref")
        .eq("user_id", user?.id)
        .or(`path.eq.${pathPrefix},path.<@.${pathPrefix}`);

      if (error) throw error;

      const aggregation = (data || []).reduce(
        (acc: Record<string, number>, note) => {
          acc[note.ref] = (acc[note.ref] || 0) + 1;
          return acc;
        },
        {}
      );

      return Object.entries(aggregation).map(([ref, count], i) => ({
        id: `personal_${ref}_${i}`,
        ref,
        note_count: count,
        type: "personal",
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * useCommunitySignals
 * Role: PRD 3.2 - Fetches public scholarship activity for the Discovery Radar.
 * Logic: Aggregates 'is_public' notes from other scholars.
 */
export const useCommunitySignals = (bookSlug: string, chapter: string) => {
  const supabase = createClient();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["annotations-radar-community", bookSlug, chapter],
    enabled: !!bookSlug && !!chapter,
    queryFn: async (): Promise<AnnotationMarker[]> => {
      const pathPrefix = `${bookSlug}.${chapter}`.replace(/\s+/g, "_");

      const { data, error } = await supabase
        .from("user_notes")
        .select("id, ref")
        .eq("is_public", true)
        .neq("user_id", user?.id || "") // Exclude own notes to prevent duplication
        .or(`path.eq.${pathPrefix},path.<@.${pathPrefix}`);

      if (error) throw error;

      const aggregation = (data || []).reduce(
        (acc: Record<string, number>, note) => {
          acc[note.ref] = (acc[note.ref] || 0) + 1;
          return acc;
        },
        {}
      );

      return Object.entries(aggregation).map(([ref, count], i) => ({
        id: `community_${ref}_${i}`,
        ref,
        note_count: count,
        type: "community",
      }));
    },
    staleTime: 1000 * 60 * 10, // Community density is cached longer
  });
};

/**
 * useAISuggestions
 * Role: Conceptual cross-referencing via Gemini and Supabase cache.
 * PRD 5.0: Gated for Chaver (Pro) tier.
 */
export function useAISuggestions(activeText: string, activeRef: string) {
  const supabase = createClient();
  const { profile } = useAuth();
  const isPro = profile?.tier === "pro";

  return useQuery({
    queryKey: ["ai-suggestions", activeRef, isPro],
    enabled: !!activeText && !!activeRef && isPro,
    queryFn: async (): Promise<SemanticMatch[]> => {
      const { data: cached } = await supabase
        .from("ai_insights")
        .select("insight_content")
        .eq("ref", activeRef)
        .single();

      if (cached) {
        return typeof cached.insight_content === "string"
          ? JSON.parse(cached.insight_content)
          : cached.insight_content;
      }

      const systemPrompt = `You are a DrashX AI Scholar. Identify 3 related passages from Tanakh/Talmud. 
      Return JSON array: [{id, ref, similarity, hebrew_text, english_text}]`;

      const payload: GeminiRequest = {
        contents: [
          { parts: [{ text: `Concepts for: "${activeText}" (${activeRef})` }] },
        ],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" },
      };

      const result = await fetchGeminiWithBackoff(payload);
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty AI response");

      const matches: SemanticMatch[] = JSON.parse(text);

      supabase
        .from("ai_insights")
        .upsert({
          ref: activeRef,
          prompt_hash: "v2-discovery",
          insight_content: text,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.warn("Cache sync failed");
        });

      return matches;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
}

/**
 * useNoteExcerpts
 * Role: Fetches specific content for the side panel detailed view.
 */
export const useNoteExcerpts = (ref: string) => {
  const supabase = createClient();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["note-excerpts", ref, user?.id],
    enabled: !!ref && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_notes")
        .select("id, content, updated_at")
        .eq("user_id", user?.id)
        .eq("ref", ref)
        .order("updated_at", { ascending: false });

      return (data || []).map((note) => ({
        id: note.id,
        excerpt:
          typeof note.content === "string"
            ? note.content.substring(0, 80)
            : JSON.stringify(note.content).substring(0, 80),
        updated_at: note.updated_at,
      }));
    },
  });
};

/**
 * useAIExplanation
 * Role: Bridging logic for two disparate scholarly texts.
 */
export function useAIExplanation(sourceText: string, targetText: string) {
  const { profile } = useAuth();
  const isPro = profile?.tier === "pro";

  return useQuery({
    queryKey: [
      "ai-explanation",
      sourceText.substring(0, 20),
      targetText.substring(0, 20),
      isPro,
    ],
    enabled: !!sourceText && !!targetText && isPro,
    queryFn: async (): Promise<string> => {
      const payload: GeminiRequest = {
        contents: [
          {
            parts: [
              {
                text: `Explain the link: \nText A: ${sourceText}\nText B: ${targetText}`,
              },
            ],
          },
        ],
        systemInstruction: {
          parts: [{ text: "You are a senior Beit Midrash instructor." }],
        },
      };
      const result = await fetchGeminiWithBackoff(payload);
      return (
        result.candidates?.[0]?.content?.parts?.[0]?.text || "Link unavailable."
      );
    },
    staleTime: 1000 * 60 * 60,
  });
}
