"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { MarketplaceItem } from "@/lib/types/library";

/**
 * fetchMarketplaceItems
 * Retrieves ranked translations or commentaries based strictly on popularity (installs).
 */
export async function fetchMarketplaceItems(
  type: "translation" | "commentary"
): Promise<MarketplaceItem[]> {
  const supabase = await createClient();
  const table =
    type === "translation" ? "translation_versions" : "commentary_collections";

  const { data, error } = await supabase
    .from(table)
    .select(
      `
      id, 
      title, 
      description, 
      author_display_name,
      is_system,
      install_count
    `
    )
    .eq("status", "public")
    .order("is_system", { ascending: false })
    .order("install_count", { ascending: false });

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id,
    type,
    name: item.title,
    description: item.description,
    author_name: item.author_display_name,
    install_count: item.install_count || 0,
    is_system: item.is_system,
  }));
}

/**
 * installMarketplaceItem
 * Connects a community project to the user's personal library.
 */
export async function installMarketplaceItem(
  id: string,
  type: "translation" | "commentary"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Auth required");

  const table =
    type === "translation"
      ? "collection_collaborators"
      : "commentary_library_links";
  const idColumn = type === "translation" ? "collection_id" : "commentary_id";

  const { error } = await supabase.from(table).upsert({
    [idColumn]: id,
    user_email: user.email,
    user_id: user.id,
    permission: "viewer",
    is_in_library: true,
  });

  if (error) throw error;

  // Use the RPC function to increment the global popularity count
  const sourceTable =
    type === "translation" ? "translation_versions" : "commentary_collections";
  await supabase.rpc("increment_install_count", {
    row_id: id,
    table_name: sourceTable,
  });

  revalidatePath("/library");
  return { success: true };
}

/**
 * reportContent
 * Moderation trigger for inappropriate community content.
 */
export async function reportContent(id: string, reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("content_reports").insert({
    content_id: id,
    reporter_id: user?.id,
    reason,
  });

  return { success: true };
}
