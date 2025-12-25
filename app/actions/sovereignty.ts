"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { UserTranslation, AuthorMetadata } from "@/lib/types/library";

/**
 * saveVerseTranslation
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
 * updateProjectMetadata
 * Allows authors to edit the 160-char description and public author name.
 */
export async function updateProjectMetadata(
  id: string,
  type: "translation" | "commentary",
  updates: { name?: string; description?: string; author_name?: string }
) {
  const supabase = await createClient();
  const table =
    type === "translation" ? "translation_versions" : "commentary_collections";

  const { error } = await supabase
    .from(table)
    .update({
      title: updates.name,
      description: updates.description,
      author_display_name: updates.author_name,
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/library");
  return { success: true };
}

/**
 * fetchAuthorMetadata
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
