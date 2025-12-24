"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * getUserProfile
 * Retrieves user settings, including saved location for Zmanim.
 */
export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, location_zip, location_name")
    .eq("id", user.id)
    .single();

  return data;
}

/**
 * updateUserLocation
 * Updates the user's saved location for precise Shabbat times.
 */
export async function updateUserLocation(zip: string, name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("profiles")
    .update({
      location_zip: zip,
      location_name: name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw error;
  return { success: true };
}
