"use server";

import { createClient } from "@/lib/supabase/server";
import { ChapterData, Verse } from "@/lib/types/library";

// 1. Define a type for your DB response to avoid "any"
interface TextVersion {
  c2_index: number;
  content: string;
}

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

const TRANSLATION_MAP: Record<string, string> = {
  "jps-1985": "Tanakh: The Holy Scriptures, published by JPS",
  "jps-1917": "The Holy Scriptures: A New Translation (JPS 1917)",
  "sefaria-community": "Sefaria Community Translation",
};

export async function fetchChapterBySlug(
  bookSlug: string,
  chapter: string,
  translationSlug: string = "jps-1985"
): Promise<ChapterData | null> {
  console.log(
    `\n--- [fetchChapter] Start: ${bookSlug} ${chapter} (${translationSlug}) ---`
  );

  const supabase = await createClient();
  const chapterNum = parseInt(chapter, 10);

  if (isNaN(chapterNum)) {
    console.error(`[Reader] Invalid chapter: ${chapter}`);
    return null;
  }

  // 1. Metadata Lookup
  let bookTitle = "";
  let bookOrderId = 0;
  let bookCategories: string[] = ["Tanakh"];

  const { data: book } = await supabase
    .from("library_books")
    .select("*")
    .eq("slug", bookSlug)
    .single();

  if (book) {
    bookTitle = book.title_en;
    bookOrderId = book.order_id;
    bookCategories = book.categories || ["Tanakh"];
  } else {
    // Basic formatting fallback
    bookTitle = bookSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    console.warn(
      `[Reader] Metadata missing. Using fallback title: "${bookTitle}"`
    );
  }

  try {
    // 2. Database Fetch
    const versionTitle =
      TRANSLATION_MAP[translationSlug] || TRANSLATION_MAP["jps-1985"];

    // FIX: Replaced 'any[]' with the specific interface
    let hebrewVerses: TextVersion[] = [];
    let englishVerses: TextVersion[] = [];

    try {
      // Parallel fetch for speed
      const [heRes, enRes] = await Promise.all([
        supabase
          .from("text_versions")
          .select("c2_index, content")
          .eq("book_slug", bookSlug)
          .eq("c1_index", chapterNum)
          .eq("language_code", "he")
          .order("c2_index", { ascending: true }),
        supabase
          .from("text_versions")
          .select("c2_index, content")
          .eq("book_slug", bookSlug)
          .eq("c1_index", chapterNum)
          .eq("language_code", "en")
          .eq("version_title", versionTitle)
          .order("c2_index", { ascending: true }),
      ]);

      // Typescript will now happily accept these as TextVersion[] (assuming Supabase types align, or we cast if necessary)
      hebrewVerses = (heRes.data as unknown as TextVersion[]) || [];
      englishVerses = (enRes.data as unknown as TextVersion[]) || [];
    } catch (e) {
      console.warn("[Reader] DB Fetch Error (Tables missing?):", e);
    }

    let verses: Verse[] = [];
    const hasHebrew = hebrewVerses.length > 0;
    const hasEnglish = englishVerses.length > 0;

    // 3. API Fallback Strategy
    if (!hasHebrew && !hasEnglish) {
      console.log(`[Reader] DB Empty. Attempting Sefaria API...`);

      // Tier 1: Try specific translation
      let versionParam = "";
      if (translationSlug === "jps-1985")
        versionParam = "&ven=Tanakh:_The_Holy_Scriptures,_published_by_JPS";
      else if (translationSlug === "jps-1917")
        versionParam = "&ven=The_Holy_Scriptures:_A_New_Translation_(JPS_1917)";

      let url = `https://www.sefaria.org/api/texts/${encodeURIComponent(
        bookTitle
      )}.${chapterNum}?context=0&alts=0&pad=0${versionParam}`;
      console.log(`[Reader] Requesting: ${url}`);

      let res = await fetch(url, { next: { revalidate: 3600 } });

      // Tier 2: Generic Fallback (if specific version fails)
      if (!res.ok) {
        console.warn(
          `[Reader] Specific version failed (${res.status}). Trying generic fetch.`
        );
        url = `https://www.sefaria.org/api/texts/${encodeURIComponent(
          bookTitle
        )}.${chapterNum}?context=0&alts=0&pad=0`;
        res = await fetch(url, { next: { revalidate: 3600 } });
      }

      if (res.ok) {
        const apiData = await res.json();

        if (apiData.text || apiData.he) {
          const length = Math.max(
            Array.isArray(apiData.text) ? apiData.text.length : 0,
            Array.isArray(apiData.he) ? apiData.he.length : 0
          );

          if (length > 0) {
            verses = Array.from({ length }).map((_, i) => ({
              id: `${apiData.ref}:${i + 1}`,
              c2_index: i + 1,
              en: processText(
                Array.isArray(apiData.text) ? apiData.text[i] : ""
              ),
              he: processText(Array.isArray(apiData.he) ? apiData.he[i] : ""),
            }));
            console.log(
              `[Reader] API Success: ${verses.length} verses loaded.`
            );
          }
        }
      } else {
        console.error(
          `[Reader] All API attempts failed. Status: ${res.status}`
        );
      }
    } else {
      console.log("[Reader] Constructing from DB data.");
      const maxVerses = Math.max(
        hebrewVerses.length > 0
          ? hebrewVerses[hebrewVerses.length - 1].c2_index
          : 0,
        englishVerses.length > 0
          ? englishVerses[englishVerses.length - 1].c2_index
          : 0
      );

      const heMap = new Map(hebrewVerses.map((v) => [v.c2_index, v.content]));
      const enMap = new Map(englishVerses.map((v) => [v.c2_index, v.content]));

      for (let i = 1; i <= maxVerses; i++) {
        verses.push({
          id: `${bookTitle} ${chapterNum}:${i}`,
          c2_index: i,
          he: processText(heMap.get(i) || ""),
          en: processText(enMap.get(i) || ""),
        });
      }
    }

    if (verses.length === 0) {
      console.error("[Reader] FINAL FAILURE: No verses found from any source.");
      return null;
    }

    // 4. Navigation (Smart Runway)
    // FIX: Changed 'let' to 'const' because nextRef is never reassigned
    const nextRef = `${bookTitle} ${chapterNum + 1}`;

    // prevRef is reassigned below, so it stays 'let'
    let prevRef = chapterNum > 1 ? `${bookTitle} ${chapterNum - 1}` : undefined;

    if (bookOrderId > 0 && !prevRef) {
      const { data: prevBook } = await supabase
        .from("library_books")
        .select("title_en")
        .lt("order_id", bookOrderId)
        .order("order_id", { ascending: false })
        .limit(1)
        .single();

      if (prevBook) {
        prevRef = `${prevBook.title_en} 1`;
      }
    }

    return {
      id: `${bookSlug}.${chapterNum}`,
      ref: `${bookTitle} ${chapterNum}`,
      book: bookTitle,
      chapterNum: chapterNum,
      collection: bookCategories[0]?.toLowerCase() || "tanakh",
      verses,
      nextRef,
      prevRef,
    };
  } catch (error) {
    console.error("[Reader] Critical Action Error:", error);
    return null;
  }
}

export async function fetchNextChapter(
  ref: string,
  translationSlug: string = "jps-1985"
): Promise<ChapterData | null> {
  const parts = ref.trim().split(" ");
  const chapter = parts.pop() || "1";
  const bookSlug = parts.join("-").toLowerCase();

  return fetchChapterBySlug(bookSlug, chapter, translationSlug);
}
