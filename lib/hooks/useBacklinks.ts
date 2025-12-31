import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * useBacklinks Hook (v2.1 - Strict Type Safety)
 * Filepath: lib/hooks/useBacklinks.ts
 * Role: Identifies personal scholarship that references a specific segment.
 * PRD Alignment: Section 2.3 (Creator Loop - Cross-Referencing).
 * Fix: Replaced 'any' with specific NoteContent interface.
 */

export interface Backlink {
  id: string;
  title: string;
  updated_at: string;
  excerpt: string;
}

/**
 * Interface for user_notes JSONB content structure
 */
interface NoteContent {
  title?: string;
  text?: string;
  [key: string]: unknown; // Support for varied TipTap JSON schemas
}

export const useBacklinks = (targetRef: string) => {
  const supabase = createClient();
  // Consume user state from the Canvas orchestrator to avoid hydration race conditions
  const { user } = useAuth();

  return useQuery({
    queryKey: ["backlinks", targetRef, user?.id],
    enabled: !!targetRef && !!user,
    queryFn: async (): Promise<Backlink[]> => {
      // Logic Fix: Querying JSONB content via text cast to resolve PostgREST limitations
      // Search for the DrashRef pattern within the serialized JSON structure
      const { data, error } = await supabase
        .from("user_notes")
        .select("id, content, updated_at")
        .eq("user_id", user?.id)
        // Cast JSONB to text for the substring search (Manifest Performance Directive)
        .filter("content::text", "ilike", `%${targetRef}%`);

      if (error) {
        console.error(
          "[Cross-Referencing] Backlink retrieval failed:",
          error.message
        );
        throw error;
      }

      return (data || []).map((note) => {
        // Explicitly type the content for safe property access
        const content = note.content as NoteContent | null;

        // Safe extraction of text from TipTap JSON or raw string
        const rawContent =
          typeof note.content === "string"
            ? note.content
            : JSON.stringify(note.content);

        // Strip HTML tags and metadata to provide a clean scholarly excerpt
        const cleanText = rawContent
          .replace(/<[^>]*>/g, "")
          .replace(/\\"/g, '"')
          .substring(0, 120);

        return {
          id: note.id,
          // Extract title using type-safe interface, otherwise fallback to Date
          title:
            content?.title ||
            `Insight ${new Date(note.updated_at).toLocaleDateString()}`,
          updated_at: note.updated_at,
          excerpt: cleanText + "...",
        };
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minute scholarly cache
  });
};
