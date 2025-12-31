import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatEffectiveDate, useZmanim } from "./useZmanim";

/**
 * useStudyPlan Hook (v2.0)
 * Filepath: lib/hooks/useStudyPlan.ts
 * Role: Temporal Content Orchestrator.
 * PRD Alignment: Section 3.1 (Time Engine) & 2.4 (Gamification).
 * Fix: Aligned with useAuth (Canvas), synchronized table names, and added XP metadata.
 */

export interface StudyPortion {
  id: string;
  type: "DAF_YOMI" | "PARASHAH" | "MISHNAH_YOMI" | "HALAKHAH";
  ref: string;
  display_title: string;
  he_ref: string;
  xp_reward: number; // Added for PRD 2.4 Gamification
  is_completed: boolean;
}

/**
 * Internal interface for Supabase relational response
 */
interface RawScheduleRow {
  id: string;
  type: string;
  ref: string;
  display_title: string;
  he_ref: string;
  xp_value: number;
  user_progress: { id: string }[];
}

export const useStudyPlan = () => {
  const supabase = createClient();
  const { user } = useAuth();

  // Temporal Context: Shifts the study date based on sunset/zmanim logic
  const { effectiveDate, loading: zmanimLoading } = useZmanim();
  const dateStr = formatEffectiveDate(effectiveDate);

  return useQuery({
    queryKey: ["study-plan", dateStr, user?.id],
    enabled: !zmanimLoading && !!user,
    queryFn: async (): Promise<StudyPortion[]> => {
      if (!user) return [];

      // 1. Query 'daily_schedules' with a left join on user_progress
      // Filtered specifically for the current user's completion status
      const { data, error } = await supabase
        .from("daily_schedules")
        .select(
          `
          id,
          type,
          ref,
          display_title,
          he_ref,
          xp_value,
          user_progress:user_study_progress(id)
        `
        )
        .eq("study_date", dateStr)
        .filter("user_study_progress.user_id", "eq", user.id);

      if (error) {
        console.error("[StudyPlan] Temporal sync failed:", error.message);
        throw error;
      }

      // 2. Map results to the high-fidelity StudyPortion interface
      return ((data as unknown as RawScheduleRow[]) || []).map((item) => ({
        id: item.id,
        type: item.type as StudyPortion["type"],
        ref: item.ref,
        display_title: item.display_title,
        he_ref: item.he_ref,
        xp_reward: item.xp_value || 25,
        // Completion check: Presence of a record in the join table
        is_completed: item.user_progress && item.user_progress.length > 0,
      }));
    },
    // Cache for 1 hour; daily schedules are stable throughout the study session
    staleTime: 1000 * 60 * 60,
  });
};
