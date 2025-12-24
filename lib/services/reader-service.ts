import { SupabaseClient } from "@supabase/supabase-js";
import { ChapterData, Verse, AuthorMetadata } from "@/lib/types/library";
import { processText } from "@/lib/text-utils";
import { TRANSLATION_MAP, DEFAULT_TRANSLATION } from "@/lib/constants";

/**
 * ReaderService
 * Encapsulates the core logic for the TorahPro reading experience.
 * This file is purely logic and does not contain "use server".
 */

export async function getChapterContent(
  supabase: SupabaseClient,
  bookSlug: string,
  chapterNum: number,
  translationSlug: string = DEFAULT_TRANSLATION
): Promise<ChapterData | null> {
  const normalizedBook = bookSlug.toLowerCase();

  // Check if this is a custom project (UUID) or a library version
  const isCustomProject = translationSlug.length > 20;
  const versionTitle = isCustomProject
    ? TRANSLATION_MAP[DEFAULT_TRANSLATION]
    : TRANSLATION_MAP[translationSlug] || translationSlug;

  // 1. Fetch Metadata
  const { data: book } = await supabase
    .from("library_books")
    .select("*")
    .eq("slug", normalizedBook)
    .single();

  if (!book) return null;

  // 2. Fetch Hebrew and Base English layers
  const [heRes, enRes] = await Promise.all([
    supabase
      .from("text_versions")
      .select("c2_index, content")
      .eq("book_slug", normalizedBook)
      .eq("c1_index", chapterNum)
      .eq("language_code", "he")
      .order("c2_index"),
    supabase
      .from("text_versions")
      .select("c2_index, content")
      .eq("book_slug", normalizedBook)
      .eq("c1_index", chapterNum)
      .eq("language_code", "en")
      .eq("version_title", versionTitle)
      .order("c2_index"),
  ]);

  // 3. Fetch Sovereignty Layer Overrides
  const overrides: Map<number, string> = new Map();
  if (isCustomProject) {
    const { data: customData } = await supabase
      .from("user_translations")
      .select("c2, custom_content")
      .eq("version_id", translationSlug)
      .eq("book_slug", normalizedBook)
      .eq("c1", chapterNum);

    customData?.forEach((row) => {
      overrides.set(row.c2, row.custom_content);
    });
  }

  // 4. Merge Layers
  const heMap = new Map(heRes.data?.map((v) => [v.c2_index, v.content]));
  const enMap = new Map(enRes.data?.map((v) => [v.c2_index, v.content]));
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
    });
  }

  // 5. Navigation Logic
  let nextRef: string | undefined;
  let prevRef: string | undefined;

  const { count: nextInBook } = await supabase
    .from("text_versions")
    .select("*", { count: "exact", head: true })
    .eq("book_slug", normalizedBook)
    .eq("c1_index", chapterNum + 1)
    .limit(1);

  if (nextInBook && nextInBook > 0) {
    nextRef = `${book.title_en} ${chapterNum + 1}`;
  } else {
    const { data: nextBook } = await supabase
      .from("library_books")
      .select("title_en")
      .gt("order_id", book.order_id)
      .order("order_id", { ascending: true })
      .limit(1)
      .single();
    if (nextBook) nextRef = `${nextBook.title_en} 1`;
  }

  if (chapterNum > 1) {
    prevRef = `${book.title_en} ${chapterNum - 1}`;
  } else {
    const { data: prevBook } = await supabase
      .from("library_books")
      .select("title_en, slug")
      .lt("order_id", book.order_id)
      .order("order_id", { ascending: false })
      .limit(1)
      .single();

    if (prevBook) {
      const { data: lastChapter } = await supabase
        .from("text_versions")
        .select("c1_index")
        .eq("book_slug", prevBook.slug)
        .order("c1_index", { ascending: false })
        .limit(1)
        .single();
      if (lastChapter) prevRef = `${prevBook.title_en} ${lastChapter.c1_index}`;
    }
  }

  return {
    id: `${normalizedBook}.${chapterNum}`,
    ref: `${book.title_en} ${chapterNum}`,
    book: book.title_en,
    chapterNum,
    collection: book.categories?.[0] || "Tanakh",
    verses,
    nextRef,
    prevRef,
    activeTranslation: translationSlug,
  };
}

export async function getAuthorMetadata(
  supabase: SupabaseClient,
  name: string
): Promise<AuthorMetadata | null> {
  const { data } = await supabase
    .from("author_metadata")
    .select("*")
    .eq("author_name", name)
    .single();

  return data as AuthorMetadata | null;
}
