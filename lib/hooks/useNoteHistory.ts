import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * useNoteHistory Hook
 * Role: Phase 3 Creator Loop - Data Reliability.
 * Purpose: Fetches all historical snapshots for a specific note.
 */

export interface NoteVersion {
  id: string;
  note_id: string;
  /**
   * TipTap JSON structure for the previous state.
   * Resolves: Unexpected any.
   */
  old_content: Record<string, unknown>;
  /**
   * TipTap JSON structure for the new state.
   * Resolves: Unexpected any.
   */
  new_content: Record<string, unknown>;
  changed_at: string;
  editor_name: string;
}

export const useNoteHistory = (noteId: string | null) => {
  return useQuery<NoteVersion[], Error>({
    queryKey: ["note-history", noteId],
    enabled: !!noteId,
    queryFn: async (): Promise<NoteVersion[]> => {
      const { data, error } = await supabase
        .from("view_note_versions")
        .select("*")
        .eq("note_id", noteId)
        .order("changed_at", { ascending: false });

      if (error) {
        console.error("[HistoryEngine] Fetch error:", error.message);
        throw error;
      }

      // Explicitly cast the Supabase return to NoteVersion[] to resolve any implicit 'any'
      return (data as unknown as NoteVersion[]) || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minute cache
  });
};
