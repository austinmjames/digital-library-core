"use client";

import { useCallback } from "react";
import { useAuth } from "@/components/context/auth-context";
import { installMarketplaceItem } from "@/app/actions/marketplace";

/**
 * useMarketplaceInstall
 * Orchestrates the "Install" action with an authentication guard.
 */
export function useMarketplaceInstall(
  onAuthRequired: () => void,
  onSuccess: () => void
) {
  const { user } = useAuth();

  const handleInstall = useCallback(
    async (id: string, type: "translation" | "commentary") => {
      // 1. Auth Guard
      if (!user) {
        onAuthRequired();
        return;
      }

      // 2. Execute Action
      try {
        const result = await installMarketplaceItem(id, type);
        if (result.success) {
          onSuccess();
        }
      } catch (err) {
        console.error("Install failure:", err);
      }
    },
    [user, onAuthRequired, onSuccess]
  );

  return { handleInstall };
}
