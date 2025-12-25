import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

/**
 * scripts/ingest/seed-marketplace-commentaries.mjs
 * Seeds the 'commentary_collections' table with classic Sages.
 * This makes them discoverable in the Marketplace discovery tab.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CLASSIC_SAGES = [
  {
    title: "Rashi",
    author_display_name: "Rabbi Shlomo Yitzchaki",
    description:
      "The most fundamental commentary on the Tanakh and Talmud, known for its concise and essential explanations.",
    is_system: true,
    status: "public",
  },
  {
    title: "Ramban",
    author_display_name: "Nachmanides",
    description:
      "Deep philosophical and mystical insights into the Torah, often engaging with Rashi and Ibn Ezra.",
    is_system: true,
    status: "public",
  },
  {
    title: "Ibn Ezra",
    author_display_name: "Abraham ibn Ezra",
    description:
      "Focuses on the literal meaning (Pshat) and grammatical structure of the Hebrew text.",
    is_system: true,
    status: "public",
  },
  {
    title: "Sforno",
    author_display_name: "Ovadia ben Jacob Sforno",
    description:
      "A 16th-century Italian commentary focusing on the plain meaning and moral lessons of the text.",
    is_system: true,
    status: "public",
  },
  {
    title: "Rashbam",
    author_display_name: "Samuel ben Meir",
    description:
      "The grandson of Rashi, known for his strict adherence to the literal meaning of the verses.",
    is_system: true,
    status: "public",
  },
];

async function seedMarketplace() {
  console.log("🚀 Seeding Marketplace Commentaries...");

  for (const sage of CLASSIC_SAGES) {
    const { error } = await supabase.from("commentary_collections").upsert(
      {
        name: sage.title, // Field 'name' is used in UI
        title: sage.title,
        author_display_name: sage.author_display_name,
        description: sage.description,
        is_system: sage.is_system,
        status: sage.status,
        owner_id: "00000000-0000-0000-0000-000000000000", // System UUID
      },
      { onConflict: "name" }
    );

    if (error) {
      console.error(`   ❌ Failed to seed ${sage.title}:`, error.message);
    } else {
      console.log(`   ✅ Seeded: ${sage.title}`);
    }
  }

  console.log("\n✨ Marketplace seeding complete.");
}

seedMarketplace();
