"use server";

import { createClient } from "@/lib/supabase/server";
import { ChapterData, Verse } from "@/lib/types/library";

/**
 * processText
 * Sanitizes Sefaria HTML and converts footnotes into interactive triggers.
 */
function processText(html: string | undefined): string {
  if (!html) return "";
  const cleaned = html.replace(/<sup[^>]*>\*<\/sup>/g, "");
  return cleaned.replace(
    /<i class="footnote">(.*?)<\/i>/g,
    (match, noteContent) => {
      const inlineNote = noteContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return `<span class="sefaria-note-wrapper"><span class="sefaria-note-trigger">*</span><span class="sefaria-note-content">${inlineNote}</span></span>`;
    }
  );
}

// Helper to map URL slugs to DB titles
// Ensure these string values EXACTLY match what is in your text_versions table 'version_title' column
const TRANSLATION_MAP: Record<string, string> = {
  "jps-1985": "Tanakh: The Holy Scriptures, published by JPS",
  "jps-1917": "The Holy Scriptures: A New Translation (JPS 1917)",
  "sefaria-community": "Sefaria Community Translation",
};

/**
 * fetchChapterBySlug
 * Queries the 'text_versions' table to construct a bilingual chapter.
 */
export async function fetchChapterBySlug(
  rawBookSlug: string,
  chapter: string,
  translationSlug: string = "jps-1985"
): Promise<ChapterData | null> {
  const supabase = await createClient();
  const chapterNum = parseInt(chapter, 10);

  // Normalize slug to lowercase to ensure DB matches (e.g. "Genesis" -> "genesis")
  const bookSlug = rawBookSlug.toLowerCase();

  console.log(
    `[fetchChapter] Request: ${bookSlug} ${chapterNum} (${translationSlug})`
  );

  if (isNaN(chapterNum)) {
    console.error(`[fetchChapter] Invalid chapter: ${chapter}`);
    return null;
  }

  try {
    // 1. Fetch Book Metadata
    const { data: book, error: bookError } = await supabase
      .from("library_books")
      .select("*")
      .eq("slug", bookSlug)
      .single();

    if (bookError || !book) {
      console.error(
        `[fetchChapter] Book metadata not found for: ${bookSlug}`,
        bookError?.message
      );
      return null;
    }

    // 2. Fetch Hebrew Text (Primary)
    const { data: hebrewVerses } = await supabase
      .from("text_versions")
      .select("c2_index, content")
      .eq("book_slug", bookSlug)
      .eq("c1_index", chapterNum)
      .eq("language_code", "he")
      .order("c2_index", { ascending: true });

    // 3. Fetch English Text (Target Translation)
    const versionTitle =
      TRANSLATION_MAP[translationSlug] || TRANSLATION_MAP["jps-1985"];
    console.log(
      `[fetchChapter] Looking for English version: "${versionTitle}"`
    );

    const { data: englishVerses } = await supabase
      .from("text_versions")
      .select("c2_index, content")
      .eq("book_slug", bookSlug)
      .eq("c1_index", chapterNum)
      .eq("language_code", "en")
      .eq("version_title", versionTitle)
      .order("c2_index", { ascending: true });

    console.log(
      `[fetchChapter] Found ${hebrewVerses?.length || 0} Hebrew verses and ${
        englishVerses?.length || 0
      } English verses.`
    );

    // If we have no text at all, return null to trigger 404
    if (
      (!hebrewVerses || hebrewVerses.length === 0) &&
      (!englishVerses || englishVerses.length === 0)
    ) {
      console.warn(
        `[fetchChapter] No text content found for ${bookSlug} ${chapterNum}.`
      );
      return null;
    }

    // 4. Merge ("Zip") the two arrays into Verse objects

    // Create a map for O(1) lookup
    const heMap = new Map(hebrewVerses?.map((v) => [v.c2_index, v.content]));
    const enMap = new Map(englishVerses?.map((v) => [v.c2_index, v.content]));

    // Determine the range of verses
    const lastVerseNum = Math.max(
      hebrewVerses?.[hebrewVerses.length - 1]?.c2_index || 0,
      englishVerses?.[englishVerses.length - 1]?.c2_index || 0
    );

    const verses: Verse[] = [];
    for (let i = 1; i <= lastVerseNum; i++) {
      verses.push({
        id: `${book.title_en} ${chapterNum}:${i}`,
        c2_index: i,
        he: processText(heMap.get(i) || ""),
        en: processText(enMap.get(i) || ""),
      });
    }

    // 5. Smart Runway Logic (Navigation)
    let nextRef: string | undefined;
    let prevRef: string | undefined;

    // Check if next chapter exists in this book
    const { count: nextChapterCount } = await supabase
      .from("text_versions")
      .select("*", { count: "exact", head: true })
      .eq("book_slug", bookSlug)
      .eq("c1_index", chapterNum + 1)
      .limit(1);

    if (nextChapterCount && nextChapterCount > 0) {
      nextRef = `${book.title_en} ${chapterNum + 1}`;
    } else {
      // Find next book
      const { data: nextBook } = await supabase
        .from("library_books")
        .select("title_en")
        .gt("order_id", book.order_id)
        .order("order_id", { ascending: true })
        .limit(1)
        .single();

      if (nextBook) nextRef = `${nextBook.title_en} 1`;
    }

    // Check previous chapter
    if (chapterNum > 1) {
      prevRef = `${book.title_en} ${chapterNum - 1}`;
    } else {
      // Find previous book
      const { data: prevBook } = await supabase
        .from("library_books")
        .select("title_en, slug")
        .lt("order_id", book.order_id)
        .order("order_id", { ascending: false })
        .limit(1)
        .single();

      if (prevBook) {
        // Find last chapter of previous book
        const { data: maxChapter } = await supabase
          .from("text_versions")
          .select("c1_index")
          .eq("book_slug", prevBook.slug)
          .order("c1_index", { ascending: false })
          .limit(1)
          .single();

        if (maxChapter) {
          prevRef = `${prevBook.title_en} ${maxChapter.c1_index}`;
        }
      }
    }

    return {
      id: `${bookSlug}.${chapterNum}`,
      ref: `${book.title_en} ${chapterNum}`,
      book: book.title_en,
      chapterNum: chapterNum,
      collection: book.categories?.[0]?.toLowerCase() || "tanakh",
      verses,
      nextRef: nextRef,
      prevRef,
    };
  } catch (error) {
    console.error("fetchChapterBySlug Error:", error);
    return null;
  }
}

/**
 * fetchNextChapter
 * Helper to resolve strings from infinite scroll to full ChapterData.
 * Updated to accept translation slug.
 */
export async function fetchNextChapter(
  ref: string,
  translation: string = "jps-1985"
): Promise<ChapterData | null> {
  const parts = ref.trim().split(" ");
  const chapter = parts.pop() || "1";
  const bookSlug = parts.join("-").toLowerCase();

  return fetchChapterBySlug(bookSlug, chapter, translation);
}
