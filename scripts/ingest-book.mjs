import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// 1. Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * RECURSIVE FLATTENER
 * Traverses Sefaria's JSON arrays regardless of depth.
 * Handles: Verses (Tanakh), Halakha (Simanim), Talmud (Daf/Line), and Midrash.
 */
function flattenVersion(contentArray, bookName, lang, versionTitle, indices = []) {
  let results = [];
  
  if (typeof contentArray === 'string') {
    const currentIndices = [...indices];
    const slug = bookName.toLowerCase();
    results.push({
      universal_ref: `${slug}.${currentIndices.join('.')}`,
      book_slug: slug,
      language_code: lang,
      version_title: versionTitle,
      content: contentArray,
      is_primary: lang === 'he' || lang === 'grc' || lang === 'ar'
    });
    return results;
  }

  if (Array.isArray(contentArray)) {
    contentArray.forEach((item, i) => {
      results = results.concat(flattenVersion(item, bookName, lang, versionTitle, [...indices, i + 1]));
    });
  }
  return results;
}

/**
 * CORE INGEST ENGINE
 */
async function ingest(bookName, lang, targetVersion = null) {
  const versionParam = targetVersion ? `&version=${encodeURIComponent(targetVersion)}` : '';
  const url = `https://www.sefaria.org/api/v3/texts/${bookName}?version=primary${versionParam}`;
  
  try {
    const response = await axios.get(url);
    const data = response.data;
    
    // Original source is usually in 'he', translations in 'text'
    let textData = (lang === 'he' || lang === 'grc' || lang === 'ar') ? data.he : data.text;
    let actualTitle = targetVersion;

    // Search deep in versions array if top-level keys are missing
    if (!textData && data.versions) {
      const vMatch = data.versions.find(v => v.language === lang && (!targetVersion || v.versionTitle === targetVersion));
      textData = vMatch?.text;
      actualTitle = vMatch?.versionTitle || targetVersion;
    }

    if (!textData || (Array.isArray(textData) && textData.length === 0)) {
      console.warn(`ℹ️  No ${lang} content found for ${bookName}. Skipping.`);
      return;
    }

    console.log(`📦 Flattening ${bookName} (${lang})...`);
    const rows = flattenVersion(textData, bookName, lang, actualTitle || "Standard Version");

    // Upload in efficient batches
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await supabase.from('text_versions').upsert(rows.slice(i, i + 200), {
        onConflict: 'universal_ref, language_code, version_title'
      });
      if (error) console.error(`❌ Batch Error: ${error.message}`);
    }
    console.log(`✅ Success: ${bookName} - ${actualTitle || lang}`);
  } catch (err) {
    console.error(`❌ API Failure for ${bookName}: ${err.message}`);
  }
}

/**
 * DYNAMIC LIBRARY QUEUES
 */

// Full Tanakh List (39 Books)
const tanakh = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "I_Samuel", "II_Samuel", "I_Kings", "II_Kings",
  "Isaiah", "Jeremiah", "Ezekiel", "Hosea", "Joel", "Amos", "Obadiah",
  "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Psalms", "Proverbs", "Job", "Song_of_Songs", "Ruth", "Lamentations", "Ecclesiastes",
  "Esther", "Daniel", "Ezra", "Nehemiah", "I_Chronicles", "II_Chronicles"
];

// Midrash Rabbah and Tanchuma
const midrash = [
  "Genesis_Rabbah", "Exodus_Rabbah", "Leviticus_Rabbah", "Numbers_Rabbah", "Deuteronomy_Rabbah",
  "Midrash_Tanchuma", "Esther_Rabbah", "Song_of_Songs_Rabbah", "Ruth_Rabbah", "Lamentations_Rabbah"
];

const mishna_avot = ["Pirkei_Avot"];

const philosophy = [
  "Tanya", "Likutei_Moharan", "Guide_for_the_Perplexed", "Derech_Hashem", "Mesillat_Yesharim"
];

/**
 * ADMIN TOOL SIMULATION
 * This represents how an admin tool would pass data to this script.
 * You can add any Sefaria slug here and it will be processed.
 */
const dynamicAdminQueue = [
  { slug: "Zohar", lang: "he", version: "Torat_Emet" },
  { slug: "Shulchan_Arukh,_Orach_Chayim", lang: "he", version: null }
];

async function runImport() {
  console.log("🚀 Starting Universal Library Ingestion...");

  // 1. Ingest Tanakh
  for (const book of tanakh) {
    console.log(`\n--- [TANAKH] ${book} ---`);
    await ingest(book, 'he');
    await ingest(book, 'en', 'Tanakh: The Holy Scriptures, published by JPS');
  }

  // 2. Ingest Ethics (Pirkei Avot)
  for (const book of mishna_avot) {
    console.log(`\n--- [ETHICS] ${book} ---`);
    await ingest(book, 'he');
    await ingest(book, 'en');
  }

  // 3. Ingest Midrash
  for (const book of midrash) {
    console.log(`\n--- [MIDRASH] ${book} ---`);
    await ingest(book, 'he');
    await ingest(book, 'en');
  }

  // 4. Ingest Philosophical Works
  for (const book of philosophy) {
    console.log(`\n--- [PHILOSOPHY] ${book} ---`);
    await ingest(book, 'he');
    await ingest(book, 'en');
  }

  // 5. Process Dynamic Admin Queue (Custom Admin Submissions)
  for (const item of dynamicAdminQueue) {
    console.log(`\n--- [ADMIN INGEST] ${item.slug} ---`);
    await ingest(item.slug, item.lang, item.version);
  }

  console.log("\n✨ All Ingestion Tasks Completed. Your Library is ready.");
}

runImport();