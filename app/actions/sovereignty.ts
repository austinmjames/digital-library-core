"use server";

import { createClient } from "@/lib/supabase/server";
import { UserTranslation, AuthorMetadata } from "@/lib/types/library";

/**
 * saveVerseTranslation
 * Persists user-authored translations to the Sovereignty Layer.
 */
export async function saveVerseTranslation(translation: UserTranslation) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase.from("user_translations").upsert(
    {
      version_id: translation.version_id,
      book_slug: translation.book_slug,
      c1: translation.c1,
      c2: translation.c2,
      custom_content: translation.custom_content,
      user_id: user.id,
    },
    { onConflict: "version_id,book_slug,c1,c2" }
  );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * fetchAuthorMetadata
 * Retrieves bio and era information for authors.
 */
export async function fetchAuthorMetadata(
  name: string
): Promise<AuthorMetadata | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("author_metadata")
    .select("*")
    .eq("author_name", name)
    .single();

  if (error) return null;
  return data as AuthorMetadata;
}
