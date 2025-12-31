import { createClient } from "@/lib/supabase/server";

/**
 * DrashX Server Data: getCurrentUser (v2.1)
 * Filepath: lib/data/user.ts
 * Role: Fetches authenticated user and synchronized public profile.
 * PRD Alignment: Section 2.2 (Identity) & 5.0 (Monetization).
 * Fix: Added Legacy Bridge properties (is_admin, contribution_score) to resolve type mismatch errors.
 */

export async function getCurrentUser() {
  const supabase = await createClient();

  // 1. Get Auth Session from Supabase Auth
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  // 2. Fetch Public Profile from 'public.users'
  // Sync: Aligns with supabase/migrations/20240520_auth_identity_bridge.sql
  const { data: profile } = await supabase
    .from("users")
    .select("display_name, tier, avatar_config, onboarding_complete")
    .eq("id", authUser.id)
    .single();

  // 3. Return merged object for SSR Hydration
  return {
    id: authUser.id,
    email: authUser.email,

    // --- New Schema Properties ---
    tier: profile?.tier || "free",
    onboarding_complete: profile?.onboarding_complete || false,
    avatar_config: profile?.avatar_config || {
      type: "generated",
      icon: "book",
      color: "zinc-500",
    },
    display_name:
      profile?.display_name ||
      authUser.user_metadata?.display_name ||
      "Scholar",
    avatar_url: authUser.user_metadata?.avatar_url || null,

    // --- Legacy Bridge (Resolves TypeScript mismatch) ---
    // Maps 'pro' tier to 'is_admin' to satisfy legacy component requirements
    is_admin: profile?.tier === "pro",
    contribution_score: 0, // Placeholder for deprecated field
  };
}
