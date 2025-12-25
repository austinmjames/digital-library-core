"use server";

import { createClient } from "@/lib/supabase/server";
import { ChapterData, Verse } from "@/lib/types/library";
import { processText } from "@/lib/text-utils";
import { TRANSLATION_MAP } from "@/lib/constants";
import { revalidatePath } from "next/cache";

/**
 * Interface for raw database rows from text_versions
 */
interface TextVersionRow {
  c2_index: number;
  content: string;
}

/**
 * fetchVerseText
 * Retrieves the Hebrew and primary English text for a specific verse reference.
 */
export async function fetchVerseText(verseRef: string) {
  const supabase = await createClient();

  const parts = verseRef.trim().split(" ");
  const coords = parts[parts.length - 1].split(":");
  const bookName = parts.slice(0, -1).join(" ");
  const chapter = parseInt(coords[0], 10);
  const verse = parseInt(coords[1], 10);

  if (isNaN(chapter) || isNaN(verse)) return null;

  try {
    const { data: book } = await supabase
      .from("library_books")
      .select("slug")
      .eq("title_en", bookName)
      .single();

    if (!book) return null;

    const [heRes, enRes] = await Promise.all([
      supabase
        .from("text_versions")
        .select("content")
        .eq("book_slug", book.slug)
        .eq("c1_index", chapter)
        .eq("c2_index", verse)
        .eq("language_code", "he")
        .single(),
      supabase
        .from("text_versions")
        .select("content")
        .eq("book_slug", book.slug)
        .eq("c1_index", chapter)
        .eq("c2_index", verse)
        .eq("language_code", "en")
        .eq("is_primary", true)
        .single(),
    ]);

    return {
      he: processText(heRes.data?.content || ""),
      en: processText(enRes.data?.content || "No translation found."),
    };
  } catch (err) {
    console.error("fetchVerseText Error:", err);
    return null;
  }
}

/**
 * deleteUserCommentary
 * Permanently removes a note from the database.
 */
export async function deleteUserCommentary(noteId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  const { error } = await supabase
    .from("user_commentaries")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id); // Guard to ensure only owner can delete

  if (error) throw error;

  revalidatePath("/library");
  return { success: true };
}

/**
 * fetchChapterBySlug
 * The core engine of the reader. Merges Hebrew foundation with English layers.
 */
export async function fetchChapterBySlug(
  rawBookSlug: string,
  chapter: string,
  translationSlug: string = "jps-1985"
): Promise<ChapterData | null> {
  const supabase = await createClient();
  const chapterNum = parseInt(chapter, 10);
  const bookSlug = rawBookSlug.toLowerCase();
  if (isNaN(chapterNum)) return null;

  const isCustomProject = translationSlug.length > 20;
  const versionTitle = isCustomProject
    ? TRANSLATION_MAP["jps-1985"]
    : TRANSLATION_MAP[translationSlug] || translationSlug;

  try {
    const { data: book } = await supabase
      .from("library_books")
      .select("*")
      .eq("slug", bookSlug)
      .single();
    if (!book) return null;

    const [heRes, enRes, markersRes] = await Promise.all([
      supabase
        .from("text_versions")
        .select("c2_index, content")
        .eq("book_slug", bookSlug)
        .eq("c1_index", chapterNum)
        .eq("language_code", "he")
        .order("c2_index"),
      supabase
        .from("text_versions")
        .select("c2_index, content")
        .eq("book_slug", bookSlug)
        .eq("c1_index", chapterNum)
        .eq("language_code", "en")
        .eq("version_title", versionTitle)
        .order("c2_index"),
      supabase
        .from("library_markers")
        .select("c2_index, label, type")
        .eq("book_slug", bookSlug)
        .eq("c1_index", chapterNum),
    ]);

    const overrides: Map<number, string> = new Map();
    if (isCustomProject) {
      const { data: customData } = await supabase
        .from("user_translations")
        .select("c2, custom_content")
        .eq("version_id", translationSlug)
        .eq("book_slug", bookSlug)
        .eq("c1", chapterNum);

      customData?.forEach((row: { c2: number; custom_content: string }) =>
        overrides.set(row.c2, row.custom_content)
      );
    }

    const markerMap = new Map<number, string>();
    markersRes.data?.forEach((m) => {
      if (m.type === "parasha" || !markerMap.has(m.c2_index)) {
        markerMap.set(m.c2_index, m.label);
      }
    });

    const heMap = new Map(
      ((heRes.data as TextVersionRow[]) || []).map((v) => [
        v.c2_index,
        v.content,
      ])
    );
    const enMap = new Map(
      ((enRes.data as TextVersionRow[]) || []).map((v) => [
        v.c2_index,
        v.content,
      ])
    );

    const lastVerseNum = Math.max(
      ...Array.from(heMap.keys()),
      ...Array.from(enMap.keys()),
      0
    );

    const verses: Verse[] = [];
    for (let i = 1; i <= lastVerseNum; i++) {
      verses.push({
        id: `${book.title_en} ${chapterNum}:${i}`,
        c2_index: i,
        he: processText(heMap.get(i) || ""),
        en: processText(overrides.get(i) || enMap.get(i) || ""),
        parashaStart: markerMap.get(i),
      });
    }

    let nextRef: string | undefined;
    let prevRef: string | undefined;

    const { count: nextCount } = await supabase
      .from("text_versions")
      .select("*", { count: "exact", head: true })
      .eq("book_slug", bookSlug)
      .eq("c1_index", chapterNum + 1)
      .limit(1);

    if (nextCount && nextCount > 0) {
      nextRef = `${book.title_en} ${chapterNum + 1}`;
    } else {
      const { data: nextB } = await supabase
        .from("library_books")
        .select("title_en")
        .gt("order_id", book.order_id)
        .order("order_id", { ascending: true })
        .limit(1)
        .single();
      if (nextB) nextRef = `${nextB.title_en} 1`;
    }

    if (chapterNum > 1) {
      prevRef = `${book.title_en} ${chapterNum - 1}`;
    } else {
      const { data: prevB } = await supabase
        .from("library_books")
        .select("title_en, slug")
        .lt("order_id", book.order_id)
        .order("order_id", { ascending: false })
        .limit(1)
        .single();
      if (prevB) {
        const { data: lastC } = await supabase
          .from("text_versions")
          .select("c1_index")
          .eq("book_slug", prevB.slug)
          .order("c1_index", { ascending: false })
          .limit(1)
          .single();
        if (lastC) prevRef = `${prevB.title_en} ${lastC.c1_index}`;
      }
    }

    return {
      id: `${bookSlug}.${chapterNum}`,
      ref: `${book.title_en} ${chapterNum}`,
      book: book.title_en,
      chapterNum,
      collection: book.categories?.[0] || "Tanakh",
      verses,
      nextRef,
      prevRef,
      activeTranslation: translationSlug,
    };
  } catch (err) {
    console.error("fetchChapterBySlug Critical Failure:", err);
    return null;
  }
}

export async function fetchNextChapter(
  ref: string,
  translation: string
): Promise<ChapterData | null> {
  const parts = ref.trim().split(" ");
  const chapter = parts.pop() || "1";
  const bookSlug = parts.join("-").toLowerCase();
  return fetchChapterBySlug(bookSlug, chapter, translation);
}
