import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- The Master Metadata List ---
// This acts as the Source of Truth for book descriptions and categorization.
const BOOKS_METADATA = [
  // --- TANAKH (Default Library) ---
  // Torah
  {
    slug: "genesis",
    description: "The creation of the world and the patriarchs.",
    is_marketplace: false,
  },
  {
    slug: "exodus",
    description: "The enslavement in Egypt and the giving of the Torah.",
    is_marketplace: false,
  },
  {
    slug: "leviticus",
    description: "Laws of the Kohanim and holiness.",
    is_marketplace: false,
  },
  {
    slug: "numbers",
    description: "The journey through the desert.",
    is_marketplace: false,
  },
  {
    slug: "deuteronomy",
    description: "Moses' final address to the people.",
    is_marketplace: false,
  },
  // Prophets
  {
    slug: "joshua",
    description: "Conquest and division of the land.",
    is_marketplace: false,
  },
  {
    slug: "judges",
    description: "Leaders during the pre-monarchic period.",
    is_marketplace: false,
  },
  {
    slug: "i_samuel",
    description: "The rise of the monarchy and David.",
    is_marketplace: false,
  },
  {
    slug: "ii_samuel",
    description: "The reign of King David.",
    is_marketplace: false,
  },
  {
    slug: "i_kings",
    description: "Solomon and the divided kingdom.",
    is_marketplace: false,
  },
  {
    slug: "ii_kings",
    description: "The fall of Israel and Judah.",
    is_marketplace: false,
  },
  {
    slug: "isaiah",
    description: "Prophecies of judgment and comfort.",
    is_marketplace: false,
  },
  {
    slug: "jeremiah",
    description: "Prophecies leading up to the destruction.",
    is_marketplace: false,
  },
  {
    slug: "ezekiel",
    description: "Visions of exile and redemption.",
    is_marketplace: false,
  },
  {
    slug: "hosea",
    description: "Metaphor of the unfaithful wife.",
    is_marketplace: false,
  },
  {
    slug: "joel",
    description: "The plague of locusts and day of the Lord.",
    is_marketplace: false,
  },
  {
    slug: "amos",
    description: "Social justice and judgment.",
    is_marketplace: false,
  },
  {
    slug: "obadiah",
    description: "Prophecy against Edom.",
    is_marketplace: false,
  },
  {
    slug: "jonah",
    description: "The reluctant prophet and repentance.",
    is_marketplace: false,
  },
  {
    slug: "micah",
    description: "Judgment on leaders and hope for Zion.",
    is_marketplace: false,
  },
  { slug: "nahum", description: "The fall of Nineveh.", is_marketplace: false },
  {
    slug: "habakkuk",
    description: "The question of divine justice.",
    is_marketplace: false,
  },
  {
    slug: "zephaniah",
    description: "The day of the Lord's wrath.",
    is_marketplace: false,
  },
  {
    slug: "haggai",
    description: "Encouragement to rebuild the Temple.",
    is_marketplace: false,
  },
  {
    slug: "zechariah",
    description: "Visions of the future restoration.",
    is_marketplace: false,
  },
  {
    slug: "malachi",
    description: "The final prophet's message.",
    is_marketplace: false,
  },
  // Writings
  {
    slug: "psalms",
    description: "Songs of praise and lament.",
    is_marketplace: false,
  },
  {
    slug: "proverbs",
    description: "Wisdom and practical instruction.",
    is_marketplace: false,
  },
  {
    slug: "job",
    description: "The suffering of the righteous.",
    is_marketplace: false,
  },
  {
    slug: "song_of_songs",
    description: "Allegory of love between God and Israel.",
    is_marketplace: false,
  },
  {
    slug: "ruth",
    description: "Loyalty and the ancestry of David.",
    is_marketplace: false,
  },
  {
    slug: "lamentations",
    description: "Mourning the destruction of Jerusalem.",
    is_marketplace: false,
  },
  {
    slug: "ecclesiastes",
    description: "The search for meaning in life.",
    is_marketplace: false,
  },
  {
    slug: "esther",
    description: "Salvation of the Jews in Persia.",
    is_marketplace: false,
  },
  {
    slug: "daniel",
    description: "Stories of faith and apocalyptic visions.",
    is_marketplace: false,
  },
  {
    slug: "ezra",
    description: "Return from exile and rebuilding.",
    is_marketplace: false,
  },
  {
    slug: "nehemiah",
    description: "Rebuilding the walls of Jerusalem.",
    is_marketplace: false,
  },
  {
    slug: "i_chronicles",
    description: "Genealogies and history of David.",
    is_marketplace: false,
  },
  {
    slug: "ii_chronicles",
    description: "History of the kings of Judah.",
    is_marketplace: false,
  },

  // --- MISHNAH (Default Library) ---
  {
    slug: "berakhot",
    description: "Laws of blessings and prayers.",
    is_marketplace: false,
  },
  {
    slug: "peah",
    description: "Laws of the corner of the field.",
    is_marketplace: false,
  },
  {
    slug: "demai",
    description: "Produce where tithing is uncertain.",
    is_marketplace: false,
  },
  {
    slug: "kilayim",
    description: "Laws of mixed species.",
    is_marketplace: false,
  },
  {
    slug: "sheviit",
    description: "Laws of the Sabbatical year.",
    is_marketplace: false,
  },
  {
    slug: "terumot",
    description: "Laws of priestly donations.",
    is_marketplace: false,
  },
  { slug: "maasrot", description: "Laws of tithes.", is_marketplace: false },
  {
    slug: "maaser_sheni",
    description: "Second tithe and revai.",
    is_marketplace: false,
  },
  {
    slug: "challah",
    description: "The dough offering.",
    is_marketplace: false,
  },
  {
    slug: "orlah",
    description: "Prohibition of fruit from young trees.",
    is_marketplace: false,
  },
  {
    slug: "bikkurim",
    description: "First fruits offerings.",
    is_marketplace: false,
  },

  // --- MARKETPLACE CONTENT (Chassidut / Philosophy) ---
  {
    slug: "tanya",
    description: "The fundamental work of Chabad Chassidut.",
    is_marketplace: true,
  },
  {
    slug: "likutei_torah",
    description: "Discourses on Leviticus and Numbers.",
    is_marketplace: true,
  },
  {
    slug: "likutei_moharan",
    description: "Teachings of Rebbe Nachman.",
    is_marketplace: true,
  },
  {
    slug: "guide_for_the_perplexed",
    description: "Maimonides' philosophical masterpiece.",
    is_marketplace: true,
  },
  {
    slug: "kuzari",
    description: "Defense of Judaism by Yehuda HaLevi.",
    is_marketplace: true,
  },
  {
    slug: "mesillat_yesharim",
    description: "The Path of the Just.",
    is_marketplace: true,
  },
  {
    slug: "pirkei_avot",
    description: "Ethics of the Fathers.",
    is_marketplace: true,
  },
];

async function updateMetadata() {
  console.log(
    "📚 Updating Book Metadata (Descriptions & Marketplace Status)..."
  );

  // Verify we can connect
  const { data, error: connError } = await supabase
    .from("library_books")
    .select("count", { count: "exact", head: true });
  if (connError) {
    console.error("❌ Connection Error:", connError.message);
    process.exit(1);
  }
  console.log(
    `✅ Connected to Supabase. Found ${data?.length ?? "database"} reachable.`
  );

  let updatedCount = 0;
  let missingCount = 0;

  for (const book of BOOKS_METADATA) {
    // We update the existing record based on the slug.
    const { error, count } = await supabase
      .from("library_books")
      .update({
        description: book.description,
        is_marketplace: book.is_marketplace,
      })
      .eq("slug", book.slug)
      .select();

    if (error) {
      console.error(`❌ Failed to update ${book.slug}: ${error.message}`);
    } else if (count === 0) {
      console.warn(
        `⚠️ Book not found in DB: ${book.slug} (Run master-ingest.mjs first?)`
      );
      missingCount++;
    } else {
      process.stdout.write("."); // Progress dot
      updatedCount++;
    }
  }

  console.log(`\n\n✨ Metadata update complete.`);
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Missing: ${missingCount}`);
}

updateMetadata();
