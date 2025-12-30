import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * useTranslations Hook (PRD Aligned)
 * Filepath: lib/hooks/useTranslations.ts
 * Role: Connects 'user_resources' (Project) to 'translation_segments' (Data).
 * Alignment: PRD Section 2.2 (Marketplace & Translation workflow).
 */

export interface TranslationSegment {
  id?: string;
  resource_id: string;
  ref: string;
  translated_content: string;
}

export interface TranslationProject {
  id: string;
  title: string;
}

export const useTranslations = (bookSlug: string | null) => {
  const queryClient = useQueryClient();

  // 1. Fetch or Initialize the Translation Project for this Book
  const { data: project } = useQuery<TranslationProject | null, Error>({
    queryKey: ["translation-project", bookSlug],
    enabled: !!bookSlug,
    queryFn: async (): Promise<TranslationProject | null> => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error(
          "[TranslationEngine] Auth verification failed:",
          authError.message
        );
        return null;
      }

      if (!user) return null;

      const { data, error: projectError } = await supabase
        .from("user_resources")
        .select("id, title")
        .eq("user_id", user.id)
        .eq("type", "TRANSLATION")
        .ilike("title", `%${bookSlug}%`)
        .limit(1)
        .maybeSingle();

      // Resolved: 'projectError' is explicitly checked and logged
      if (projectError) {
        console.error(
          "[TranslationEngine] Project lookup failed:",
          projectError.message
        );
        throw projectError;
      }

      return data as TranslationProject | null;
    },
  });

  // 2. Fetch Segments if Project Exists
  const { data: segments, isLoading } = useQuery<TranslationSegment[], Error>({
    queryKey: ["translation-segments", project?.id],
    enabled: !!project?.id,
    queryFn: async (): Promise<TranslationSegment[]> => {
      if (!project?.id) return [];

      const { data, error: segmentsError } = await supabase
        .from("translation_segments")
        .select("*")
        .eq("resource_id", project.id);

      // Resolved: 'segmentsError' is explicitly checked and logged
      if (segmentsError) {
        console.error(
          "[TranslationEngine] Segment fetch failed:",
          segmentsError.message
        );
        throw segmentsError;
      }

      return (data as TranslationSegment[]) || [];
    },
  });

  // 3. Save Segment Mutation
  const saveSegment = useMutation({
    mutationFn: async ({ ref, content }: { ref: string; content: string }) => {
      if (!project?.id) {
        throw new Error(
          "No active translation project found to anchor this segment."
        );
      }

      const { error: saveError } = await supabase
        .from("translation_segments")
        .upsert(
          {
            resource_id: project.id,
            ref,
            translated_content: content,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "resource_id,ref" }
        );

      // Resolved: 'saveError' is explicitly checked and handled
      if (saveError) {
        console.error(
          "[TranslationEngine] Segment save failed:",
          saveError.message
        );
        throw saveError;
      }
    },
    onSuccess: () => {
      if (project?.id) {
        queryClient.invalidateQueries({
          queryKey: ["translation-segments", project.id],
        });
      }
    },
  });

  return {
    segments: segments || [],
    projectId: project?.id,
    isLoading,
    saveSegment,
  };
};
