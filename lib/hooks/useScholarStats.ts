import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

/**
 * useScholarStats Hook (v1.0)
 * Filepath: lib/hooks/useScholarStats.ts
 * Role: Fetches synchronized gamification and activity metrics.
 * Database Source: public.dashboard_user_stats (View)
 */

export interface ScholarStats {
  user_id: string;
  display_name: string;
  tier: "free" | "pro";
  current_xp: number;
  current_level: number;
  current_streak: number;
  total_notes: number;
  shelf_count: number;
}

export function useScholarStats() {
  const supabase = createClient();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["scholar-stats", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ScholarStats> => {
      const { data, error } = await supabase
        .from("dashboard_user_stats")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error) {
        console.error(
          "[StatsEngine] Failed to fetch dashboard metrics:",
          error.message
        );
        throw error;
      }

      return data as ScholarStats;
    },
    staleTime: 1000 * 60 * 5, // 5-minute cache for dashboard performance
  });
}
