"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { MarketplaceItem } from "@/lib/types/library";

/**
 * fetchMarketplaceItems
 * Retrieves ranked items and checks installation status.
 */
export async function fetchMarketplaceItems(
  type: "translation" | "commentary" | "book"
): Promise<MarketplaceItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const table =
    type === "translation"
      ? "translation_versions"
      : type === "book"
      ? "library_books"
      : "commentary_collections";

  const linkTable =
    type === "translation"
      ? "collection_collaborators"
      : "commentary_library_links";
  const linkIdCol = type === "translation" ? "collection_id" : "commentary_id";

  const { data, error } = await supabase
    .from(table)
    .select(
      "id, title, description, author_display_name, is_system, install_count, status"
    )
    .eq("status", "public")
    .order("is_system", { ascending: false })
    .order("install_count", { ascending: false });

  if (error) throw error;

  const installedIds = new Set<string>();
  if (user) {
    const { data: installs } = await supabase
      .from(linkTable)
      .select(linkIdCol)
      .eq("user_id", user.id);

    if (installs) {
      installs.forEach((i: Record<string, string>) =>
        installedIds.add(i[linkIdCol])
      );
    }
  }

  // Map to strictly typed MarketplaceItem
  const results: MarketplaceItem[] = (data || []).map((item: any) => ({
    id: item.id || item.slug,
    type,
    name: item.title || item.name,
    description: item.description,
    author_name: item.author_display_name,
    install_count: Number(item.install_count || 0),
    is_system: item.is_system,
    is_installed: installedIds.has(item.id || item.slug),
  }));

  return results;
}

/**
 * installMarketplaceItem
 */
export async function installMarketplaceItem(
  id: string,
  type: "translation" | "commentary" | "book"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Auth required" };

  const table =
    type === "translation"
      ? "collection_collaborators"
      : "commentary_library_links";
  const idColumn = type === "translation" ? "collection_id" : "commentary_id";

  const { error: linkError } = await supabase.from(table).upsert({
    [idColumn]: id,
    user_email: user.email,
    user_id: user.id,
    permission: "viewer",
    is_in_library: true,
  });

  if (linkError) return { success: false, error: linkError.message };

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
 * uninstallMarketplaceItem
 * Logic to remove a library link.
 */
export async function uninstallMarketplaceItem(
  id: string,
  type: "translation" | "commentary" | "book"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Auth required" };

  const table =
    type === "translation"
      ? "collection_collaborators"
      : "commentary_library_links";
  const idColumn = type === "translation" ? "collection_id" : "commentary_id";

  const { error } = await supabase
    .from(table)
    .delete()
    .eq("user_id", user.id)
    .eq(idColumn, id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/library");
  return { success: true };
}

export async function reportContent(id: string, reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase
    .from("content_reports")
    .insert({ content_id: id, reporter_id: user?.id, reason });
  return { success: true };
}
