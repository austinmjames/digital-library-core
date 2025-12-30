import { supabase } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * useXP Hook
 * Filepath: lib/hooks/useXP.ts
 * Role: Gamification Controller.
 * Purpose: Triggers the XP reward transaction when a portion is completed.
 * Alignment: PRD Section 2.4 (Gamification & Progression).
 */

interface XPMutationParams {
  scheduleId: string;
  xp?: number;
}

export const useXP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scheduleId, xp = 50 }: XPMutationParams) => {
      const { error } = await supabase.rpc("complete_portion_and_reward_xp", {
        p_schedule_id: scheduleId,
        p_xp_amount: xp,
      });

      if (error) {
        console.error(
          "[GamificationEngine] XP Transaction failed:",
          error.message
        );
        throw error;
      }

      return true;
    },
    onSuccess: () => {
      // Resolved: Removed unused '_' and 'variables' parameters to satisfy linter.
      // Invalidate both study plan and user stats to reflect the new XP/Streak.
      queryClient.invalidateQueries({ queryKey: ["study-plan"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
    },
  });
};
