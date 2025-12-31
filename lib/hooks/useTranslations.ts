import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * useTranslations Hook (v2.1 - Strict Type Safety)
 * Filepath: lib/hooks/useTranslations.ts
 * Role: Orchestrates segment-by-segment translation projects.
 * PRD Alignment: Section 2.2 (Translation Workflow).
 * Fix: Replaced 'any' with explicit RawTranslationWorkSegment interface for RPC response.
 */

export interface TranslationSegment {
  ref: string;
  hebrew_source: string;
  english_source: string;
  translated_content: string | null;
  segment_order: number;
}

/**
 * Internal interface representing the return table from
 * public.get_translation_work_segments RPC.
 */
interface RawTranslationWorkSegment {
  ref: string;
  hebrew_source: string;
  english_source: string;
  user_translation: string | null;
  segment_order: number;
}

export const useTranslations = (resourceId: string | null) => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // 1. Fetch Hydrated Segments (Source + Translation)
  // Aligns with supabase/migrations/20240528_studio_refinement.sql
  const { data: segments, isLoading } = useQuery<TranslationSegment[], Error>({
    queryKey: ["translation-work-segments", resourceId],
    enabled: !!resourceId && !!user,
    queryFn: async (): Promise<TranslationSegment[]> => {
      if (!resourceId) return [];

      const { data, error } = await supabase.rpc(
        "get_translation_work_segments",
        {
          p_resource_id: resourceId,
        }
      );

      if (error) {
        console.error(
          "[TranslationEngine] Segment hydration failed:",
          error.message
        );
        throw error;
      }

      // Map RPC result using strict interface to resolve 'any' linting errors
      // Maps database 'user_translation' to UI 'translated_content'
      return ((data as unknown as RawTranslationWorkSegment[]) || []).map(
        (row) => ({
          ref: row.ref,
          hebrew_source: row.hebrew_source,
          english_source: row.english_source,
          translated_content: row.user_translation,
          segment_order: row.segment_order,
        })
      );
    },
    staleTime: 1000 * 60 * 5, // 5-minute scholarly cache
  });

  // 2. Save Segment Mutation
  const saveSegment = useMutation({
    mutationFn: async ({ ref, content }: { ref: string; content: string }) => {
      if (!resourceId || !user) {
        throw new Error("Active project and session required for ingestion.");
      }

      const { error } = await supabase.from("translation_segments").upsert(
        {
          resource_id: resourceId,
          ref,
          text_content: content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "resource_id,ref" }
      );

      if (error) {
        console.error("[TranslationEngine] Persist failed:", error.message);
        throw error;
      }
    },
    onSuccess: () => {
      // Refresh the work context to show success states (checkmarks)
      queryClient.invalidateQueries({
        queryKey: ["translation-work-segments", resourceId],
      });
    },
  });

  return {
    segments: segments || [],
    isLoading,
    saveSegment,
    // Progress calculation for the Studio Header
    progress:
      segments && segments.length > 0
        ? Math.round(
            (segments.filter((s) => !!s.translated_content).length /
              segments.length) *
              100
          )
        : 0,
  };
};
