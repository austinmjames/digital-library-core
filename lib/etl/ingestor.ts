/**
 * DrashX ETL Ingestion Engine (v4.8 - Auto-Registration Mode)
 * Filepath: lib/etl/ingestor.ts
 * Role: Implementation of PRD Section 3 (Ingestion Strategy).
 * Logic: Dual-Fetch (EN+HE) + Recursive Crawler + Auto-Registry.
 * Fix: Automatically registers missing books and categories in the database.
 */

import dotenv from "dotenv";
import path from "path";

// Explicitly load .env.local from the root directory
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { IncomingMessage } from "http";
import https from "https";

const BATCH_SIZE = 1000;
const MAX_RETRIES = 3;
const SEFARIA_BASE_URL =
  "https://raw.githubusercontent.com/Sefaria/Sefaria-Export/master/json";

interface SeedConfig {
  path: string;
  type: "CHAPTER_VERSE" | "DAF_LINE" | "SIMAN_SEIF" | "NAMED_SECTION";
  depth: number;
}

interface VerseInsert {
  book_id: string;
  ref: string;
  root_category: string;
  hebrew_text: string | null;
  english_text: string | null;
  c1: number;
  c2: number;
  c3?: number;
  c4?: number;
  c5?: number;
}

const METADATA_KEYS = new Set([
  "title",
  "heTitle",
  "categories",
  "sectionNames",
  "versionTitle",
  "versionSource",
  "versions",
  "nodes",
  "description",
  "schema",
  "order",
  "language",
  "textDepth",
]);

export const CANONICAL_SEED_MAP: Record<string, SeedConfig> = {
  // --- TORAH ---
  Genesis: { path: "Tanakh/Torah/Genesis", type: "CHAPTER_VERSE", depth: 2 },
  Exodus: { path: "Tanakh/Torah/Exodus", type: "CHAPTER_VERSE", depth: 2 },
  Leviticus: {
    path: "Tanakh/Torah/Leviticus",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Numbers: { path: "Tanakh/Torah/Numbers", type: "CHAPTER_VERSE", depth: 2 },
  Deuteronomy: {
    path: "Tanakh/Torah/Deuteronomy",
    type: "CHAPTER_VERSE",
    depth: 2,
  },

  // --- NEVI'IM (PROPHETS) ---
  Joshua: { path: "Tanakh/Prophets/Joshua", type: "CHAPTER_VERSE", depth: 2 },
  Judges: { path: "Tanakh/Prophets/Judges", type: "CHAPTER_VERSE", depth: 2 },
  I_Samuel: {
    path: "Tanakh/Prophets/I%20Samuel",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  II_Samuel: {
    path: "Tanakh/Prophets/II%20Samuel",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  I_Kings: {
    path: "Tanakh/Prophets/I%20Kings",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  II_Kings: {
    path: "Tanakh/Prophets/II%20Kings",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Isaiah: { path: "Tanakh/Prophets/Isaiah", type: "CHAPTER_VERSE", depth: 2 },
  Jeremiah: {
    path: "Tanakh/Prophets/Jeremiah",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Ezekiel: { path: "Tanakh/Prophets/Ezekiel", type: "CHAPTER_VERSE", depth: 2 },
  Hosea: { path: "Tanakh/Prophets/Hosea", type: "CHAPTER_VERSE", depth: 2 },
  Joel: { path: "Tanakh/Prophets/Joel", type: "CHAPTER_VERSE", depth: 2 },
  Amos: { path: "Tanakh/Prophets/Amos", type: "CHAPTER_VERSE", depth: 2 },
  Obadiah: { path: "Tanakh/Prophets/Obadiah", type: "CHAPTER_VERSE", depth: 2 },
  Jonah: { path: "Tanakh/Prophets/Jonah", type: "CHAPTER_VERSE", depth: 2 },
  Micah: { path: "Tanakh/Prophets/Micah", type: "CHAPTER_VERSE", depth: 2 },
  Nahum: { path: "Tanakh/Prophets/Nahum", type: "CHAPTER_VERSE", depth: 2 },
  Habakkuk: {
    path: "Tanakh/Prophets/Habakkuk",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Zephaniah: {
    path: "Tanakh/Prophets/Zephaniah",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Haggai: { path: "Tanakh/Prophets/Haggai", type: "CHAPTER_VERSE", depth: 2 },
  Zechariah: {
    path: "Tanakh/Prophets/Zechariah",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Malachi: { path: "Tanakh/Prophets/Malachi", type: "CHAPTER_VERSE", depth: 2 },

  // --- KETUVIM (WRITINGS) ---
  Psalms: { path: "Tanakh/Writings/Psalms", type: "CHAPTER_VERSE", depth: 2 },
  Proverbs: {
    path: "Tanakh/Writings/Proverbs",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Job: { path: "Tanakh/Writings/Job", type: "CHAPTER_VERSE", depth: 2 },
  Song_of_Songs: {
    path: "Tanakh/Writings/Song%20of%20Songs",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Ruth: { path: "Tanakh/Writings/Ruth", type: "CHAPTER_VERSE", depth: 2 },
  Lamentations: {
    path: "Tanakh/Writings/Lamentations",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Ecclesiastes: {
    path: "Tanakh/Writings/Ecclesiastes",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Esther: { path: "Tanakh/Writings/Esther", type: "CHAPTER_VERSE", depth: 2 },
  Daniel: { path: "Tanakh/Writings/Daniel", type: "CHAPTER_VERSE", depth: 2 },
  Ezra: { path: "Tanakh/Writings/Ezra", type: "CHAPTER_VERSE", depth: 2 },
  Nehemiah: {
    path: "Tanakh/Writings/Nehemiah",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  I_Chronicles: {
    path: "Tanakh/Writings/I%20Chronicles",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  II_Chronicles: {
    path: "Tanakh/Writings/II%20Chronicles",
    type: "CHAPTER_VERSE",
    depth: 2,
  },

  // --- MIDRASH RABBAH ---
  Genesis_Rabbah: {
    path: "Midrash/Aggadah/Midrash%20Rabbah/Bereshit%20Rabbah",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Exodus_Rabbah: {
    path: "Midrash/Aggadah/Midrash%20Rabbah/Shemot%20Rabbah",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Leviticus_Rabbah: {
    path: "Midrash/Aggadah/Midrash%20Rabbah/Vayikra%20Rabbah",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Numbers_Rabbah: {
    path: "Midrash/Aggadah/Midrash%20Rabbah/Bamidbar%20Rabbah",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Deuteronomy_Rabbah: {
    path: "Midrash/Aggadah/Midrash%20Rabbah/Devarim%20Rabbah",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Song_of_Songs_Rabbah: {
    path: "Midrash/Aggadah/Midrash%20Rabbah/Shir%20HaShirim%20Rabbah",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Ruth_Rabbah: {
    path: "Midrash/Aggadah/Midrash%20Rabbah/Ruth%20Rabbah",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Lamentations_Rabbah: {
    path: "Midrash/Aggadah/Midrash%20Rabbah/Eichah%20Rabbah",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Ecclesiastes_Rabbah: {
    path: "Midrash/Aggadah/Midrash%20Rabbah/Kohelet%20Rabbah",
    type: "CHAPTER_VERSE",
    depth: 2,
  },
  Esther_Rabbah: {
    path: "Midrash/Aggadah/Midrash%20Rabbah/Esther%20Rabbah",
    type: "CHAPTER_VERSE",
    depth: 2,
  },

  // --- OTHERS ---
  Tanya: { path: "Chasidut/Chabad/Tanya", type: "NAMED_SECTION", depth: 2 },
  Shulchan_Aruch_Orach_Chayim: {
    path: "Halakhah/Shulchan%20Arukh/Shulchan%20Aruch%2C%20Orach%20Chayim",
    type: "SIMAN_SEIF",
    depth: 3,
  },
  Shulchan_Aruch_Yoreh_Deah: {
    path: "Halakhah/Shulchan%20Arukh/Shulchan%20Aruch%2C%20Yoreh%20De%27ah",
    type: "SIMAN_SEIF",
    depth: 3,
  },
};

async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const attempt = (n: number) => {
      https
        .get(url, (res) => {
          if (res.statusCode === 200) resolve(res);
          else if (n > 0)
            setTimeout(() => attempt(n - 1), (MAX_RETRIES - n + 1) * 2000);
          else
            reject(
              new Error(`Fetch failed: ${res.statusCode} for URL: ${url}`)
            );
        })
        .on("error", (err) => {
          if (n > 0)
            setTimeout(() => attempt(n - 1), (MAX_RETRIES - n + 1) * 2000);
          else reject(err);
        });
    };
    attempt(retries);
  });
}

async function fetchFullJson(url: string): Promise<any> {
  try {
    const res = await fetchWithRetry(url);
    return new Promise((resolve, reject) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(null);
        }
      });
      res.on("error", reject);
    });
  } catch (e) {
    return null;
  }
}

class IngestionSession {
  private batch: VerseInsert[] = [];
  private total = 0;
  private batchCount = 0;

  constructor(
    private supabase: SupabaseClient,
    private slug: string,
    private bookId: string,
    private rootCategory: string
  ) {}

  async add(
    ref: string,
    en: string | null,
    he: string | null,
    coords: number[]
  ) {
    if (!en && !he) return;
    this.batch.push({
      book_id: this.bookId,
      ref,
      root_category: this.rootCategory,
      english_text: en,
      hebrew_text: he,
      c1: coords[0] || 0,
      c2: coords[1] || 0,
      c3: coords[2],
      c4: coords[3],
      c5: coords[4],
    });
    if (this.batch.length >= BATCH_SIZE) await this.flush();
  }

  async flush() {
    if (this.batch.length === 0) return;
    this.batchCount++;
    const { error } = await this.supabase
      .from("verses")
      .upsert(this.batch, { onConflict: "ref,root_category" });
    if (error)
      console.error(`❌ [ETL:${this.slug}] BATCH ERROR: ${error.message}`);
    else {
      const mem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
      console.log(
        `⏳ [ETL:${this.slug}] BATCH:${this.batchCount} | Size:${this.batch.length} | Mem:${mem}MB`
      );
    }
    this.total += this.batch.length;
    this.batch = [];
  }

  getFinalStats() {
    return this.total;
  }
}

async function crawl(
  enNode: any,
  heNode: any,
  coords: number[],
  session: IngestionSession,
  slug: string
) {
  if (typeof enNode === "string" || typeof heNode === "string") {
    if (coords.length === 0) return;
    const ref = `${slug}.${coords.join(".")}`;
    await session.add(
      ref,
      typeof enNode === "string" ? enNode : null,
      typeof heNode === "string" ? heNode : null,
      coords
    );
    return;
  }
  if (!enNode && !heNode) return;
  const node = enNode || heNode;
  const isArr = Array.isArray(node);
  const keys = isArr ? node.map((_, i) => i) : Object.keys(node);
  for (const key of keys) {
    if (!isArr && METADATA_KEYS.has(key as string)) continue;
    const nextEn = enNode ? enNode[key] : null;
    const nextHe = heNode ? heNode[key] : null;
    const nextCoordValue =
      typeof key === "number" ? key + 1 : keys.indexOf(key) + 1;
    await crawl(nextEn, nextHe, [...coords, nextCoordValue], session, slug);
  }
}

/**
 * Auto-Registration Logic
 * Ensures Categories and Book entries exist before ingestion.
 */
async function autoRegister(
  supabase: SupabaseClient,
  slug: string,
  config: SeedConfig,
  enJson: any
): Promise<{ id: string; root_category: string } | null> {
  if (!enJson) return null;

  // 1. Derive Category Path from GitHub path (e.g. Tanakh/Torah/Genesis -> Tanakh.Torah)
  const pathParts = decodeURIComponent(config.path).split("/");
  const categorySegments = pathParts.slice(0, -1);
  const categoryLtree = categorySegments.join(".").replace(/ /g, "_");
  const rootCategory = categorySegments[0];

  console.log(`🔧 [ETL:${slug}] Auto-Registering under ${categoryLtree}...`);

  // 2. Ensure Categories exist recursively
  let currentPath = "";
  for (const segment of categorySegments) {
    const slugSegment = segment.replace(/ /g, "_");
    currentPath = currentPath ? `${currentPath}.${slugSegment}` : slugSegment;
    await supabase.from("categories").upsert(
      {
        slug: slugSegment,
        path: currentPath,
        en_title: segment,
        he_title: segment, // Fallback
      },
      { onConflict: "path" }
    );
  }

  // 3. Register the Book
  const { data: newBook, error } = await supabase
    .from("books")
    .upsert(
      {
        slug: slug,
        category_path: categoryLtree,
        en_title: enJson.title || slug,
        he_title: enJson.heTitle || slug,
        structure_type: config.type,
        text_depth: config.depth,
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (error) {
    console.error(`❌ [ETL:${slug}] Registration Failed: ${error.message}`);
    return null;
  }

  return { id: newBook.id, root_category: rootCategory };
}

export async function syncBook(bookSlug: string) {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey)
    return console.error(`❌ [ETL] Missing env variables.`);

  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: "library" },
  });
  const config = CANONICAL_SEED_MAP[bookSlug];

  try {
    const enUrl = `${SEFARIA_BASE_URL}/${config.path}/English/merged.json`;
    const heUrl = `${SEFARIA_BASE_URL}/${config.path}/Hebrew/merged.json`;

    console.log(`🚀 [ETL:${bookSlug}] Loading Data...`);
    const [enJson, heJson] = await Promise.all([
      fetchFullJson(enUrl),
      fetchFullJson(heUrl),
    ]);

    // Check if registered
    const { data: bookRecord } = await supabase
      .from("books")
      .select("id, category_path")
      .eq("slug", bookSlug)
      .single();
    let bookInfo: { id: string; root_category: string } | null = null;

    if (!bookRecord) {
      bookInfo = await autoRegister(supabase, bookSlug, config, enJson);
    } else {
      bookInfo = {
        id: bookRecord.id,
        root_category: (bookRecord.category_path as string).split(".")[0],
      };
    }

    if (!bookInfo) return;

    const session = new IngestionSession(
      supabase,
      bookSlug,
      bookInfo.id,
      bookInfo.root_category
    );
    await crawl(enJson?.text || [], heJson?.text || [], [], session, bookSlug);
    await session.flush();
    console.log(
      `✅ [ETL:${bookSlug}] Success: ${session.getFinalStats()} total rows synced.`
    );
  } catch (err: any) {
    console.error(`❌ [ETL:${bookSlug}] Error:`, err.message);
  }
}

async function main() {
  const books = Object.keys(CANONICAL_SEED_MAP);
  console.log(`\n--- DrashX Ingestion Engine v4.8 ---`);
  for (const book of books) await syncBook(book);
}

main();
