import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * useRefChat Hook (v2.1)
 * Filepath: lib/hooks/useRefChat.ts
 * Role: Realtime threaded discussions anchored to specific verses.
 * PRD Alignment: Section 2.2 (Social Identity) & 3.2 (Communal Layer).
 * Standard: Aligned with Canvas 'createClient' and 'useAuth' patterns.
 */

export interface GroupPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  ref: string;
  user_name: string;
  user_tier: "free" | "pro"; // PRD 5.0: For Chaver badge rendering
  role: "admin" | "teacher" | "moderator" | "student";
  avatar_url?: string;
}

/**
 * Internal interface for Supabase relational selection
 */
interface RawPostRow {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  ref: string;
  users: {
    username: string | null;
    tier: "free" | "pro";
    avatar_url: string | null;
  };
  group_members: {
    role: string;
  }[];
}

export const useRefChat = (groupId: string | null, ref: string | null) => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  // 1. Initial Data Load (Communal Insights)
  const { data: posts, isLoading } = useQuery({
    queryKey: ["ref-chat", groupId, ref],
    enabled: !!groupId && !!ref,
    queryFn: async (): Promise<GroupPost[]> => {
      const { data, error } = await supabase
        .from("group_posts")
        .select(
          `
          id, user_id, content, created_at, ref,
          users (username, tier, avatar_url),
          group_members!inner (role)
        `
        )
        .eq("group_id", groupId)
        .eq("ref", ref)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[SocialFabric] Sync failed:", error.message);
        throw error;
      }

      return ((data as unknown as RawPostRow[]) || []).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        content: p.content,
        created_at: p.created_at,
        ref: p.ref,
        user_name: p.users?.username || "Anonymous Scholar",
        user_tier: p.users?.tier || "free",
        avatar_url: p.users?.avatar_url || undefined,
        role: (p.group_members?.[0]?.role as GroupPost["role"]) || "student",
      }));
    },
  });

  // 2. Realtime Pulse (PRD Phase 4)
  useEffect(() => {
    if (!groupId || !ref) return;

    const channel = supabase
      .channel(`chat:${groupId}:${ref}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_posts",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          // If the new post matches our specific verse anchor, invalidate query
          if (payload.new.ref === ref) {
            queryClient.invalidateQueries({
              queryKey: ["ref-chat", groupId, ref],
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, ref, queryClient, supabase]);

  // 3. Insight Submission
  const sendInsight = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Join the Beit Midrash to share logic.");

      const { error } = await supabase.from("group_posts").insert({
        group_id: groupId,
        user_id: user.id,
        ref,
        content,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      // Optimistic refresh for immediate feedback
      queryClient.invalidateQueries({ queryKey: ["ref-chat", groupId, ref] });
    },
  });

  return {
    posts: posts || [],
    isLoading,
    sendInsight,
    isEmpty: !isLoading && (!posts || posts.length === 0),
    userTier: profile?.tier || "free",
  };
};
