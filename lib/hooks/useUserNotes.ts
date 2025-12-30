import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * useUserNotes Hook
 * * Role: Creator Loop Pillar.
 * Purpose: Handles fetching and saving personal notes anchored to a specific DrashRef.
 */

export interface UserNote {
  id: string;
  ref: string;
  content: string;
  is_public: boolean;
  updated_at: string;
}

export const useUserNotes = (ref: string | null) => {
  const queryClient = useQueryClient();

  // 1. Fetch existing note for this ref
  const { data: note, isLoading } = useQuery({
    queryKey: ["user-note", ref],
    enabled: !!ref,
    queryFn: async (): Promise<UserNote | null> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !ref) return null;

      const { data, error } = await supabase
        .from("user_notes")
        .select("*")
        .eq("user_id", user.id)
        .eq("ref", ref)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // 2. Upsert (Save/Update) Mutation
  const saveNote = useMutation({
    mutationFn: async (content: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !ref) throw new Error("Authentication required");

      const { data, error } = await supabase
        .from("user_notes")
        .upsert(
          {
            user_id: user.id,
            ref: ref,
            content: content,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,ref" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-note", ref] });
    },
  });

  return { note, isLoading, saveNote };
};
