import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatEffectiveDate, useZmanim } from "./useZmanim";

/**
 * useStudyPlan Hook
 * * Role: Temporal Content Orchestrator.
 * Purpose: Fetches specific study portions (Daf Yomi, Parashah)
 * and checks current user completion status for XP tracking.
 * * Implementation: Queries the 'library.schedules' table and joins with
 * 'library.user_progress' for the authenticated user.
 */

export interface StudyPortion {
  id: string;
  plan_name: string;
  ref: string;
  display_title: string;
  category: "Daf Yomi" | "Mishneh Torah" | "Parashah";
  is_completed: boolean;
}

export const useStudyPlan = () => {
  const { effectiveDate, loading: zmanimLoading } = useZmanim();
  const dateStr = formatEffectiveDate(effectiveDate);

  return useQuery({
    queryKey: ["study-plan", dateStr],
    enabled: !zmanimLoading,
    queryFn: async (): Promise<StudyPortion[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. Query the library schema for current portions
      // We perform a left join on user_progress to see if this user finished it
      const { data, error } = await supabase
        .schema("library")
        .from("schedules")
        .select(
          `
          *,
          user_progress:user_progress(id)
        `
        )
        .eq("date", dateStr)
        // Ensure the join only looks at the current user's progress
        .filter(
          "user_progress.user_id",
          "eq",
          user?.id || "00000000-0000-0000-0000-000000000000"
        );

      if (error) {
        console.error("[StudyPlan] Error fetching schedules:", error.message);
        throw error;
      }

      // 2. Map and normalize results
      return (data || []).map((item) => ({
        id: item.id,
        plan_name: item.plan_name,
        ref: item.ref,
        display_title: item.display_title,
        category: item.category,
        // If an entry exists in user_progress, it is completed
        is_completed: Array.isArray(item.user_progress)
          ? item.user_progress.length > 0
          : !!item.user_progress,
      }));
    },
    staleTime: 1000 * 60 * 60,
  });
};
