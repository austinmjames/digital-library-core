import { createClient } from "@/lib/supabase/client";
import { DrashRef, StructureType } from "@/lib/utils/drash-ref";
import { Verse } from "@/types/reader";
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";

/**
 * useInfiniteText (v2.1 - Type Synchronized)
 * Filepath: lib/hooks/useInfiniteText.ts
 * Role: Virtualized ingestion engine for scholarly manuscripts.
 * PRD Alignment: Section 3.2 (Infinite Scroll Reader).
 * Fix: Resolved TypeScript assignment error by injecting required 'book_id' and 'path' properties.
 */

export interface PageParam {
  bookSlug: string;
  sectionRef: string;
}

export interface InfinitePage {
  verses: Verse[];
  bookSlug: string;
  currentSectionRef: string;
  structureType: StructureType;
  nextBook: string | null;
  prevBook: string | null;
  nextRef: string | null;
  prevRef: string | null;
}

/**
 * Interface mapping for library.get_reader_segment return table
 */
interface ReaderSegmentRow {
  id: string;
  ref: string;
  hebrew_text: string;
  english_text: string;
  c1: number;
  c2: number;
  book_en_title: string;
  book_structure_type: string;
}

interface UseInfiniteTextProps {
  initialBookSlug: string;
  initialRef: string;
}

export function useInfiniteText({
  initialBookSlug,
  initialRef,
}: UseInfiniteTextProps): UseInfiniteQueryResult<
  InfiniteData<InfinitePage, PageParam>,
  Error
> {
  const supabase = createClient();

  // Parse the initial reference to establish the starting segment (e.g., Genesis.1)
  const { book: parsedBook, section } = DrashRef.parse(initialRef);
  const startSection = `${parsedBook}.${section || "1"}`;

  return useInfiniteQuery<
    InfinitePage,
    Error,
    InfiniteData<InfinitePage, PageParam>,
    [string, string, string],
    PageParam
  >({
    queryKey: ["reader-text", initialBookSlug, startSection],
    initialPageParam: {
      bookSlug: initialBookSlug,
      sectionRef: startSection,
    } as PageParam,
    queryFn: async ({ pageParam }): Promise<InfinitePage> => {
      const { bookSlug, sectionRef } = pageParam;

      // 1. Resolve Book Metadata (Schema: library)
      const { data: book, error: bookError } = await supabase
        .schema("library")
        .from("books")
        .select("id, structure_type, next_book_slug, prev_book_slug")
        .eq("slug", bookSlug)
        .single();

      if (bookError || !book)
        throw new Error(`Manuscript ${bookSlug} not found in the library.`);

      // 2. Fetch Verses via Segment RPC (Aligned with supabase/migrations/20240523_reader_logic.sql)
      const { data: versesData, error: versesError } = await supabase
        .schema("library")
        .rpc("get_reader_segment", {
          p_ref_prefix: sectionRef,
        });

      if (versesError) throw versesError;

      // 3. Coordinate Temporal Navigation
      const firstVerse = versesData?.[0];
      let nextRef: string | null = null;
      let prevRef: string | null = null;

      if (firstVerse) {
        const { data: navData } = await supabase
          .schema("library")
          .rpc("get_next_prev_refs", {
            p_book_id: book.id,
            p_current_c1: firstVerse.c1,
          });

        if (navData?.[0]) {
          nextRef = navData[0].next_ref || null;
          prevRef = navData[0].prev_ref || null;
        }
      }

      return {
        verses: ((versesData as ReaderSegmentRow[]) || []).map((v) => ({
          id: v.id,
          ref: v.ref,
          he: v.hebrew_text,
          en: v.english_text,
          c1: v.c1,
          c2: v.c2,
          // Fix: Explicitly providing required database-level properties for the Verse interface
          // book_id is passed from the metadata fetch; path is derived from the reference
          book_id: book.id,
          path: v.ref.replace(/\./g, "_"),
        })),
        bookSlug,
        currentSectionRef: sectionRef,
        structureType: book.structure_type as StructureType,
        nextBook: book.next_book_slug,
        prevBook: book.prev_book_slug,
        nextRef,
        prevRef,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.nextRef) {
        const p = DrashRef.parse(lastPage.nextRef);
        return {
          bookSlug: lastPage.bookSlug,
          sectionRef: `${p.book}.${p.section}`,
        };
      }
      if (lastPage.nextBook) {
        return {
          bookSlug: lastPage.nextBook,
          sectionRef: `${lastPage.nextBook}.1`,
        };
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage.prevRef) {
        const p = DrashRef.parse(firstPage.prevRef);
        return {
          bookSlug: firstPage.bookSlug,
          sectionRef: `${p.book}.${p.section}`,
        };
      }
      if (firstPage.prevBook) {
        return {
          bookSlug: firstPage.prevBook,
          sectionRef: `${firstPage.prevBook}.1`,
        };
      }
      return undefined;
    },
    // Canonical text is static; we cache it indefinitely to reduce database pressure
    staleTime: Infinity,
  });
}
