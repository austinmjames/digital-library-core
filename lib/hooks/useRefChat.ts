import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * useRefChat Hook (v2.0)
 * Filepath: lib/hooks/useRefChat.ts
 * Role: Phase 4 Social Fabric - Realtime Sync.
 * Purpose: Handles live threaded discussions anchored to specific verses.
 */

export interface GroupPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  ref: string;
  user_name?: string;
  role?: "admin" | "teacher" | "moderator" | "student";
  avatar_url?: string;
}

export const useRefChat = (groupId: string | null, ref: string | null) => {
  const queryClient = useQueryClient();

  // 1. Initial Data Load
  const { data: posts, isLoading } = useQuery({
    queryKey: ["ref-chat", groupId, ref],
    enabled: !!groupId && !!ref,
    queryFn: async (): Promise<GroupPost[]> => {
      const { data, error } = await supabase
        .from("group_posts")
        .select(
          `
          *,
          users (username, avatar_url),
          group_members!inner (role)
        `
        )
        .eq("group_id", groupId)
        .eq("ref", ref)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[SocialFabric] Fetch failed:", error.message);
        throw error;
      }

      return (data || []).map((p) => ({
        ...p,
        user_name: p.users?.username || "Scholar",
        avatar_url: p.users?.avatar_url,
        role: p.group_members?.[0]?.role,
      }));
    },
  });

  // 2. Supabase Realtime Subscription
  useEffect(() => {
    if (!groupId || !ref) return;

    // Listen for new posts in this specific group thread
    const channel = supabase
      .channel(`beit-midrash:${groupId}:${ref}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_posts",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          // If the post matches our verse context, invalidate the cache
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
  }, [groupId, ref, queryClient]);

  // 3. Post Creation Mutation
  const sendInsight = useMutation({
    mutationFn: async (content: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required for communal study.");

      const { error } = await supabase.from("group_posts").insert({
        group_id: groupId,
        user_id: user.id,
        ref,
        content,
      });

      if (error) throw error;
    },
  });

  return {
    posts: posts || [],
    isLoading,
    sendInsight,
    isEmpty: !isLoading && (!posts || posts.length === 0),
  };
};
