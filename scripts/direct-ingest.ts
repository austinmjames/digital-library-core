/**
 * Direct Ingestion Script (v3.1 - Extended Canon)
 * Filepath: scripts/direct-ingest.ts
 * Role: ETL pipeline.
 * Fixes:
 * 1. Added Midrash Rabbah and Tanya to the target list.
 * 2. Added URI encoding to handle spaces in Sefaria folder names (e.g. "Midrash Rabbah").
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// 1. Initialize Environment
const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  db: { schema: "library" },
  auth: { persistSession: false },
});

// 2. Configuration: Dual-Target Fetching
const GITHUB_BASE =
  "https://raw.githubusercontent.com/Sefaria/Sefaria-Export/master/json";

const TARGETS = [
  // --- Torah ---
  { category: "Tanakh/Torah", book: "Genesis" },
  { category: "Tanakh/Torah", book: "Exodus" },
  { category: "Tanakh/Torah", book: "Leviticus" },
  { category: "Tanakh/Torah", book: "Numbers" },
  { category: "Tanakh/Torah", book: "Deuteronomy" },

  // --- Midrash Rabbah (On Torah) ---
  // Note: Sefaria structure uses spaces: "Midrash/Aggadah/Midrash Rabbah"
  { category: "Midrash/Aggadah/Midrash Rabbah", book: "Genesis Rabbah" },
  { category: "Midrash/Aggadah/Midrash Rabbah", book: "Exodus Rabbah" },
  { category: "Midrash/Aggadah/Midrash Rabbah", book: "Leviticus Rabbah" },
  { category: "Midrash/Aggadah/Midrash Rabbah", book: "Numbers Rabbah" },
  { category: "Midrash/Aggadah/Midrash Rabbah", book: "Deuteronomy Rabbah" },

  // --- Chassidut (Tanya) ---
  // Note: Tanya is split into its 5 component sections in the export
  { category: "Chasidut/Tanya", book: "Likutei Amarim" },
  { category: "Chasidut/Tanya", book: "Shaar HaYichud VeHaEmunah" },
  { category: "Chasidut/Tanya", book: "Igeret HaTeshuvah" },
  { category: "Chasidut/Tanya", book: "Igeret HaKodesh" },
  { category: "Chasidut/Tanya", book: "Kuntres Acharon" },
];

// 3. Type Definitions
interface SefariaMergedFile {
  text: unknown[]; // Jagged array
  title?: string;
}

interface VerseRecord {
  book_id: string;
  ref: string;
  hebrew_text: string;
  english_text: string;
  c1: number;
  c2: number;
  c3: number | null;
  root_category: string;
}

const bookMap = new Map<string, string>();
let batch: VerseRecord[] = [];
let totalCount = 0;

// --- Helper Functions ---

async function loadBookMap() {
  console.log("⚡ [Ingest] Loading book manifest...");
  const { data, error } = await supabase.from("books").select("id, slug");
  if (error) throw new Error(`DB Error: ${error.message}`);
  data.forEach((b: { id: string; slug: string }) =>
    bookMap.set(b.slug.toLowerCase(), b.id)
  );
}

async function flushBatch() {
  if (batch.length === 0) return;
  const { error } = await supabase
    .from("verses")
    .upsert(batch, { onConflict: "ref, root_category" });
  if (error) console.error("❌ [Batch Error]", error.message);
  else {
    totalCount += batch.length;
    process.stdout.write(`\r✅ [Ingest] Synced ${totalCount} verses...`);
  }
  batch = [];
}

function mergeAndFlatten(
  bookId: string,
  bookTitle: string,
  enNode: unknown,
  heNode: unknown,
  indices: number[] = []
) {
  // Base Case: Text strings (or nulls)
  const enIsText = typeof enNode === "string" || enNode === null;
  const heIsText = typeof heNode === "string" || heNode === null;

  if (enIsText || heIsText) {
    if (!enNode && !heNode) return;

    // 1-based indexing for Refs
    const c1 = (indices[0] || 0) + 1;
    const c2 = (indices[1] || 0) + 1;
    const c3 = indices[2] !== undefined ? indices[2] + 1 : null;

    // Normalize Ref (replace spaces with dots)
    const refTitle = bookTitle.replace(/ /g, "_");
    const ref = `${refTitle}.${c1}.${c2}${c3 ? `.${c3}` : ""}`;

    batch.push({
      book_id: bookId,
      ref,
      hebrew_text: typeof heNode === "string" ? heNode : "",
      english_text: typeof enNode === "string" ? enNode : "",
      c1,
      c2,
      c3,
      root_category: bookTitle,
    });
    return;
  }

  // Recursive Case
  const enArray = Array.isArray(enNode) ? enNode : [];
  const heArray = Array.isArray(heNode) ? heNode : [];
  const length = Math.max(enArray.length, heArray.length);

  for (let i = 0; i < length; i++) {
    mergeAndFlatten(bookId, bookTitle, enArray[i] ?? null, heArray[i] ?? null, [
      ...indices,
      i,
    ]);
  }
}

async function run() {
  try {
    await loadBookMap();

    for (const target of TARGETS) {
      console.log(`\n📘 Processing ${target.book}...`);

      const bookSlug = target.book.replace(/ /g, "_").toLowerCase();
      // Try exact slug or spaced name match
      const bookId =
        bookMap.get(bookSlug) || bookMap.get(target.book.toLowerCase());

      if (!bookId) {
        console.warn(
          `⚠️ Book ID not found for '${target.book}' (slug: ${bookSlug}). Skipping.`
        );
        continue;
      }

      // Encode URL components to handle spaces in folders/filenames
      const safeCategory = target.category
        .split("/")
        .map(encodeURIComponent)
        .join("/");
      const safeBook = encodeURIComponent(target.book);

      // Fetch English
      const enUrl = `${GITHUB_BASE}/${safeCategory}/${safeBook}/English/merged.json`;
      console.log(`   ⬇️ Fetching English...`);
      const enRes = await fetch(enUrl);
      if (!enRes.ok) {
        console.error(`   ❌ English fetch failed: ${enRes.status} (${enUrl})`);
        continue;
      }
      const enData: SefariaMergedFile = await enRes.json();

      // Fetch Hebrew
      const heUrl = `${GITHUB_BASE}/${safeCategory}/${safeBook}/Hebrew/merged.json`;
      console.log(`   ⬇️ Fetching Hebrew...`);
      const heRes = await fetch(heUrl);
      if (!heRes.ok) {
        console.error(`   ❌ Hebrew fetch failed: ${heRes.status} (${heUrl})`);
        continue;
      }
      const heData: SefariaMergedFile = await heRes.json();

      // Merge & Ingest
      console.log(`   🔄 Merging and flattening...`);
      mergeAndFlatten(bookId, target.book, enData.text, heData.text);
      await flushBatch();
    }

    console.log(`\n\n🎉 [Complete] Ingestion finished.`);
  } catch (error) {
    console.error("\n❌ [Fatal Error]", error);
  }
}

run();
