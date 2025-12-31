import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * useCommentaries Hook (v2.1 - Strict Type Safety)
 * Filepath: lib/hooks/useCommentaries.ts
 * Role: Fetches canonical commentary segments linked to a specific DrashRef.
 * PRD Alignment: Section 3.2 (The Reader - Traditional Layers).
 * Fix: Replaced 'any' types with explicit FallbackVerse and RPCCommentary interfaces.
 */

export interface Commentary {
  id: string;
  source: string;
  author?: string;
  he_text: string;
  en_text?: string;
  category: string;
  type: "SYSTEM" | "COMMUNITY";
}

/**
 * Internal interfaces for Supabase data structures
 */
interface FallbackVerse {
  id: string;
  hebrew_text: string;
  english_text?: string;
  books: {
    en_title: string;
    category_path: string;
  } | null;
}

interface RPCCommentary {
  id: string;
  book_en_title?: string;
  author?: string;
  hebrew_text: string;
  english_text?: string;
  category_path: string;
  is_community: boolean;
}

export const useCommentaries = (ref: string | null) => {
  const supabase = createClient();

  return useQuery({
    queryKey: ["commentaries", ref],
    enabled: !!ref,
    queryFn: async (): Promise<Commentary[]> => {
      if (!ref) return [];

      // 1. Primary: Use optimized RPC in the library schema
      const { data, error } = await supabase
        .schema("library")
        .rpc("get_commentaries", {
          p_ref: ref,
        });

      if (error) {
        console.warn(
          "[CommentaryEngine] RPC failed, falling back to standard query:",
          error.message
        );

        // 2. Fallback: Direct query on library.verses if RPC is unavailable
        const { data: fallbackData, error: fallbackError } = await supabase
          .schema("library")
          .from("verses")
          .select(
            `
            id,
            ref,
            hebrew_text,
            english_text,
            books (
              en_title,
              category_path
            )
          `
          )
          .eq("verse_type", "commentary")
          .filter("parent_ref", "eq", ref);

        if (fallbackError) throw fallbackError;

        // Cast fallbackData to strict interface to resolve 'any'
        return ((fallbackData as unknown as FallbackVerse[]) || []).map(
          (v) => ({
            id: v.id,
            source: v.books?.en_title || "Unknown Source",
            he_text: v.hebrew_text,
            en_text: v.english_text,
            category: v.books?.category_path || "Commentary",
            type: "SYSTEM" as const,
          })
        );
      }

      // Map RPC results using strict RPCCommentary interface
      return ((data as unknown as RPCCommentary[]) || []).map((item) => ({
        id: item.id,
        source: item.book_en_title || item.author || "Source",
        author: item.author,
        he_text: item.hebrew_text,
        en_text: item.english_text,
        category: item.category_path,
        type: item.is_community ? ("COMMUNITY" as const) : ("SYSTEM" as const),
      }));
    },
    staleTime: 1000 * 60 * 15, // 15 minute cache for stable canonical data
  });
};
