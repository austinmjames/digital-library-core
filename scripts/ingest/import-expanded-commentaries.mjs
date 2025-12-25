import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import axios from "axios";

/**
 * scripts/ingest/import-expanded-commentaries.mjs
 * Resolved: Handled unused catch variable 'e'.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TARGET_AUTHORS = [
  "Birkat Asher",
  "Chatam Sofer",
  "Kehot Chumash",
  "Haamek Davar",
  "The Torah: A Women's Commentary",
  "Shadal",
  "Rabbeinu Bahya",
  "Siftei Chakhamim",
  "Tur HaAroch",
  "Tzeenah Ureenah",
];

async function ingestForChapter(bookName, bookSlug, chapter) {
  for (const author of TARGET_AUTHORS) {
    const ref = `${author} on ${bookName} ${chapter}`;

    try {
      const { data } = await axios.get(
        `https://www.sefaria.org/api/texts/${ref}?context=0&pad=0`
      );
      if (!data.text || !Array.isArray(data.text)) continue;

      const rows = [];
      data.text.forEach((verseComments, vIdx) => {
        const verseNum = vIdx + 1;
        const comments = Array.isArray(verseComments)
          ? verseComments
          : [verseComments];

        comments.forEach((en, cIdx) => {
          let he = "";
          if (data.he && data.he[vIdx]) {
            const heArr = Array.isArray(data.he[vIdx])
              ? data.he[vIdx]
              : [data.he[vIdx]];
            he = heArr[cIdx] || "";
          }
          if (!en && !he) return;

          rows.push({
            verse_ref: `${bookName} ${chapter}:${verseNum}`,
            book_slug: bookSlug,
            chapter_num: chapter,
            verse_num: verseNum,
            author_en: author,
            author_he: data.heTitle || author,
            text_en: en || "",
            text_he: he || "",
            source_ref: `${ref}:${verseNum}:${cIdx + 1}`,
          });
        });
      });

      if (rows.length > 0) {
        await supabase.from("library_commentaries").delete().match({
          book_slug: bookSlug,
          chapter_num: chapter,
          author_en: author,
        });
        await supabase.from("library_commentaries").insert(rows);
        process.stdout.write(`+`);
      }
    } catch (_e) {
      // Ignored: 404/Empty content
    }
  }
}

async function run() {
  console.log("🚀 Starting Targeted Commentary Ingestion...");
  const { data: books } = await supabase
    .from("library_books")
    .select("slug, title_en")
    .eq("is_marketplace", false);

  for (const book of books || []) {
    console.log(`\n📘 Processing ${book.title_en}...`);
    for (let i = 1; i <= 5; i++) {
      await ingestForChapter(book.title_en, book.slug, i);
    }
  }
  console.log("\n✨ Ingestion complete.");
}

run();
