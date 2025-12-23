import { createClient } from "@/lib/supabase/client";

/**
 * lib/books.ts
 * Dynamic library structure fetching with full metadata support.
 */

export interface NavBook {
  name: string;
  chapters: number;
  slug: string;
  description?: string;
}

export interface NavCategory {
  name: string;
  description?: string;
  books: NavBook[];
}

export interface NavCollection {
  name: string;
  description?: string;
  categories: NavCategory[];
}

export interface LibraryData {
  library: NavCollection[];
  marketplace: NavCollection[];
}

// --- STATIC DATA FALLBACKS ---
// Since we don't have a 'categories' table yet, we map descriptions here.

const COLLECTION_DESCRIPTIONS: Record<string, string> = {
  Tanakh: "The Hebrew Bible, consisting of the Torah, Prophets, and Writings.",
  Mishnah:
    "The first major written collection of the Jewish oral traditions (Oral Torah).",
  Talmud:
    "The central text of Rabbinic Judaism, comprising the Mishnah and the Gemara.",
  Chassidut:
    "Mystical and ethical teachings focusing on the inner dimensions of Torah.",
  Philosophy:
    "Works of Jewish philosophy and ethics exploring the rationale of belief.",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Torah: "The Five Books of Moses, the foundation of Jewish law and narrative.",
  Prophets:
    "The Nevi'im, containing the history of Israel and prophetic messages.",
  Writings:
    "The Ketuvim, containing poetry, wisdom literature, and historical accounts.",
  "Seder Zeraim":
    "The Order of Seeds, dealing primarily with agricultural laws and prayers.",
  "Seder Moed":
    "The Order of Festivals, dealing with the Sabbath and holidays.",
  "Seder Nashim":
    "The Order of Women, dealing with marriage, divorce, and vows.",
  "Seder Nezikin": "The Order of Damages, dealing with civil and criminal law.",
  "Seder Kodashim":
    "The Order of Holy Things, dealing with Temple sacrifices and dietary laws.",
  "Seder Tahorot": "The Order of Purities, dealing with laws of ritual purity.",
  Bavli: "The Babylonian Talmud, the primary curriculum of yeshivot.",
  Yerushalmi: "The Jerusalem Talmud, compiled in the Land of Israel.",
  Foundational: "Core texts that establish the principles of the movement.",
  Breslov: "Teachings of Rebbe Nachman of Breslov.",
  Medieval: "Classic works from the Golden Age of Jewish philosophy.",
  Ethics:
    "Musar literature focusing on character development and spiritual growth.",
};

const CHAPTER_COUNTS: Record<string, number> = {
  genesis: 50,
  exodus: 40,
  leviticus: 27,
  numbers: 36,
  deuteronomy: 34,
  joshua: 24,
  judges: 21,
  i_samuel: 31,
  ii_samuel: 24,
  i_kings: 22,
  ii_kings: 25,
  isaiah: 66,
  jeremiah: 52,
  ezekiel: 48,
  psalms: 150,
  proverbs: 31,
  job: 42,
  song_of_songs: 8,
  ruth: 4,
  lamentations: 5,
  ecclesiastes: 12,
  esther: 10,
  daniel: 12,
  ezra: 10,
  nehemiah: 13,
  i_chronicles: 29,
  ii_chronicles: 36,
  berakhot: 9,
  peah: 8,
  demai: 7,
  kilayim: 9,
  sheviit: 10,
  terumot: 11,
  maasrot: 5,
  maaser_sheni: 5,
  challah: 4,
  orlah: 3,
  bikkurim: 3,
  tanya: 53,
  likutei_moharan: 200,
  guide_for_the_perplexed: 178,
};

/**
 * Fetches the library structure from Supabase and organizes it into
 * the nested format required by the NavigationMenu.
 */
export async function fetchLibraryData(): Promise<LibraryData> {
  const supabase = createClient();

  const { data: books, error } = await supabase
    .from("library_books")
    .select("slug, title_en, categories, description, is_marketplace, order_id")
    .order("order_id");

  if (error || !books) {
    console.error("Error fetching library navigation:", error);
    return { library: [], marketplace: [] };
  }

  // --- Processing Logic ---

  const processCollection = (items: typeof books): NavCollection[] => {
    const collectionsMap: Record<string, NavCollection> = {};

    items.forEach((book) => {
      // Data shape: categories = ["Collection", "Category"] (e.g., ["Tanakh", "Torah"])
      const collectionName = book.categories?.[0] || "Other";
      const categoryName = book.categories?.[1] || "General";

      if (!collectionsMap[collectionName]) {
        collectionsMap[collectionName] = {
          name: collectionName,
          description: COLLECTION_DESCRIPTIONS[collectionName],
          categories: [],
        };
      }

      // Find or create category within collection
      let category = collectionsMap[collectionName].categories.find(
        (c) => c.name === categoryName
      );
      if (!category) {
        category = {
          name: categoryName,
          description: CATEGORY_DESCRIPTIONS[categoryName],
          books: [],
        };
        collectionsMap[collectionName].categories.push(category);
      }

      category.books.push({
        name: book.title_en,
        slug: book.slug,
        chapters: CHAPTER_COUNTS[book.slug] || 1,
        description: book.description || undefined,
      });
    });

    return Object.values(collectionsMap);
  };

  // Split into My Library vs Marketplace based on the flag
  const libraryBooks = books.filter((b) => !b.is_marketplace);
  const marketplaceBooks = books.filter((b) => b.is_marketplace);

  return {
    library: processCollection(libraryBooks),
    marketplace: processCollection(marketplaceBooks),
  };
}
