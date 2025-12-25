import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

/**
 * scripts/ingest/seed-expanded-marketplace.mjs
 * Registers the requested Modern and Classic commentaries as discoverable marketplace volumes.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// We use the 'name' field as the unique identifier matching Sefaria's author names
const EXPANDED_CATALOG = [
  // Modern
  {
    name: "Birkat Asher",
    author_display_name: "Rabbi Asher Anshel Katz",
    description:
      "A contemporary Chassidic commentary on the Torah focusing on ethical teachings and homiletics.",
    is_system: true,
    status: "public",
    category: "Modern",
  },
  {
    name: "Chatam Sofer",
    author_display_name: "Moses Sofer",
    description:
      "A foundational work of Hungarian Orthodoxy, combining deep halakhic analysis with literal and homiletic interpretation.",
    is_system: true,
    status: "public",
    category: "Modern",
  },
  {
    name: "The Kehot Chumash",
    author_display_name: "Kehot Publication Society",
    description:
      "A comprehensive Chassidic commentary based on the works of the Lubavitcher Rebbe.",
    is_system: true,
    status: "public",
    category: "Modern",
  },
  {
    name: "Haamek Davar",
    author_display_name: "Naftali Zvi Yehuda Berlin (Netziv)",
    description:
      "Known for its 'depth of the word,' this commentary provides profound grammatical and contextual analysis.",
    is_system: true,
    status: "public",
    category: "Modern",
  },
  {
    name: "The Torah: A Women's Commentary",
    author_display_name: "WRJ / Reform Judaism",
    description:
      "The first comprehensive Torah commentary written by female scholars, rabbis, and poets.",
    is_system: true,
    status: "public",
    category: "Modern",
  },
  {
    name: "Shadal",
    author_display_name: "Samuel David Luzzatto",
    description:
      "A 19th-century Italian commentary emphasizing the literal meaning and moral philosophy of the text.",
    is_system: true,
    status: "public",
    category: "Modern",
  },

  // Classic
  {
    name: "Rabbeinu Bahya",
    author_display_name: "Bahya ben Asher",
    description:
      "A classic work structured around the four levels of interpretation: Pshat, Remez, Drash, and Sod.",
    is_system: true,
    status: "public",
    category: "Classic",
  },
  {
    name: "Siftei Chakhamim",
    author_display_name: "Shabbethai Bass",
    description:
      "The primary super-commentary on Rashi, clarifying his sources and grammatical nuances.",
    is_system: true,
    status: "public",
    category: "Classic",
  },
  {
    name: "Tur HaAroch",
    author_display_name: "Jacob ben Asher",
    description:
      "The longer version of the Baal HaTurim's commentary, focusing on literal meaning and legal precedents.",
    is_system: true,
    status: "public",
    category: "Classic",
  },
  {
    name: "Tze'enah Ure'enah",
    author_display_name: "Jacob ben Isaac Ashkenazi",
    description:
      "The classic Yiddish 'women's Bible,' weaving together Midrash, moral lessons, and folklore.",
    is_system: true,
    status: "public",
    category: "Classic",
  },
];

async function seed() {
  console.log("🚀 Expanding Marketplace Catalog...");

  for (const vol of EXPANDED_CATALOG) {
    const { error } = await supabase.from("commentary_collections").upsert(
      {
        name: vol.name,
        title: vol.name,
        author_display_name: vol.author_display_name,
        description: vol.description,
        is_system: vol.is_system,
        status: vol.status,
        // Use a neutral system UUID for these core records
        owner_id: "00000000-0000-0000-0000-000000000000",
      },
      { onConflict: "name" }
    );

    if (error) {
      console.error(`   ❌ Failed: ${vol.name}:`, error.message);
    } else {
      console.log(`   ✅ Registered: ${vol.name}`);
    }
  }

  console.log("\n✨ Marketplace catalog unrolled.");
}

seed();
