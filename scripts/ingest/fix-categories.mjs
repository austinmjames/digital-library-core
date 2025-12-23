import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map of correct sub-categories for the Tanakh
const TANAKH_STRUCTURE = {
  Torah: ["genesis", "exodus", "leviticus", "numbers", "deuteronomy"],
  Prophets: [
    "joshua",
    "judges",
    "i_samuel",
    "ii_samuel",
    "i_kings",
    "ii_kings",
    "isaiah",
    "jeremiah",
    "ezekiel",
    "hosea",
    "joel",
    "amos",
    "obadiah",
    "jonah",
    "micah",
    "nahum",
    "habakkuk",
    "zephaniah",
    "haggai",
    "zechariah",
    "malachi",
  ],
  Writings: [
    "psalms",
    "proverbs",
    "job",
    "song_of_songs",
    "ruth",
    "lamentations",
    "ecclesiastes",
    "esther",
    "daniel",
    "ezra",
    "nehemiah",
    "i_chronicles",
    "ii_chronicles",
  ],
};

// Map of correct sub-categories for the Talmud (Bavli)
// Structure: Talmud -> Seder -> Tractate
const TALMUD_STRUCTURE = {
  "Seder Zeraim": ["berakhot"],
  "Seder Moed": [
    "shabbat",
    "eruvin",
    "pesachim",
    "shekalim",
    "yoma",
    "sukkah",
    "beitzah",
    "rosh_hashanah",
    "taanit",
    "megillah",
    "moed_katan",
    "chagigah",
  ],
  "Seder Nashim": [
    "yevamot",
    "ketubot",
    "nedarim",
    "nazir",
    "sotah",
    "gittin",
    "kiddushin",
  ],
  "Seder Nezikin": [
    "bava_kamma",
    "bava_metzia",
    "bava_batra",
    "sanhedrin",
    "makkot",
    "shevuot",
    "eduylot",
    "avodah_zarah",
    "avot",
    "horayot",
  ],
  "Seder Kodashim": [
    "zevachim",
    "menachot",
    "chullin",
    "bekhorot",
    "arakhin",
    "temurah",
    "keritot",
    "meilah",
    "tamid",
    "middot",
    "kinnim",
  ],
  "Seder Tahorot": [
    "niddah",
    // Note: Most of Seder Tahorot has no Gemara in Bavli, only Mishnah.
    // Niddah is the primary exception.
  ],
};

async function fixCategories() {
  console.log("🛠️  Reorganizing Library Categories...");

  // Verify connection
  const { error: connError } = await supabase
    .from("library_books")
    .select("count", { count: "exact", head: true });
  if (connError) {
    console.error("❌ Connection Failed:", connError.message);
    return;
  }

  // 1. Fix Tanakh
  console.log("\n--- TANAKH ---");
  for (const [subCategory, books] of Object.entries(TANAKH_STRUCTURE)) {
    console.log(`\n📂 Setting category to ["Tanakh", "${subCategory}"] for:`);

    for (const slug of books) {
      const newCategories = ["Tanakh", subCategory];
      const { error } = await supabase
        .from("library_books")
        .update({ categories: newCategories })
        .eq("slug", slug);

      if (error) {
        console.error(`   ❌ Failed to update ${slug}:`, error.message);
      } else {
        process.stdout.write(` ${slug}`);
      }
    }
  }

  // 2. Fix Talmud
  console.log("\n\n--- TALMUD (Bavli) ---");
  for (const [seder, tractates] of Object.entries(TALMUD_STRUCTURE)) {
    console.log(
      `\n📂 Setting category to ["Talmud", "Bavli", "${seder}"] for:`
    );

    for (const slug of tractates) {
      // Structure: Collection (Talmud) -> Type (Bavli) -> Order (Seder)
      const newCategories = ["Talmud", "Bavli", seder];

      const { error } = await supabase
        .from("library_books")
        .update({ categories: newCategories })
        .eq("slug", slug);

      if (error) {
        // Silent fail if book doesn't exist yet (not all tractates might be ingested)
        // console.error(`   ❌ Failed to update ${slug}:`, error.message);
      } else {
        process.stdout.write(` ${slug}`);
      }
    }
  }

  console.log("\n\n✅ Category reorganization complete.");
}

fixCategories();
