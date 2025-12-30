import { Verse } from "@/components/reader/ReaderEngine";
import { createClient } from "@/lib/supabase/client";
import { DrashRef, StructureType } from "@/lib/utils/drash-ref";
import {
  InfiniteData,
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";

/**
 * useInfiniteText Hook (v3.5 - Strict Type Resolution)
 * Filepath: lib/hooks/useInfiniteText.ts
 * Role: Manages paginated fetching with correct InfiniteData signatures and Inter-Book transitions.
 * Alignment: PRD Section 2.1 (The Reader Engine - Performance).
 */

export interface PageParam {
  bookSlug: string;
  sectionRef: string; // e.g., 'Genesis.1'
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
 * Explicit interface for the get_reader_context RPC return type.
 */
interface ReaderContextRow {
  verse_id: string;
  verse_ref: string;
  hebrew_text: string;
  english_text: string;
  c1: number;
  c2: number;
  book_title_en: string;
  category_path: string;
}

interface UseInfiniteTextProps {
  initialBookSlug: string;
  initialRef: string;
}

/**
 * Hook to manage infinite scrolling of text.
 * The return type explicitly includes PageParam in InfiniteData to resolve type mismatches.
 */
export function useInfiniteText({
  initialBookSlug,
  initialRef,
}: UseInfiniteTextProps): UseInfiniteQueryResult<
  InfiniteData<InfinitePage, PageParam>,
  Error
> {
  const supabase = createClient();

  // Normalize initialRef to Section level using DrashRef utility
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
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<
      [string, string, string],
      PageParam
    >): Promise<InfinitePage> => {
      const { bookSlug, sectionRef } = pageParam;

      // 1. Resolve Book Meta (with next/prev book pointers for transitions)
      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("id, structure_type, next_book_slug, prev_book_slug")
        .eq("slug", bookSlug)
        .single();

      if (bookError || !book) throw new Error(`Meta error for ${bookSlug}`);

      // 2. Fetch the verses for the current section using the high-performance RPC
      const { data: versesData, error: versesError } = await supabase.rpc(
        "get_reader_context",
        {
          p_ref_prefix: sectionRef,
        }
      );

      if (versesError) throw versesError;

      // 3. Discover neighboring refs for intra-book pagination
      const firstVerse = versesData?.[0];
      let nextRef: string | null = null;
      let prevRef: string | null = null;

      if (firstVerse) {
        const { data: navData } = await supabase.rpc("get_next_prev_refs", {
          p_book_id: book.id,
          p_current_c1: firstVerse.c1,
        });

        if (navData?.[0]) {
          nextRef = navData[0].next_ref || null;
          prevRef = navData[0].prev_ref || null;
        }
      }

      return {
        verses: ((versesData as ReaderContextRow[]) || []).map(
          (v: ReaderContextRow) => ({
            id: v.verse_id,
            ref: v.verse_ref,
            hebrew_text: v.hebrew_text,
            english_text: v.english_text,
            c1: v.c1,
            c2: v.c2,
            global_index: 0,
            has_notes: false,
          })
        ),
        bookSlug,
        currentSectionRef: sectionRef,
        structureType: book.structure_type as StructureType,
        nextBook: book.next_book_slug,
        prevBook: book.prev_book_slug,
        nextRef,
        prevRef,
      };
    },
    getNextPageParam: (lastPage: InfinitePage): PageParam | undefined => {
      // Priority 1: Next section in the same book
      if (lastPage.nextRef) {
        const nextParts = DrashRef.parse(lastPage.nextRef);
        return {
          bookSlug: lastPage.bookSlug,
          sectionRef: `${nextParts.book}.${nextParts.section}`,
        };
      }

      // Priority 2: Transition to next book in canon
      if (lastPage.nextBook) {
        return {
          bookSlug: lastPage.nextBook,
          sectionRef: `${lastPage.nextBook}.1`,
        };
      }

      return undefined;
    },
    getPreviousPageParam: (firstPage: InfinitePage): PageParam | undefined => {
      // Priority 1: Previous section in the same book
      if (firstPage.prevRef) {
        const prevParts = DrashRef.parse(firstPage.prevRef);
        return {
          bookSlug: firstPage.bookSlug,
          sectionRef: `${prevParts.book}.${prevParts.section}`,
        };
      }

      // Priority 2: Transition to previous book
      if (firstPage.prevBook) {
        return {
          bookSlug: firstPage.prevBook,
          sectionRef: `${firstPage.prevBook}.1`,
        };
      }

      return undefined;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
    maxPages: 5,
  });
}
