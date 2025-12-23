import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// 1. Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 2. Structure Validators
// We must ensure the API returns the shape we expect.
const STRUCTURE_RULES = {
  'Tanakh': 2,    // [Chapter, Verse]
  'Torah': 2,
  'Mishnah': 2,   // [Chapter, Mishnah]
  'Talmud': 2,    // [Daf, Line]
  'Bavli': 2,
  'Philosophy': 1 // Often just [Chapter] or [Section]
};

function getExpectedDepth(categories) {
  for (const cat of categories) {
    if (STRUCTURE_RULES[cat]) return STRUCTURE_RULES[cat];
  }
  return 2; // Default to standard Chapter/Verse
}

function getActualDepth(data) {
  if (typeof data === 'string') return 0;
  if (Array.isArray(data)) {
    if (data.length === 0) return 1; 
    return 1 + getActualDepth(data[0]);
  }
  return 0;
}

/**
 * RECURSIVE FLATTENER
 */
function flattenVersion(contentArray, bookSlug, lang, versionTitle, indices = []) {
  let results = [];
  
  if (typeof contentArray === 'string') {
    if (!contentArray || contentArray.trim() === '') return [];

    const c1 = indices[0] !== undefined ? indices[0] + 1 : 0;
    const c2 = indices[1] !== undefined ? indices[1] + 1 : 0;
    const c3 = indices[2] !== undefined ? indices[2] + 1 : null;

    results.push({
      universal_ref: `${bookSlug}.${indices.map(i => i + 1).join('.')}`,
      book_slug: bookSlug,
      language_code: lang,
      version_title: versionTitle,
      content: contentArray,
      is_primary: (lang === 'he' || versionTitle.includes('JPS') || versionTitle.includes('Sefaria')),
      c1_index: c1,
      c2_index: c2,
      c3_index: c3
    });
    return results;
  }

  if (Array.isArray(contentArray)) {
    contentArray.forEach((item, i) => {
      results = results.concat(flattenVersion(item, bookSlug, lang, versionTitle, [...indices, i]));
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
    const response = await axios.get(`https://www.sefaria.org/api/v3/texts/${bookName}?version=primary`);
    const data = response.data;
    const structure = data.schema?.sectionNames || ['Chapter', 'Verse'];

    const metadata = {
      slug: slug,
      title_en: data.indexTitle || bookName.replace(/_/g, ' '),
      title_he: data.heTitle || null,
      categories: [category, section].filter(Boolean), 
      section_names: structure, 
      order_id: 999 
    };

    const { error } = await supabase
      .from('library_books')
      .upsert(metadata, { onConflict: 'slug' });

    if (error) throw error;
    console.log(`✅ Metadata synced: ${metadata.title_en}`);
    return metadata.categories;
  } catch (err) {
    // We keep 'err' here because we actually log it below
    console.error(`⚠️ Failed to sync metadata: ${err.message}`);
    return [category];
  }
}

/**
 * CORE INGEST ENGINE
 */
async function ingest(bookName, lang, targetVersion = null, categories = []) {
  const slug = bookName.toLowerCase();
  const expectedDepth = getExpectedDepth(categories);

  const versionParam = targetVersion ? `&version=${encodeURIComponent(targetVersion)}` : '';
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
      
      let rawText = (lang === 'he') ? data.he : data.text;
      
      if (!rawText && data.versions) {
        const vMatch = data.versions.find(v => {
           return v.language === lang && (!targetVersion || v.versionTitle === targetVersion);
        });
        if (vMatch) {
            rawText = vMatch.text;
            actualTitle = vMatch.versionTitle;
        }
      }
      
      if (rawText && getActualDepth(rawText) === expectedDepth) {
          textData = rawText;
      } else if (rawText) {
          console.log(`   ⚠️ V3 returned Depth ${getActualDepth(rawText)}, expected ${expectedDepth}. Rejecting V3.`);
      }

    } catch { 
      // Removed 'e' - strictly cleaner
      console.log(`   V3 failed or empty.`);
    }

    // 2. Try V1 Fallback
    if (!textData) {
      console.log(`   Trying V1 Fallback...`);
      try {
        const v1Res = await axios.get(v1Url);
        const v1Data = (lang === 'he') ? v1Res.data.he : v1Res.data.text;
        
        if (v1Data) {
            const depth = getActualDepth(v1Data);
            if (depth === expectedDepth) {
                textData = v1Data;
                actualTitle = actualTitle || "Standard Version";
                console.log(`   ✅ V1 Success (Depth ${depth})`);
            } else {
                console.warn(`   ❌ V1 returned Depth ${depth}, expected ${expectedDepth}. CANNOT INGEST.`);
                return; 
            }
        }
      } catch {
         // Removed 'err' - strictly cleaner
        console.warn(`   ❌ V1 Fallback failed.`);
      }
    }

    if (!textData) {
      console.error(`❌ No valid ${lang} content found for ${bookName}. Skipping.`);
      return;
    }

    // 3. Flatten & Upload
    const rows = flattenVersion(textData, slug, lang, actualTitle || "Unknown Version");

    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase.from('text_versions').upsert(rows.slice(i, i + 500), {
        onConflict: 'universal_ref, language_code, version_title'
      });
      if (error) throw error;
      process.stdout.write('.');
    }
    console.log(`\n✅ Finished: ${bookName} (${rows.length} segments)\n`);

  } catch (err) {
    console.error(`\n❌ CRITICAL ERROR for ${bookName}: ${err.message}\n`);
  }
}

/**
 * EXECUTION QUEUES
 */
const tanakh = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "I_Samuel", "II_Samuel", "I_Kings", "II_Kings",
  "Isaiah", "Jeremiah", "Ezekiel", "Psalms", "Proverbs", "Job", 
  "Song_of_Songs", "Ruth", "Lamentations", "Ecclesiastes", "Esther"
];

const philosophy = ["Tanya", "Pirkei_Avot", "Mesillat_Yesharim"];
const talmud = ["Berakhot", "Shabbat", "Eruvin"];

async function runImport() {
  console.log("🚀 Starting Safe Library Ingestion...");

  // 1. Tanakh
  for (const book of tanakh) {
    const cats = await syncMetadata(book, "Tanakh", "Torah");
    await ingest(book, 'he', null, cats);
    await ingest(book, 'en', 'Tanakh: The Holy Scriptures, published by JPS', cats); 
  }

  // 2. Philosophy
  for (const book of philosophy) {
    const cats = await syncMetadata(book, "Philosophy", "Ethics");
    await ingest(book, 'he', null, cats);
    await ingest(book, 'en', null, cats);
  }
  
  // 3. Talmud
  for (const book of talmud) {
    const cats = await syncMetadata(book, "Talmud", "Bavli");
    await ingest(book, 'he', null, cats);
    await ingest(book, 'en', null, cats);
  }

  console.log("\n✨ Ingestion Complete.");
}

runImport();