import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuration
const COMMENTATORS = ["Rashi", "Ibn Ezra", "Ramban", "Sforno", "Rashbam"];

// Helper to get chapter count for a book (using Sefaria API if needed, or defaults)
async function getChapterCount(bookName) {
  try {
    const url = `https://www.sefaria.org/api/v2/raw/index/${bookName}`;
    const response = await axios.get(url);
    const data = response.data;
    // Logic to find depth 1 or 2 and get length
    if (data.schema && data.schema.lengths) {
      return data.schema.lengths[0];
    }
    if (data.schema && data.schema.nodes) {
      // Complex structure, might need recursive count. Defaulting for safety.
      return 50;
    }
    // Fallback for simple structures
    return 50;
  } catch (error) {
    // Renamed 'e' to 'error' and actually logged it to avoid "unused" warning if we want, or just ignore.
    console.log(
      `   ⚠️ Could not fetch metadata for ${bookName}, defaulting to 50 chapters. Error: ${error.message}`
    );
    return 50;
  }
}

async function ingestCommentaryForChapter(bookName, bookSlug, chapter) {
  console.log(`\n📖 Processing ${bookName} Chapter ${chapter}...`);

  for (const author of COMMENTATORS) {
    const ref = `${author} on ${bookName} ${chapter}`;

    try {
      // Sefaria API: context=0 to get just the chapter, pad=0 to avoid prev/next
      const url = `https://www.sefaria.org/api/texts/${ref}?context=0&pad=0`;
      const response = await axios.get(url);
      const data = response.data;

      if (!data.text || !Array.isArray(data.text)) {
        continue;
      }

      const rowsToInsert = [];

      data.text.forEach((verseComments, verseIndex) => {
        const verseNum = verseIndex + 1; // 1-based verse
        const verseRef = `${bookName} ${chapter}:${verseNum}`;

        // If verseComments is a string, it's a single comment. If array, multiple.
        // Normalize to array.
        const commentsArray = Array.isArray(verseComments)
          ? verseComments
          : [verseComments];

        commentsArray.forEach((commentEn, commentIdx) => {
          // Get Hebrew counterpart if available
          let commentHe = "";
          if (data.he && data.he[verseIndex]) {
            const heVerse = Array.isArray(data.he[verseIndex])
              ? data.he[verseIndex]
              : [data.he[verseIndex]];
            commentHe = heVerse[commentIdx] || "";
          }

          // Skip empty comments
          if (!commentEn && !commentHe) return;

          rowsToInsert.push({
            verse_ref: verseRef,
            book_slug: bookSlug,
            chapter_num: chapter,
            verse_num: verseNum,
            author_en: author,
            author_he: data.heTitle || author, // Fallback if no heTitle
            text_en: commentEn || "",
            text_he: commentHe || "",
            source_ref: `${ref}:${verseNum}:${commentIdx + 1}`,
          });
        });
      });

      if (rowsToInsert.length > 0) {
        // Clean up previous run for this specific slice to allow re-ingestion
        await supabase.from("library_commentaries").delete().match({
          book_slug: bookSlug,
          chapter_num: chapter,
          author_en: author,
        });

        const { error: insertError } = await supabase
          .from("library_commentaries")
          .insert(rowsToInsert);

        if (insertError) {
          console.error(`   ❌ DB Error for ${author}:`, insertError.message);
        } else {
          process.stdout.write(`+`); // Success tick
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // console.log(`   - Not found: ${ref}`);
      } else {
        console.error(`   ❌ API Error for ${ref}:`, err.message);
      }
    }
  }
}

async function runCommentaryImport() {
  console.log("🚀 Starting Commentary Ingestion...");

  // 1. Fetch all books from our library_books table
  const { data: books, error: dbError } = await supabase
    .from("library_books")
    .select("slug, title_en, categories")
    .order("order_id", { ascending: true }); // Process in order

  if (dbError || !books) {
    console.error("❌ Failed to fetch books from DB:", dbError?.message);
    return;
  }

  console.log(`📚 Found ${books.length} books in library. Processing...`);

  // 2. Iterate through each book found in the DB
  for (const book of books) {
    // Basic filter: We mostly want Tanakh for now, maybe Mishnah later.
    // Adjust this filter if you want EVERYTHING.
    const isTanakh = book.categories && book.categories.includes("Tanakh");
    if (!isTanakh) {
      continue;
    }

    console.log(`\n📘 Book: ${book.title_en} (${book.slug})`);

    // We need chapter counts. Fetch dynamically or use a known map if performance is key.
    // For robust ingestion, we fetch from Sefaria metadata.
    const chapterCount = await getChapterCount(book.title_en);

    for (let i = 1; i <= chapterCount; i++) {
      await ingestCommentaryForChapter(book.title_en, book.slug, i);
    }
  }

  console.log("\n\n✨ Commentary Ingestion Complete.");
}

runCommentaryImport();
