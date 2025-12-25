"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { UserTranslation, AuthorMetadata } from "@/lib/types/library";

/**
 * deleteCommentaryBook
 * If a user deletes a commentary book they created:
 * 1. It is removed from the commentary_collections table (effective Unpublish).
 * 2. All user_commentaries linked to it are removed.
 */
export async function deleteCommentaryBook(bookId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // 1. Ownership Guard
  const { data: book, error: fetchError } = await supabase
    .from("commentary_collections")
    .select("owner_id, name")
    .eq("id", bookId)
    .single();

  if (fetchError || !book) return { success: false, error: "Book not found" };
  if (book.owner_id !== user.id) return { success: false, error: "Forbidden" };

  // 2. Atomic Cleanup
  const { error: deleteError } = await supabase
    .from("commentary_collections")
    .delete()
    .eq("id", bookId);

  if (deleteError) return { success: false, error: deleteError.message };

  revalidatePath("/library");
  return { success: true };
}

/**
 * deleteTranslationProject
 * Safely removes a interpretation layer from the database and marketplace.
 */
export async function deleteTranslationProject(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: project } = await supabase
    .from("translation_versions")
    .select("owner_id")
    .eq("id", projectId)
    .single();

  if (!project || project.owner_id !== user.id)
    return { success: false, error: "Forbidden" };

  const { error } = await supabase
    .from("translation_versions")
    .delete()
    .eq("id", projectId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/library");
  return { success: true };
}

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
