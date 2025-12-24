"use server";

import { createClient } from "@/lib/supabase/server";
import { UserSchedule, LibraryMarker } from "@/lib/types/library";

/**
 * createSchedule
 * Initializes a new custom study path.
 */
export async function createSchedule(
  title: string,
  type: "calendar" | "sequence"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("user_schedules")
    .insert({ user_id: user.id, title, schedule_type: type })
    .select()
    .single();

  if (error) throw error;
  return data as UserSchedule;
}

/**
 * getUserSchedules
 */
export async function getUserSchedules() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("user_schedules")
    .select("*, items:schedule_items(*, marker:library_markers(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data as unknown as UserSchedule[]) || [];
}

/**
 * toggleScheduleItemCompletion
 */
export async function toggleScheduleItemCompletion(
  itemId: string,
  isCompleted: boolean
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("schedule_items")
    .update({ is_completed: isCompleted })
    .eq("id", itemId);

  if (error) throw error;
  return true;
}

/**
 * shareSchedule
 */
export async function shareSchedule(scheduleId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_schedules")
    .update({ is_public: true })
    .eq("id", scheduleId);

  if (error) throw error;
  return { success: true, code: scheduleId.split("-")[0].toUpperCase() };
}

/**
 * importScheduleByCode
 * Resolved: Removed 'any' from items mapping.
 */
export async function importScheduleByCode(code: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: template, error: fetchError } = await supabase
    .from("user_schedules")
    .select("*, items:schedule_items(*)")
    .ilike("id", `${code.toLowerCase()}%`)
    .eq("is_public", true)
    .single();

  if (fetchError || !template) throw new Error("Schedule not found or private");

  const { data: newSchedule, error: createError } = await supabase
    .from("user_schedules")
    .insert({
      user_id: user.id,
      title: `${template.title} (Imported)`,
      schedule_type: template.schedule_type,
    })
    .select()
    .single();

  if (createError) throw createError;

  interface TemplateItem {
    marker_id: string;
    day_number?: number;
    target_date?: string;
  }

  const itemsToInsert = template.items.map((item: TemplateItem) => ({
    schedule_id: newSchedule.id,
    marker_id: item.marker_id,
    day_number: item.day_number,
    target_date: item.target_date,
    is_completed: false,
  }));

  const { error: itemsError } = await supabase
    .from("schedule_items")
    .insert(itemsToInsert);
  if (itemsError) throw itemsError;

  return newSchedule;
}

/**
 * deleteSchedule
 */
export async function deleteSchedule(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("user_schedules").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * removeScheduleItem
 */
export async function removeScheduleItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("schedule_items").delete().eq("id", id);
  if (error) throw error;
  return true;
}

interface ScheduleItemInsert {
  schedule_id: string;
  marker_id: string;
  day_number?: number;
  target_date?: string;
}

/**
 * addMarkerToSchedule
 */
export async function addMarkerToSchedule(
  scheduleId: string,
  markerId: string,
  dayOrDate: string | number
) {
  const supabase = await createClient();
  const payload: ScheduleItemInsert = {
    schedule_id: scheduleId,
    marker_id: markerId,
  };
  if (typeof dayOrDate === "number") payload.day_number = dayOrDate;
  else payload.target_date = dayOrDate;

  const { error } = await supabase.from("schedule_items").insert(payload);
  if (error) throw error;
  return true;
}

/**
 * searchMarkers
 */
export async function searchMarkers(query: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("library_markers")
    .select("*")
    .ilike("label", `%${query}%`)
    .limit(10);
  return (data as LibraryMarker[]) || [];
}

/**
 * getParashaRedirect
 */
export async function getParashaRedirect(name: string) {
  const supabase = await createClient();
  const clean = name.replace(/^Parashat\s+/i, "").trim();
  const { data } = await supabase
    .from("library_markers")
    .select("book_slug, c1_index")
    .eq("label", clean)
    .eq("type", "parasha")
    .single();

  return data ? { book: data.book_slug, chapter: data.c1_index } : null;
}

/**
 * resolveStudyRef
 */
export async function resolveStudyRef(ref: string) {
  const match = ref.match(/^([\w\s-]+)\s+(\d+)/);
  if (!match) return null;
  return `/library/tanakh/${match[1]
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")}/${match[2]}`;
}
