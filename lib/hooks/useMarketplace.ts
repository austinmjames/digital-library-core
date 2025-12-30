import { createClient } from "@/lib/supabase/client";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

/**
 * useMarketplace Hook (v1.1 - Strict Types & Mapping Fix)
 * Filepath: lib/hooks/useMarketplace.ts
 * Role: Fetches public translations and notebooks for the community market.
 * Alignment: PRD Section 2.2 (Library & Marketplace).
 */

export interface MarketplaceItem {
  id: string;
  type: "TRANSLATION" | "NOTEBOOK";
  title: string;
  description: string | null;
  author_name: string;
  author_username: string;
  adds_count: number;
  created_at: string;
  ref_anchor?: string;
}

/**
 * Interface representing the raw join response from Supabase.
 * Resolves the array-vs-object ambiguity in relational selects.
 */
interface RawMarketplaceRow {
  id: string;
  type: "TRANSLATION" | "NOTEBOOK";
  title: string;
  description: string | null;
  adds_count: number;
  created_at: string;
  ref_anchor?: string;
  users:
    | {
        display_name: string | null;
        username: string;
      }
    | {
        display_name: string | null;
        username: string;
      }[];
}

export function useMarketplace(
  filter: "ALL" | "TRANSLATION" | "NOTEBOOK" = "ALL",
  sortBy: "trending" | "newest" = "trending"
): UseQueryResult<MarketplaceItem[], Error> {
  const supabase = createClient();

  return useQuery<MarketplaceItem[], Error>({
    queryKey: ["marketplace", filter, sortBy],
    queryFn: async (): Promise<MarketplaceItem[]> => {
      let query = supabase.from("marketplace_items").select(`
          id,
          type,
          title,
          description,
          adds_count,
          created_at,
          ref_anchor,
          users (
            display_name,
            username
          )
        `);

      if (filter !== "ALL") {
        query = query.eq("type", filter);
      }

      if (sortBy === "trending") {
        query = query.order("adds_count", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Type-safe mapping to resolve 'username' property access on potential arrays
      return ((data as unknown as RawMarketplaceRow[]) || []).map((item) => {
        // Resolve the join: Supabase might return an array or object depending on schema config
        const userNode = Array.isArray(item.users) ? item.users[0] : item.users;

        return {
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description,
          author_name: userNode?.display_name || "Anonymous Scholar",
          author_username: userNode?.username || "anonymous",
          adds_count: item.adds_count,
          created_at: item.created_at,
          ref_anchor: item.ref_anchor,
        };
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minute cache for market data
  });
}

/**
 * Secondary Hook: Fetch single marketplace item details
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
        .from("marketplace_items")
        .select(
          `
          id,
          type,
          title,
          description,
          adds_count,
          created_at,
          ref_anchor,
          users (
            display_name,
            username
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      const item = data as unknown as RawMarketplaceRow;
      const userNode = Array.isArray(item.users) ? item.users[0] : item.users;

      return {
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        author_name: userNode?.display_name || "Anonymous Scholar",
        author_username: userNode?.username || "anonymous",
        adds_count: item.adds_count,
        created_at: item.created_at,
        ref_anchor: item.ref_anchor,
      };
    },
  });
}
