import { fetchNextChapter } from "@/app/actions";
import InteractiveReader from "@/components/reader/InteractiveReader";
import { notFound } from "next/navigation";

interface Verse {
  id: string;
  c2_index: number;
  en: string;
  he: string;
}

interface ChapterData {
  id: string;
  ref: string;
  book: string;
  chapterNum: number;
  verses: Verse[];
  nextRef?: string;
  prevRef?: string;
  collection?: string;
}

// Order of books in the Tanakh for cross-book navigation
const TANAKH_ORDER = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "I Samuel", "II Samuel", "I Kings", "II Kings",
  "Isaiah", "Jeremiah", "Ezekiel", "Hosea", "Joel", "Amos", "Obadiah",
  "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai",
  "Zechariah", "Malachi", "Psalms", "Proverbs", "Job", "Song of Songs",
  "Ruth", "Lamentations", "Ecclesiastes", "Esther", "Daniel", "Ezra",
  "Nehemiah", "I Chronicles", "II Chronicles"
];

interface PageProps {
  params: Promise<{
    collection: string;
    book: string;
    chapter: string;
  }>;
}

/**
 * Slug to Title Case helper
 * Also handles common numeric prefix variations for Sefaria compatibility.
 */
function slugToTitle(slug: string) {
  const title = slug
    .split("-")
    .map((word) => {
      // Handle numeric prefixes like 1-samuel -> I Samuel
      if (word === "1") return "I";
      if (word === "2") return "II";
      
      const smallWords = ["of", "and", "the", "in", "to"];
      if (smallWords.includes(word.toLowerCase())) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/^\w/, (c) => c.toUpperCase());

  // Special cases for Roman Numerals if they weren't caught
  return title
    .replace(/^1 /, "I ")
    .replace(/^2 /, "II ");
}

export default async function LibraryPage({ params }: PageProps) {
  const { collection, book, chapter } = await params;

  const decodedBook = decodeURIComponent(book);
  const bookName = slugToTitle(decodedBook);
  const currentChapterNum = parseInt(chapter, 10);
  const ref = `${bookName} ${chapter}`;

  console.log(`[LibraryPage] Requesting: ${ref} (Collection: ${collection})`);

  const chapterData = (await fetchNextChapter(ref)) as ChapterData | null;

  if (!chapterData) {
    console.error(`[LibraryPage] Chapter not found for ref: ${ref}`);
    return notFound();
  }

  /**
   * BRIDGE LOGIC TROUBLESHOOTING:
   * We apply bridges if the collection is a continuous one (like Tanakh)
   * or if the book itself belongs to the Tanakh order.
   */
  const continuousCollections = ["tanakh", "torah", "prophets", "writings", "bible"];
  const isContinuous = continuousCollections.includes(collection.toLowerCase());
  const bookIndex = TANAKH_ORDER.indexOf(bookName);

  // 1. Force Intra-book prevRef if missing (e.g., Genesis 2 -> Genesis 1)
  if (!chapterData.prevRef && currentChapterNum > 1) {
    chapterData.prevRef = `${bookName} ${currentChapterNum - 1}`;
    console.log(`[LibraryPage] Injected intra-book prevRef: ${chapterData.prevRef}`);
  }

  // 2. Force Inter-book bridge (e.g., Exodus 1 -> Genesis 500)
  if (currentChapterNum === 1 && (isContinuous || bookIndex !== -1)) {
    if (bookIndex > 0) {
      const prevBookName = TANAKH_ORDER[bookIndex - 1];
      // Note: "500" is a safe 'high' number; Sefaria API returns the last chapter.
      chapterData.prevRef = `${prevBookName} 500`;
      console.log(`[LibraryPage] Injected cross-book bridge to: ${chapterData.prevRef}`);
    }
  }
  
  // 3. Force forward inter-book bridge (e.g., Genesis 50 -> Exodus 1)
  // This ensures the loader at the bottom works too.
  if (!chapterData.nextRef && (isContinuous || bookIndex !== -1)) {
    if (bookIndex !== -1 && bookIndex < TANAKH_ORDER.length - 1) {
      const nextBookName = TANAKH_ORDER[bookIndex + 1];
      // Note: We only set this if we suspect we are at the end of the current book.
      // Sefaria's API usually provides nextRef if it exists, so we only 
      // check here as a fallback if the API returns null at the end.
      chapterData.nextRef = `${nextBookName} 1`;
      console.log(`[LibraryPage] Injected cross-book nextRef: ${chapterData.nextRef}`);
    }
  }

  const dataWithCollection = {
    ...chapterData,
    collection: collection,
  };

  return (
    <InteractiveReader 
      initialChapter={dataWithCollection} 
      bookSlug={book} 
    />
  );
}