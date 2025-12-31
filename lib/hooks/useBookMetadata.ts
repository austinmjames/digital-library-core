import { TOCNode } from "@/components/reader/TOCSidebar";
import { createClient } from "@/lib/supabase/client";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

/**
 * useBookMetadata Hook (v1.4 - Schema Aligned)
 * Filepath: lib/hooks/useBookMetadata.ts
 * Role: Provides canonical metadata, Table of Contents, and category browsing.
 * PRD Alignment: Section 2.1 (Reader Engine) & 3.1 (Library Discovery).
 * Fix: Added .schema("library"), aligned column names, and synchronized structure enums.
 */

export interface BookMetadata {
  id: string;
  slug: string;
  en_title: string;
  he_title: string;
  category_path: string;
  // Aligned with ReaderPage.tsx logic and library.text_structure_type enum
  structure_type: "CHAPTER_VERSE" | "DAF_LINE" | "SIMAN_SEIF";
  total_sections: number | null;
  next_book_slug: string | null;
  prev_book_slug: string | null;
  description?: string;
  toc: TOCNode[];
}

/**
 * Hook to fetch metadata for a specific book by its slug.
 */
export function useBookMetadata(
  slug: string
): UseQueryResult<BookMetadata, Error> {
  const supabase = createClient();

  return useQuery<BookMetadata, Error>({
    queryKey: ["book-metadata", slug],
    enabled: !!slug,
    queryFn: async (): Promise<BookMetadata> => {
      // Logic Fix: Specify 'library' schema and use correct column names
      const { data, error } = await supabase
        .schema("library")
        .from("books")
        .select(
          `
          id, 
          slug, 
          en_title, 
          he_title, 
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
      if (!data) throw new Error(`Manuscript not found in archives: ${slug}`);

      return data as unknown as BookMetadata;
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache for canonical data
  });
}

/**
 * Secondary Hook: Fetch all books in a specific category (e.g., 'Torah')
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
        .schema("library")
        .from("books")
        .select(
          `
          id, 
          slug, 
          en_title, 
          he_title, 
          category_path, 
          structure_type, 
          total_sections,
          next_book_slug,
          prev_book_slug,
          description
        `
        )
        // Performance Fix: Matches the hierarchy using the category_path
        .ilike("category_path", `%${category}%`)
        .order("id", { ascending: true });

      if (error) throw error;
      return (data as unknown as BookMetadata[]) || [];
    },
    staleTime: 1000 * 60 * 60,
  });
}
