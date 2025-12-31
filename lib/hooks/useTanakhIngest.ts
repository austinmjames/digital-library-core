import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Verse } from "@/types/reader";
import { useQuery } from "@tanstack/react-query";

/**
 * useTanakhIngest Hook (v1.1 - Robust Ingestion)
 * Filepath: lib/hooks/useTanakhIngest.ts
 * Role: Unified ingestion engine for canonical segments with 5-level filtering.
 * PRD Alignment: Section 2.1 (The Reader Engine) & 3.2 (The 5 Layers of Logic).
 * Fix: Improved path resolution and added strict typing for database responses.
 */

export type IngestPerspective =
  | "canonical"
  | "commentary"
  | "personal"
  | "community"
  | "ai";

interface IngestFilters {
  division?: string; // Level 1: 'Torah', 'Tanakh' (Root Category)
  manuscript: string; // Level 2: 'Genesis', 'Psalms' (Book Slug)
  scope?: string; // Level 3: '1', '24a' (Primary Section)
  atom?: string; // Level 4: '1', '2' (Specific Segment)
  perspective?: IngestPerspective; // Level 5: Metadata perspective
}

/**
 * IngestedSegment
 * Represents a single canonical unit hydrated with activity signals.
 */
export interface IngestedSegment {
  verse: Verse;
  metadata: {
    has_notes: boolean;
    has_ai: boolean;
    has_commentaries: boolean;
    is_mastered: boolean;
  };
}

/**
 * Internal interface for Supabase relational query results
 */
interface RawVerseIngest {
  id: string;
  ref: string;
  path: string;
  hebrew_text: string;
  english_text: string;
  c1: number;
  c2: number;
  book: {
    id: string;
    en_title: string;
    structure_type: string;
  } | null;
}

export const useTanakhIngest = (filters: IngestFilters) => {
  const supabase = createClient();
  const { user } = useAuth();

  const { division, manuscript, scope, atom, perspective } = filters;

  return useQuery({
    queryKey: [
      "tanakh-ingest",
      division,
      manuscript,
      scope,
      atom,
      perspective,
      user?.id,
    ],
    enabled: !!manuscript,
    queryFn: async (): Promise<IngestedSegment[]> => {
      // 1. Resolve the LTREE search path
      // Logic: Joins segments with dots, ensuring underscores replace spaces for ltree compatibility.
      const pathSegments = [division, manuscript, scope, atom].filter(Boolean);
      const ltreePath = pathSegments.join(".").replace(/\s+/g, "_");

      // 2. Base Retrieval (Library Schema)
      // Retrieves the text and book metadata concurrently
      const query = supabase
        .schema("library")
        .from("verses")
        .select(
          `
          id, ref, path, hebrew_text, english_text, c1, c2,
          book:books(id, en_title, structure_type)
        `
        )
        // LTREE logic: Fetch exact matches or all children of the scope
        .or(`path.eq.${ltreePath},path.<@.${ltreePath}`)
        .order("c1", { ascending: true })
        .order("c2", { ascending: true });

      const { data: verses, error: verseError } = await query;

      if (verseError) {
        console.error("[IngestEngine] Retrieval failed:", verseError.message);
        throw verseError;
      }

      if (!verses || verses.length === 0) return [];

      const refs = verses.map((v) => v.ref);

      // 3. Level 5: Perspective Synthesis (Parallel Layer Check)
      // Checks for scholarly activity signals attached to these segments
      const [notesData, aiData, progressData] = await Promise.all([
        // Personal/Community Notes signal
        user
          ? supabase.from("user_notes").select("ref").in("ref", refs)
          : Promise.resolve({ data: [] }),
        // Cached AI Insights signal
        supabase.from("ai_insights").select("ref").in("ref", refs),
        // Personal Mastery signal
        user
          ? supabase
              .from("user_study_progress")
              .select("ref")
              .eq("user_id", user.id)
              .in("ref", refs)
          : Promise.resolve({ data: [] }),
      ]);

      // 4. Ingestion Result Hydration
      return (verses as unknown as RawVerseIngest[]).map((v) => {
        const hasNotes = !!notesData.data?.some((n) => n.ref === v.ref);
        const hasAI = !!aiData.data?.some((a) => a.ref === v.ref);
        const isMastered = !!progressData.data?.some((p) => p.ref === v.ref);

        return {
          verse: {
            id: v.id,
            ref: v.ref,
            he: v.hebrew_text,
            en: v.english_text,
            book_id: v.book?.id || "",
            path: v.path,
            c1: v.c1,
            c2: v.c2,
          },
          metadata: {
            has_notes: hasNotes,
            has_ai: hasAI,
            has_commentaries: true, // System-level commentaries are always discoverable for Tanakh
            is_mastered: isMastered,
          },
        };
      });
    },
    // Manuscripts are static; we cache the ingest for 10 minutes to support active study sessions
    staleTime: 1000 * 60 * 10,
  });
};
