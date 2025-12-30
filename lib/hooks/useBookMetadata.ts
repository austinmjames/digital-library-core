import { TOCNode } from "@/components/reader/TOCSidebar";
import { createClient } from "@/lib/supabase/client";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

/**
 * useBookMetadata Hook (v1.3 - Reconciled)
 * Filepath: lib/hooks/useBookMetadata.ts
 * Role: Provides canonical metadata, Table of Contents, and category browsing.
 * Alignment: PRD Section 3.1 (Time Engine) & Section 2.1 (Reader).
 */

export interface BookMetadata {
  id: string;
  slug: string;
  en_title: string;
  he_title: string;
  category_path: string;
  structure_type: "CHAPTERS" | "DAF" | "SIMAN";
  total_sections: number | null;
  next_book_slug: string | null;
  prev_book_slug: string | null;
  description?: string;
  toc: TOCNode[];
}

/**
 * Hook to fetch metadata for a specific book by its slug.
 * Resolves: Field naming for Reader consistency and provides TOC navigation.
 */
export function useBookMetadata(
  slug: string
): UseQueryResult<BookMetadata, Error> {
  const supabase = createClient();

  return useQuery<BookMetadata, Error>({
    queryKey: ["book-metadata", slug],
    enabled: !!slug,
    queryFn: async (): Promise<BookMetadata> => {
      const { data, error } = await supabase
        .from("books")
        .select(
          `
          id, 
          slug, 
          en_title:title_en, 
          he_title:title_he, 
          category_path, 
          structure_type, 
          total_sections,
          next_book_slug,
          prev_book_slug,
          description,
          toc:hierarchy_json
        `
        )
        .eq("slug", slug)
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error(`No metadata found for book: ${slug}`);

      return data as unknown as BookMetadata;
    },
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Secondary Hook: Fetch all books in a specific category (e.g., 'Torah')
 * Restored from v1.1 and updated for field naming consistency.
 */
export function useCategoryBooks(
  category: string
): UseQueryResult<BookMetadata[], Error> {
  const supabase = createClient();

  return useQuery<BookMetadata[], Error>({
    queryKey: ["category-books", category],
    enabled: !!category,
    queryFn: async (): Promise<BookMetadata[]> => {
      const { data, error } = await supabase
        .from("books")
        .select(
          `
          id, 
          slug, 
          en_title:title_en, 
          he_title:title_he, 
          category_path, 
          structure_type, 
          total_sections,
          next_book_slug,
          prev_book_slug,
          description,
          toc:hierarchy_json
        `
        )
        .ilike("category_path", `%${category}%`)
        .order("id", { ascending: true });

      if (error) throw error;
      return (data as unknown as BookMetadata[]) || [];
    },
    staleTime: 1000 * 60 * 60,
  });
}
