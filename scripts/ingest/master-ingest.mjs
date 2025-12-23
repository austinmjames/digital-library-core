import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// 1. Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 2. Structure Validators
const STRUCTURE_RULES = {
  Tanakh: 2,
  Torah: 2,
  Prophets: 2,
  Writings: 2,
  Mishnah: 2,
  Talmud: 2,
  Bavli: 2,
  Philosophy: 1,
};

function getExpectedDepth(categories) {
  for (const cat of categories) {
    if (STRUCTURE_RULES[cat]) return STRUCTURE_RULES[cat];
  }
  return 2;
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
 */
function flattenVersion(
  contentArray,
  bookSlug,
  lang,
  versionTitle,
  indices = []
) {
  let results = [];

  if (typeof contentArray === "string") {
    if (!contentArray || contentArray.trim() === "") return [];

    const c1 = indices[0] !== undefined ? indices[0] + 1 : 0;
    const c2 = indices[1] !== undefined ? indices[1] + 1 : 0;
    const c3 = indices[2] !== undefined ? indices[2] + 1 : null;

    results.push({
      universal_ref: `${bookSlug}.${indices.map((i) => i + 1).join(".")}`,
      book_slug: bookSlug,
      language_code: lang,
      version_title: versionTitle,
      content: contentArray,
      is_primary:
        lang === "he" ||
        versionTitle.includes("JPS") ||
        versionTitle.includes("Sefaria"),
      c1_index: c1,
      c2_index: c2,
      c3_index: c3,
    });
    return results;
  }

  if (Array.isArray(contentArray)) {
    contentArray.forEach((item, i) => {
      results = results.concat(
        flattenVersion(item, bookSlug, lang, versionTitle, [...indices, i])
      );
    });
  }
  return results;
}

/**
 * METADATA SYNC
 */
async function syncMetadata(bookName, category, section) {
  const slug = bookName.toLowerCase();
  console.log(`🔍 Syncing metadata for: ${slug}`);

  try {
    const response = await axios.get(
      `https://www.sefaria.org/api/v3/texts/${bookName}?version=primary`
    );
    const data = response.data;
    const structure = data.schema?.sectionNames || ["Chapter", "Verse"];

    // NOTE: We rely on manual categorization passed in via 'categories' arg
    // The automatic 'data.categories' from Sefaria often needs adjustment

    const metadata = {
      slug: slug,
      title_en: data.indexTitle || bookName.replace(/_/g, " "),
      title_he: data.heTitle || null,
      categories: [category, section].filter(Boolean),
      section_names: structure,
    };

    const { error } = await supabase
      .from("library_books")
      .upsert(metadata, { onConflict: "slug" });

    if (error) throw error;
    return metadata.categories;
  } catch (err) {
    console.error(`⚠️ Failed to sync metadata: ${err.message}`);
    return [category, section];
  }
}

/**
 * CORE INGEST ENGINE
 */
async function ingest(bookName, lang, targetVersion = null, categories = []) {
  const slug = bookName.toLowerCase();
  const expectedDepth = getExpectedDepth(categories);

  const versionParam = targetVersion
    ? `&version=${encodeURIComponent(targetVersion)}`
    : "";
  const v3Url = `https://www.sefaria.org/api/v3/texts/${bookName}?version=primary${versionParam}`;
  const v1Url = `https://www.sefaria.org/api/texts/${bookName}?pad=0&context=0&commentary=0`;

  try {
    console.log(`📦 Fetching ${bookName} (${lang})...`);

    // 1. Try V3
    let textData = null;
    let actualTitle = targetVersion;

    try {
      const v3Res = await axios.get(v3Url);
      const data = v3Res.data;

      let rawText = lang === "he" ? data.he : data.text;

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
      // V3 failed
    }

    // 2. Try V1 Fallback
    if (!textData) {
      try {
        const v1Res = await axios.get(v1Url);
        const v1Data = lang === "he" ? v1Res.data.he : v1Res.data.text;

        if (v1Data) {
          const depth = getActualDepth(v1Data);
          if (depth === expectedDepth) {
            textData = v1Data;
            actualTitle = actualTitle || "Standard Version";
          }
        }
      } catch {
        // V1 failed
      }
    }

    if (!textData) {
      console.error(
        `❌ No valid ${lang} content found for ${bookName}. Skipping.`
      );
      return;
    }

    // 3. Flatten & Upload
    const rows = flattenVersion(
      textData,
      slug,
      lang,
      actualTitle || "Unknown Version"
    );

    // Batch insert 500 at a time
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase
        .from("text_versions")
        .upsert(rows.slice(i, i + 500), {
          onConflict: "universal_ref, language_code, version_title",
        });
      if (error) throw error;
      process.stdout.write(".");
    }
    console.log(`\n✅ Finished: ${bookName}\n`);
  } catch (err) {
    console.error(`\n❌ CRITICAL ERROR for ${bookName}: ${err.message}\n`);
  }
}

/**
 * QUEUES
 */
const torah = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"];
const prophets = [
  "Joshua",
  "Judges",
  "I_Samuel",
  "II_Samuel",
  "I_Kings",
  "II_Kings",
  "Isaiah",
  "Jeremiah",
  "Ezekiel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
];
const writings = [
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

const philosophy = ["Tanya", "Pirkei_Avot", "Mesillat_Yesharim"];

const talmud_zeraim = ["Berakhot"];
const talmud_moed = [
  "Shabbat",
  "Eruvin",
  "Pesachim",
  "Shekalim",
  "Yoma",
  "Sukkah",
  "Beitzah",
  "Rosh_Hashanah",
  "Taanit",
  "Megillah",
  "Moed_Katan",
  "Chagigah",
];
const talmud_nashim = [
  "Yevamot",
  "Ketubot",
  "Nedarim",
  "Nazir",
  "Sotah",
  "Gittin",
  "Kiddushin",
];
const talmud_nezikin = [
  "Bava_Kamma",
  "Bava_Metzia",
  "Bava_Batra",
  "Sanhedrin",
  "Makkot",
  "Shevuot",
  "Eduyot",
  "Avodah_Zarah",
  "Avot",
  "Horayot",
];
const talmud_kodashim = [
  "Zevachim",
  "Menachot",
  "Chullin",
  "Bekhorot",
  "Arakhin",
  "Temurah",
  "Keritot",
  "Meilah",
  "Tamid",
  "Middot",
  "Kinnim",
];
const talmud_tahorot = ["Niddah"];

async function runImport() {
  console.log("🚀 Starting Safe Library Ingestion...");

  // 1. Tanakh - Torah
  for (const book of torah) {
    const cats = await syncMetadata(book, "Tanakh", "Torah");
    await ingest(book, "he", null, cats);
    await ingest(
      book,
      "en",
      "Tanakh: The Holy Scriptures, published by JPS",
      cats
    );
  }

  // 2. Tanakh - Prophets
  for (const book of prophets) {
    const cats = await syncMetadata(book, "Tanakh", "Prophets");
    await ingest(book, "he", null, cats);
    await ingest(
      book,
      "en",
      "Tanakh: The Holy Scriptures, published by JPS",
      cats
    );
  }

  // 3. Tanakh - Writings
  for (const book of writings) {
    const cats = await syncMetadata(book, "Tanakh", "Writings");
    await ingest(book, "he", null, cats);
    await ingest(
      book,
      "en",
      "Tanakh: The Holy Scriptures, published by JPS",
      cats
    );
  }

  // 4. Philosophy
  for (const book of philosophy) {
    const cats = await syncMetadata(book, "Philosophy", "Ethics");
    await ingest(book, "he", null, cats);
    await ingest(book, "en", null, cats);
  }

  // 5. Talmud - Zeraim
  for (const book of talmud_zeraim) {
    // Note: We intentionally pass ["Talmud", "Bavli"] here.
    // The Fix Categories script will later refine this to ["Talmud", "Bavli", "Seder Zeraim"]
    const cats = await syncMetadata(book, "Talmud", "Bavli");
    await ingest(book, "he", null, cats);
    await ingest(book, "en", null, cats);
  }

  // 6. Talmud - Moed
  for (const book of talmud_moed) {
    const cats = await syncMetadata(book, "Talmud", "Bavli");
    await ingest(book, "he", null, cats);
    await ingest(book, "en", null, cats);
  }

  // 7. Talmud - Nashim
  for (const book of talmud_nashim) {
    const cats = await syncMetadata(book, "Talmud", "Bavli");
    await ingest(book, "he", null, cats);
    await ingest(book, "en", null, cats);
  }

  // 8. Talmud - Nezikin
  for (const book of talmud_nezikin) {
    const cats = await syncMetadata(book, "Talmud", "Bavli");
    await ingest(book, "he", null, cats);
    await ingest(book, "en", null, cats);
  }

  // 9. Talmud - Kodashim
  for (const book of talmud_kodashim) {
    const cats = await syncMetadata(book, "Talmud", "Bavli");
    await ingest(book, "he", null, cats);
    await ingest(book, "en", null, cats);
  }

  // 10. Talmud - Tahorot
  for (const book of talmud_tahorot) {
    const cats = await syncMetadata(book, "Talmud", "Bavli");
    await ingest(book, "he", null, cats);
    await ingest(book, "en", null, cats);
  }

  console.log("\n✨ Ingestion Complete.");
}

runImport();
