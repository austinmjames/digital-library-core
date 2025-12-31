import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * useNoteHistory Hook (v2.0)
 * Filepath: lib/hooks/useNoteHistory.ts
 * Role: Fetches historical snapshots for scholarly restoration.
 * PRD Alignment: Section 2.3 (Creator Loop) & 5.0 (Chaver Exclusivity).
 * Logic: Synchronized with Chaver tier requirements and standardized client factory.
 */

export interface NoteVersion {
  id: string;
  note_id: string;
  /**
   * TipTap JSON structure representing the state prior to the edit.
   */
  old_content: Record<string, unknown> | null;
  /**
   * TipTap JSON structure representing the state after the edit.
   */
  new_content: Record<string, unknown>;
  changed_at: string;
  editor_name: string;
  editor_id: string;
}

export function useNoteHistory(noteId: string | null) {
  const supabase = createClient();
  const { isPro, user } = useAuth();

  return useQuery<NoteVersion[], Error>({
    // Include isPro and user.id in keys to prevent cross-tier cache leakage
    queryKey: ["note-history", noteId, isPro, user?.id],
    // Only fire if we have a valid ID and the user is a Chaver (Pro Tier)
    enabled: !!noteId && !!user && isPro,
    queryFn: async (): Promise<NoteVersion[]> => {
      if (!noteId) return [];

      /**
       * Note: The 'view_note_versions' handles the join between
       * audit logs and public.users to get the 'editor_name'.
       */
      const { data, error } = await supabase
        .from("view_note_versions")
        .select("*")
        .eq("note_id", noteId)
        .order("changed_at", { ascending: false });

      if (error) {
        console.error("[HistoryEngine] Sync failed:", error.message);
        throw error;
      }

      return (data as unknown as NoteVersion[]) || [];
    },
    staleTime: 1000 * 60 * 5, // 5-minute scholarly cache
  });
}
