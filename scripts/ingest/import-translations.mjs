import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// --- CONFIGURATION ---
// Option 2 Groundwork: Define translations with their Marketplace status.
const TRANSLATIONS_CONFIG = [
  // 1. PRIMARY: JPS 1985 (Core Text)
  {
    title: "Tanakh: The Holy Scriptures, published by JPS",
    language: "en",
    is_marketplace: false,
    is_primary: true,
  },
  // 2. MARKETPLACE: JPS 1917 (Public Domain)
  {
    title: "The Holy Scriptures: A New Translation (JPS 1917)",
    language: "en",
    is_marketplace: true,
    is_primary: false,
  },
  // 3. MARKETPLACE: Sefaria Community Translation (Open License)
  {
    title: "Sefaria Community Translation",
    language: "en",
    is_marketplace: true,
    is_primary: false,
  },
];

// 1. Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 2. Structure Validators
const STRUCTURE_RULES = {
  Tanakh: 2, // [Chapter, Verse]
  Torah: 2,
  Mishnah: 2, // [Chapter, Mishnah]
  Talmud: 2, // [Daf, Line]
  Bavli: 2,
  Philosophy: 1, // Often just [Chapter] or [Section]
  Kabbalah: 1, // Often just [Chapter]
};

function getExpectedDepth(categories) {
  for (const cat of categories) {
    if (STRUCTURE_RULES[cat]) return STRUCTURE_RULES[cat];
  }
  return 2; // Default to standard Chapter/Verse
}

function getActualDepth(data) {
  if (typeof data === "string") return 0;
  if (Array.isArray(data)) {
    if (data.length === 0) return 1;
    return 1 + getActualDepth(data[0]);
  }
  return 0;
}

/**
 * RECURSIVE FLATTENER
 * Flattens nested arrays into database rows.
 * Updated to accept 'attributes' for marketplace logic.
 */
function flattenVersion(
  contentArray,
  bookSlug,
  lang,
  versionTitle,
  attributes = {},
  indices = []
) {
  let results = [];

  if (typeof contentArray === "string") {
    if (!contentArray || contentArray.trim() === "") return [];

    // Sefaria is 1-indexed for display, but array is 0-indexed.
    // We store 1-based indices for easier SQL querying later.
    const c1 = indices[0] !== undefined ? indices[0] + 1 : 0;
    const c2 = indices[1] !== undefined ? indices[1] + 1 : 0;
    const c3 = indices[2] !== undefined ? indices[2] + 1 : null;

    results.push({
      universal_ref: `${bookSlug}.${indices.map((i) => i + 1).join(".")}`,
      book_slug: bookSlug,
      language_code: lang,
      version_title: versionTitle,
      content: contentArray,

      // Use configured attributes or fallback to defaults
      is_primary:
        attributes.is_primary !== undefined
          ? attributes.is_primary
          : lang === "he" ||
            versionTitle.includes("JPS") ||
            versionTitle.includes("Sefaria"),

      // Marketplace Logic (Groundwork for Option 2)
      is_marketplace: attributes.is_marketplace || false,

      c1_index: c1,
      c2_index: c2,
      c3_index: c3,
    });
    return results;
  }

  if (Array.isArray(contentArray)) {
    contentArray.forEach((item, i) => {
      // Pass attributes recursively
      results = results.concat(
        flattenVersion(item, bookSlug, lang, versionTitle, attributes, [
          ...indices,
          i,
        ])
      );
    });
  }
  return results;
}

/**
 * METADATA SYNC
 * Ensures the book exists in the 'library_books' table
 */
async function syncMetadata(bookName, category, section) {
  const slug = bookName.toLowerCase();
  // console.log(`🔍 Syncing metadata for: ${slug}`);

  try {
    const response = await axios.get(
      `https://www.sefaria.org/api/v3/texts/${bookName}?version=primary`
    );
    const data = response.data;
    const structure = data.schema?.sectionNames || ["Chapter", "Verse"];

    const metadata = {
      slug: slug,
      title_en: data.indexTitle || bookName.replace(/_/g, " "),
      title_he: data.heTitle || null,
      categories: [category, section].filter(Boolean),
      section_names: structure,
      // order_id is managed manually or via SQL script usually, but we set a default here
      // order_id: 999
    };

    // We use upsert but ignore order_id to prevent overwriting manual ordering
    const { error } = await supabase.from("library_books").upsert(
      {
        slug: metadata.slug,
        title_en: metadata.title_en,
        title_he: metadata.title_he,
        categories: metadata.categories,
        section_names: metadata.section_names,
      },
      { onConflict: "slug", ignoreDuplicates: false }
    );

    if (error) throw error;
    // console.log(`✅ Metadata synced: ${metadata.title_en}`);
    return metadata.categories;
  } catch (err) {
    console.error(`⚠️ Failed to sync metadata for ${bookName}: ${err.message}`);
    return [category];
  }
}

/**
 * CORE INGEST ENGINE
 * Updated to accept version configuration object
 */
async function ingest(bookName, lang, versionConfig = null, categories = []) {
  const slug = bookName.toLowerCase();
  const expectedDepth = getExpectedDepth(categories);

  const targetVersion = versionConfig ? versionConfig.title : null;
  const versionParam = targetVersion
    ? `&version=${encodeURIComponent(targetVersion)}`
    : "";

  const v3Url = `https://www.sefaria.org/api/v3/texts/${bookName}?version=primary${versionParam}`;
  const v1Url = `https://www.sefaria.org/api/texts/${bookName}?pad=0&context=0&commentary=0`;

  // Extract attributes for database row
  const attributes = {
    is_marketplace: versionConfig?.is_marketplace || false,
    is_primary: versionConfig?.is_primary,
  };

  try {
    console.log(
      `📦 Processing ${bookName} (${lang}) - ${targetVersion || "Default"}...`
    );

    // 1. Try V3 API first
    let textData = null;
    let actualTitle = targetVersion;

    try {
      const v3Res = await axios.get(v3Url);
      const data = v3Res.data;

      let rawText = lang === "he" ? data.he : data.text;

      // If primary fetch didn't return text, look through 'versions' array
      if (!rawText && data.versions) {
        const vMatch = data.versions.find((v) => {
          return (
            v.language === lang &&
            (!targetVersion || v.versionTitle === targetVersion)
          );
        });
        if (vMatch) {
          rawText = vMatch.text;
          actualTitle = vMatch.versionTitle;
        }
      }

      if (rawText && getActualDepth(rawText) === expectedDepth) {
        textData = rawText;
      }
    } catch {
      // V3 failed silently, proceed to V1
    }

    // 2. Try V1 Fallback if V3 failed or returned wrong depth
    if (!textData) {
      // console.log(`   Trying V1 Fallback...`);
      try {
        const v1Res = await axios.get(v1Url);
        const v1Data = lang === "he" ? v1Res.data.he : v1Res.data.text;

        if (v1Data) {
          const depth = getActualDepth(v1Data);
          if (depth === expectedDepth) {
            textData = v1Data;
            actualTitle = actualTitle || "Standard Version";
          } else {
            console.warn(
              `   ❌ V1 depth mismatch (Got ${depth}, Expected ${expectedDepth})`
            );
            return;
          }
        }
      } catch {
        console.warn(`   ❌ V1 Fallback failed.`);
      }
    }

    if (!textData) {
      console.error(`❌ No text found for ${bookName} (${lang}). Skipping.`);
      return;
    }

    // 3. Flatten & Upload to Supabase
    const rows = flattenVersion(
      textData,
      slug,
      lang,
      actualTitle || "Unknown Version",
      attributes
    );

    // Batch insert to avoid timeouts
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase
        .from("text_versions")
        .upsert(rows.slice(i, i + 500), {
          onConflict: "universal_ref, language_code, version_title",
        });
      if (error) throw error;
      process.stdout.write(".");
    }
    console.log(` Done (${rows.length} segs)`);
  } catch (err) {
    console.error(`\n❌ CRITICAL ERROR for ${bookName}: ${err.message}\n`);
  }
}

/**
 * EXECUTION QUEUES
 */
const tanakh = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "I_Samuel",
  "II_Samuel",
  "I_Kings",
  "II_Kings",
  "Isaiah",
  "Jeremiah",
  "Ezekiel",
  "Psalms",
  "Proverbs",
  "Job",
  "Song_of_Songs",
  "Ruth",
  "Lamentations",
  "Ecclesiastes",
  "Esther",
  "Daniel",
  "Ezra",
  "Nehemiah",
  "I_Chronicles",
  "II_Chronicles",
];

// const philosophy = ["Tanya", "Pirkei_Avot", "Mesillat_Yesharim"];
// const talmud = ["Berakhot", "Shabbat", "Eruvin"];
const kabbalah = ["Tanya"];

async function runImport() {
  console.log("🚀 Starting Library Ingestion...");

  // 1. Ingest Tanakh
  for (const book of tanakh) {
    const cats = await syncMetadata(book, "Tanakh", "Torah"); // Note: Just using broad categories for metadata sync

    // Ingest Hebrew (Default Version) - Hebrew is always core/primary
    await ingest(
      book,
      "he",
      { title: null, is_marketplace: false, is_primary: true },
      cats
    );

    // Ingest Configured English Translations
    for (const config of TRANSLATIONS_CONFIG) {
      await ingest(book, config.language, config, cats);
    }
  }

  // 2. Ingest Philosophy
  // for (const book of philosophy) {
  //   const cats = await syncMetadata(book, "Philosophy", "Ethics");
  //   await ingest(book, 'he', { title: null, is_marketplace: false, is_primary: true }, cats);
  //   await ingest(book, 'en', TRANSLATIONS_CONFIG[0], cats);
  // }

  // 3. Ingest Kabbalah
  for (const book of kabbalah) {
    const cats = await syncMetadata(book, "Kabbalah", "Chassidut");

    // Ingest Hebrew
    await ingest(
      book,
      "he",
      { title: null, is_marketplace: false, is_primary: true },
      cats
    );

    // Ingest English (using the first configured translation as default for now)
    if (TRANSLATIONS_CONFIG.length > 0) {
      await ingest(book, "en", TRANSLATIONS_CONFIG[0], cats);
    }
  }

  console.log("\n✨ Ingestion Complete.");
}

runImport();
