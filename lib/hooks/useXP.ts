import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * useXP Hook (v2.0)
 * Filepath: lib/hooks/useXP.ts
 * Role: Gamification Controller & Reward Transaction Engine.
 * PRD Alignment: Section 2.4 (Progression & XP Tracking).
 * Fix: Added user session verification and precision query invalidation.
 */

interface XPMutationParams {
  scheduleId: string;
  xp?: number;
}

export const useXP = () => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ scheduleId, xp = 25 }: XPMutationParams) => {
      if (!user)
        throw new Error("Authentication required for scholarship rewards.");

      // RPC: complete_portion_and_reward_xp
      // Logic: Inserts into user_study_progress and increments user_levels.current_xp
      const { error } = await supabase.rpc("complete_portion_and_reward_xp", {
        p_user_id: user.id,
        p_schedule_id: scheduleId,
        p_xp_amount: xp,
      });

      if (error) {
        console.error(
          "[GamificationEngine] Transaction failed:",
          error.message
        );
        throw error;
      }

      return true;
    },
    onSuccess: () => {
      // 1. Invalidate temporal study plan (marks the card as 'Mastered')
      queryClient.invalidateQueries({ queryKey: ["study-plan"] });

      // 2. Invalidate dashboard stats (updates Flame Score and Level)
      // Standardizes key with DashboardPage.tsx and useAuth.ts patterns
      queryClient.invalidateQueries({
        queryKey: ["dashboard-user-stats", user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["user-profile", user?.id] });
    },
  });
};
