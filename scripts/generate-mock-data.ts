/**
 * Mock Data Generator (v1.0)
 * Filepath: scripts/generate-mock-data.ts
 * Role: Testing Utility.
 * Purpose: Generates a valid 'data/merged.json' file with sample verses
 * to test the ingestion pipeline without requiring the full Sefaria dump.
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const OUTPUT_FILE = path.join(DATA_DIR, "merged.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const mockVerses = [
  // --- Genesis Chapter 1 ---
  {
    book: "Genesis",
    c1: 1,
    c2: 1,
    c3: null,
    he: "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ",
    en: "In the beginning God created the heaven and the earth.",
  },
  {
    book: "Genesis",
    c1: 1,
    c2: 2,
    c3: null,
    he: "וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם",
    en: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
  },
  {
    book: "Genesis",
    c1: 1,
    c2: 3,
    c3: null,
    he: "וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי־אוֹר",
    en: "And God said, Let there be light: and there was light.",
  },

  // --- Exodus Chapter 1 (To test multi-book ingestion) ---
  {
    book: "Exodus",
    c1: 1,
    c2: 1,
    c3: null,
    he: "וְאֵלֶּה שְׁמוֹת בְּנֵי יִשְׂרָאֵל הַבָּאִים מִצְרָיְמָה אֵת יַעֲקֹב אִישׁ וּבֵיתוֹ בָּאוּ",
    en: "Now these are the names of the children of Israel, which came into Egypt; every man and his household came with Jacob.",
  },
  {
    book: "Exodus",
    c1: 1,
    c2: 2,
    c3: null,
    he: "רְאוּבֵן שִׁמְעוֹן לֵוִי וִיהוּדָה",
    en: "Reuben, Simeon, Levi, and Judah,",
  },
];

console.log(`[MockGen] Generating ${mockVerses.length} sample verses...`);

try {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mockVerses, null, 2));
  console.log(`[MockGen] Success! Mock data written to: ${OUTPUT_FILE}`);
  console.log(
    `[MockGen] You can now run: npx ts-node scripts/ingest-sefaria.ts`
  );
} catch (err) {
  console.error("[MockGen] Failed to write file:", err);
}
