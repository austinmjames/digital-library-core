import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatEffectiveDate, useZmanim } from "./useZmanim";

/**
 * useDailyPortions Hook (v1.0)
 * Filepath: lib/hooks/useDailyPortions.ts
 * Role: Fetches temporal study obligations (Torah, Haftarah, Daf Yomi).
 * Logic: Synchronized with the 'Effective Torah Date' from useZmanim.
 */

export interface StudyPortion {
  id: string;
  type: "PARASHAH" | "HAFTARAH" | "DAF_YOMI" | "MISHNAH" | "HALAKHAH";
  label: string;
  ref: string;
  en_title: string;
  he_ref?: string;
  is_completed: boolean;
}

interface RawScheduleRow {
  id: string;
  type: string;
  ref: string;
  display_title: string;
  he_ref: string;
  user_progress: { id: string }[];
}

export function useDailyPortions() {
  const supabase = createClient();
  const { user } = useAuth();

  // 1. Get the current scholarly date (shifts at sunset)
  const { effectiveDate, loading: zmanimLoading } = useZmanim();
  const dateStr = formatEffectiveDate(effectiveDate);

  return useQuery({
    queryKey: ["daily-portions", dateStr, user?.id],
    enabled: !zmanimLoading && !!user,
    queryFn: async (): Promise<StudyPortion[]> => {
      // 2. Fetch today's portions from the schedule
      // Note: This matches the schema used in components/widgets/TodayStudy.tsx
      const { data, error } = await supabase
        .from("daily_schedules")
        .select(
          `
          id,
          type,
          ref,
          display_title,
          he_ref,
          user_progress:user_study_progress(id)
        `
        )
        .eq("study_date", dateStr);

      if (error) {
        console.error(
          "[TemporalEngine] Daily portions fetch failed:",
          error.message
        );
        throw error;
      }

      // 3. Map to consistent UI structure
      return ((data as unknown as RawScheduleRow[]) || []).map((p) => ({
        id: p.id,
        type: p.type as StudyPortion["type"],
        label:
          p.type === "DAF_YOMI"
            ? "Daf Yomi"
            : p.type === "PARASHAH"
            ? "Torah"
            : p.type,
        ref: p.ref,
        en_title: p.display_title,
        he_ref: p.he_ref,
        is_completed: p.user_progress && p.user_progress.length > 0,
      }));
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
