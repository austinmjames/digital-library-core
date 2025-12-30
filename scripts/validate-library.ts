import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

/**
 * Library Validation Script (v1.0)
 * Filepath: scripts/validate-library.ts
 * Role: Post-ingestion audit to ensure structural and relational integrity.
 * Alignment: Phase 1 Bedrock - Data Reliability.
 */

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: "library",
    },
  }
);

async function validateLibrary() {
  console.log("--- 🔍 Starting Library Integrity Audit ---");

  try {
    // 1. Fetch all books for reference
    const { data: books, error: booksError } = await supabase
      .from("books")
      .select("id, slug, title_en, total_sections");

    if (booksError) throw booksError;
    if (!books) return;

    console.log(`Checking ${books.length} books...`);

    const results = [];

    for (const book of books) {
      // 2. Count verses for this book
      const { count, error: countError } = await supabase
        .from("verses")
        .select("*", { count: "exact", head: true })
        .eq("book_id", book.id);

      if (countError) {
        console.error(`Error counting ${book.slug}:`, countError.message);
        continue;
      }

      // 3. Find Max Chapter (c1) to check against total_sections
      const { data: maxC1Data } = await supabase
        .from("verses")
        .select("c1")
        .eq("book_id", book.id)
        .order("c1", { ascending: false })
        .limit(1);

      const actualMaxC1 = maxC1Data?.[0]?.c1 || 0;
      const expectedSections = book.total_sections || 0;
      const isComplete = actualMaxC1 >= expectedSections;

      // 4. Check for sequence gaps in chapters
      const { data: chapters } = await supabase
        .from("verses")
        .select("c1")
        .eq("book_id", book.id)
        .order("c1", { ascending: true });

      const uniqueChapters = Array.from(
        new Set(chapters?.map((v) => v.c1) || [])
      );
      const gaps = [];
      for (let i = 1; i <= actualMaxC1; i++) {
        if (!uniqueChapters.includes(i)) gaps.push(i);
      }

      results.push({
        book: book.slug,
        verseCount: count || 0,
        maxChapter: actualMaxC1,
        expected: expectedSections,
        status:
          (count || 0) > 0 && isComplete && gaps.length === 0 ? "✅" : "❌",
        issues: [
          (count || 0) === 0 ? "Empty book" : null,
          !isComplete
            ? `Missing sections (Found ${actualMaxC1}/${expectedSections})`
            : null,
          gaps.length > 0 ? `Chapter gaps: ${gaps.join(", ")}` : null,
        ].filter(Boolean),
      });
    }

    // 5. Check for Orphan Verses (verses with book_id that doesn't exist)
    const { count: orphanCount } = await supabase
      .from("verses")
      .select("*", { count: "exact", head: true })
      .not("book_id", "in", `(${books.map((b) => b.id).join(",")})`);

    // --- Report ---
    console.table(results);

    if (orphanCount && orphanCount > 0) {
      console.error(
        `🚨 ALERT: Found ${orphanCount} orphan verses with invalid book_id references.`
      );
    }

    const failureCount = results.filter((r) => r.status === "❌").length;
    if (failureCount === 0 && !orphanCount) {
      console.log("🌟 All canonical structures verified. Library is healthy.");
    } else {
      console.warn(
        `⚠️ Audit complete with ${failureCount} discrepancies found.`
      );
    }
  } catch (err) {
    console.error("Audit failed:", err);
  }
}

validateLibrary();
