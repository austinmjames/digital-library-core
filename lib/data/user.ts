import { createClient } from "@/lib/supabase/server";
import { UserProfile } from "@/types/user"; // Import global type

/**
 * DrashX Server Data: getCurrentUser (v2.6)
 * Filepath: lib/data/user.ts
 * Role: Server-side fetcher for the Root Layout.
 * Fixes: Resolved type shadowing/local declaration conflict.
 */

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: profile, error } = await supabase
    .from("users")
    .select(
      `
      display_name, 
      username, 
      bio,
      social_links,
      tier, 
      avatar_config, 
      onboarding_complete,
      current_xp,
      current_level,
      current_streak,
      last_activity_at,
      created_at
    `
    )
    .eq("id", authUser.id)
    .single();

  if (error || !profile) return null;

  return {
    id: authUser.id,
    email: authUser.email ?? undefined,
    avatar_url: authUser.user_metadata?.avatar_url || undefined,
    username: profile.username ?? undefined,
    display_name:
      profile.display_name || authUser.user_metadata?.display_name || "Scholar",
    bio: profile.bio ?? undefined,
    social_links: profile.social_links || {},
    tier: (profile.tier as "free" | "pro") || "free",
    onboarding_complete: !!profile.onboarding_complete,
    avatar_config: profile.avatar_config || {
      type: "generated",
      icon: "book",
      color: "zinc-500",
    },
    current_xp: profile.current_xp || 0,
    current_level: profile.current_level || 0,
    current_streak: profile.current_streak || 0,
    contribution_score: 0,
    last_activity_at: profile.last_activity_at,
    created_at: profile.created_at,
    is_admin: profile.tier === "pro",
  };
}
