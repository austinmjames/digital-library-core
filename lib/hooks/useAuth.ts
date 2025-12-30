"use client";

import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

/**
 * useAuth Hook (v1.1 - Type Safe)
 * Filepath: lib/hooks/useAuth.ts
 * Role: Manages session state and hydrates the DrashX user profile.
 * Alignment: PRD Section 5 (Security & Governance).
 */

interface AvatarConfig {
  type: "generated" | "upload";
  icon?: string;
  color?: string;
  url?: string;
}

interface UserProfile {
  id: string;
  tier: "free" | "pro";
  display_name: string | null;
  avatar_config: AvatarConfig | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, tier, display_name, avatar_config")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    userTier: profile?.tier ?? "free",
    isLoading: loading,
    isAuthenticated: !!user,
  };
}
