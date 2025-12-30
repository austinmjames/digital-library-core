import { createClient } from "@/lib/supabase/server";

/**
 * DrashX Server Data: Get Current User
 * Role: Fetches the authenticated user and their public profile metadata (is_admin, etc).
 * Usage: Used in Server Components (Layouts/Pages) to hydration client components.
 */

export async function getCurrentUser() {
  const supabase = await createClient();

  // 1. Get Auth Session
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  // 2. Fetch Public Profile (for is_admin and gamification stats)
  const { data: profile } = await supabase
    .from("users")
    .select("is_admin, contribution_score, avatar_config, display_name")
    .eq("id", authUser.id)
    .single();

  // 3. Return merged object matching the SideNavProps interface
  return {
    id: authUser.id,
    email: authUser.email,
    is_admin: profile?.is_admin || false, // Default to false if missing
    contribution_score: profile?.contribution_score || 0,
    avatar_url: authUser.user_metadata?.avatar_url || null, // OAuth avatars usually live here
    display_name: profile?.display_name || authUser.user_metadata?.display_name,
  };
}
