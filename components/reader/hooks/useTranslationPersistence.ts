import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/auth-context";

/**
 * useTranslationPersistence
 * Handles account-wide persistence for the active translation layer.
 * Prioritizes URL/Prop overrides, then loads from profile.
 */
export function useTranslationPersistence(
  initialId: string,
  propOverride?: string
) {
  const { user } = useAuth();
  const supabase = createClient();
  const [activeLayerId, setActiveLayerId] = useState<string>(
    propOverride || initialId || "jps-1985"
  );

  // Load user preference on mount
  useEffect(() => {
    async function loadPreference() {
      // Don't override a specific URL-driven translation
      if (propOverride || !user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("preferred_translation")
        .eq("id", user.id)
        .single();

      if (!error && data?.preferred_translation) {
        setActiveLayerId(data.preferred_translation);
      }
    }
    loadPreference();
  }, [user, supabase, propOverride]);

  const handleSelectLayer = useCallback(
    async (id: string) => {
      setActiveLayerId(id);
      if (!user) return;

      try {
        await supabase
          .from("profiles")
          .update({ preferred_translation: id })
          .eq("id", user.id);
      } catch (err) {
        console.warn("Could not persist translation selection:", err);
      }
    },
    [user, supabase]
  );

  return { activeLayerId, handleSelectLayer };
}
