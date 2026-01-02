/**
 * DrashX Global Types (v1.9)
 * Filepath: types/user.ts
 * Role: The absolute source of truth for Scholar identity and Gamification metrics.
 */

export type UserTier = "free" | "pro";

/**
 * AvatarConfig
 * Bridge interface connecting Database fields (icon/color) with UI components.
 */
export interface AvatarConfig {
  type: "generated" | "image";
  // Database storage names
  icon?: string;
  color?: string;
  // Storage URLs
  url?: string;
  // Component requirement compatibility
  value?: string;
  bg?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  display_name: string;
  username?: string;
  bio?: string;
  social_links: Record<string, string>;
  tier: UserTier;
  onboarding_complete: boolean;
  is_admin: boolean;
  avatar_config: AvatarConfig;
  avatar_url?: string;

  // Gamification (Scholar Stats)
  // Mandatory for Dashboard logic in page.tsx
  current_xp: number;
  current_level: number;
  current_streak: number;
  contribution_score: number;

  // Metadata
  last_activity_at: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xp_value: number;
  icon_slug?: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievements: Achievement;
}
