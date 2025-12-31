"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

/**
 * useAuth Hook (v2.0)
 * Filepath: lib/hooks/useAuth.ts
 * Role: Centralized auth state & profile hydration engine.
 * PRD Alignment: Section 2.2 (Identity/Onboarding) & 5.0 (Monetization).
 * Fix: Added username, onboarding_complete, and refreshProfile functionality.
 */

interface AvatarConfig {
  type: "generated" | "upload";
  icon?: string;
  color?: string;
  url?: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  username: string | null; // PRD 2.2: Public handle support
  tier: "free" | "pro";
  onboarding_complete: boolean; // PRD 2.2: Redirect logic support
  avatar_config: AvatarConfig | null;
}

export function useAuth() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * fetchProfile
   * Role: Hydrates scholarly metadata from public.users table.
   * Logic: Aligns with supabase/migrations/20240529_user_handles.sql
   */
  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select(
            "id, email, display_name, username, tier, onboarding_complete, avatar_config"
          )
          .eq("id", userId)
          .single();

        if (!error && data) {
          setProfile(data as UserProfile);
        } else if (error && error.code !== "PGRST116") {
          console.error("[useAuth] Profile retrieval failed:", error.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  /**
   * refreshProfile
   * Role: Allows manual re-syncing of profile data after settings updates.
   */
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    // 1. Initial Session Detection
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setLoading(false);
      }
    };

    initSession();

    // 2. Real-time Auth Event Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        setLoading(false);
      }

      // Handle specific event triggers if needed (e.g., logouts)
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  return {
    user,
    profile,
    refreshProfile, // Useful for Settings page updates
    isLoading: loading,
    isAuthenticated: !!user,
    // PRD 5.0 convenience helper (used by useDiscovery.ts in Canvas)
    isPro: profile?.tier === "pro",
    isOnboarded: profile?.onboarding_complete ?? false,
  };
}
