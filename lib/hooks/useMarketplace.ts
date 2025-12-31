import { createClient } from "@/lib/supabase/client";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

/**
 * useMarketplace Hook (v2.0)
 * Filepath: lib/hooks/useMarketplace.ts
 * Role: Discovery engine for community-published scholarship.
 * PRD Alignment: Section 2.2 (Marketplace) & 5.0 (Tier Identity).
 * Migration Sync: Aligns with public.user_resources schema.
 */

export interface MarketplaceItem {
  id: string;
  type: "TRANSLATION" | "NOTEBOOK";
  title: string;
  description: string | null;
  author_name: string;
  author_username: string;
  author_tier: "free" | "pro"; // Added for Chaver visibility
  created_at: string;
  target_book_id?: string; // Anchor for the Infinite Text engine
}

/**
 * Internal interface for Supabase join response
 */
interface RawResourceRow {
  id: string;
  type: "TRANSLATION" | "NOTEBOOK";
  title: string;
  description: string | null;
  created_at: string;
  target_book_id: string | null;
  users: {
    display_name: string | null;
    username: string | null;
    tier: "free" | "pro";
  };
}

export function useMarketplace(
  filter: "ALL" | "TRANSLATION" | "NOTEBOOK" = "ALL",
  sortBy: "trending" | "newest" = "newest"
): UseQueryResult<MarketplaceItem[], Error> {
  const supabase = createClient();

  return useQuery<MarketplaceItem[], Error>({
    queryKey: ["marketplace", filter, sortBy],
    queryFn: async (): Promise<MarketplaceItem[]> => {
      // Logic Fix: Query 'user_resources' where is_public = true (Source of Truth)
      let query = supabase
        .from("user_resources")
        .select(
          `
          id,
          type,
          title,
          description,
          created_at,
          target_book_id,
          users (
            display_name,
            username,
            tier
          )
        `
        )
        .eq("is_public", true);

      // Apply Filters
      if (filter !== "ALL") {
        query = query.eq("type", filter);
      }

      // Apply Sorting (Trending logic currently uses 'updated_at' until view is defined)
      if (sortBy === "newest" || sortBy === "trending") {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query.limit(40);

      if (error) throw error;

      // Type-safe mapping for the scholarly marketplace
      return ((data as unknown as RawResourceRow[]) || []).map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        author_name: item.users?.display_name || "Anonymous Scholar",
        author_username: item.users?.username || "anonymous",
        author_tier: item.users?.tier || "free",
        created_at: item.created_at,
        target_book_id: item.target_book_id || undefined,
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minute marketplace cache
  });
}

/**
 * useMarketItem
 * Role: Fetches specific metadata for the Marketplace Detail View.
 */
export function useMarketItem(
  id: string
): UseQueryResult<MarketplaceItem, Error> {
  const supabase = createClient();

  return useQuery<MarketplaceItem, Error>({
    queryKey: ["marketplace-item", id],
    enabled: !!id,
    queryFn: async (): Promise<MarketplaceItem> => {
      const { data, error } = await supabase
        .from("user_resources")
        .select(
          `
          id,
          type,
          title,
          description,
          created_at,
          target_book_id,
          users (
            display_name,
            username,
            tier
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      const item = data as unknown as RawResourceRow;

      return {
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        author_name: item.users?.display_name || "Anonymous Scholar",
        author_username: item.users?.username || "anonymous",
        author_tier: item.users?.tier || "free",
        created_at: item.created_at,
        target_book_id: item.target_book_id || undefined,
      };
    },
  });
}
