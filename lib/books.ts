/**
 * lib/books.ts
 * Static definition of the library structure for navigation.
 * Resolves: "File '.../lib/books.ts' is not a module."
 */

export interface NavBook {
  name: string;
  chapters: number;
  slug?: string;
}

export interface NavCategory {
  name: string;
  books: NavBook[];
}

export interface NavCollection {
  name: string;
  categories: NavCategory[];
}

export const LIBRARY: NavCollection[] = [
  {
    name: "Tanakh",
    categories: [
      {
        name: "Torah",
        books: [
          { name: "Genesis", chapters: 50 },
          { name: "Exodus", chapters: 40 },
          { name: "Leviticus", chapters: 27 },
          { name: "Numbers", chapters: 36 },
          { name: "Deuteronomy", chapters: 34 },
        ],
      },
      {
        name: "Prophets",
        books: [
          { name: "Joshua", chapters: 24 },
          { name: "Judges", chapters: 21 },
          { name: "I Samuel", chapters: 31 },
          { name: "II Samuel", chapters: 24 },
          { name: "I Kings", chapters: 22 },
          { name: "II Kings", chapters: 25 },
          { name: "Isaiah", chapters: 66 },
          { name: "Jeremiah", chapters: 52 },
          { name: "Ezekiel", chapters: 48 },
          { name: "Hosea", chapters: 14 },
          { name: "Joel", chapters: 4 },
          { name: "Amos", chapters: 9 },
          { name: "Obadiah", chapters: 1 },
          { name: "Jonah", chapters: 4 },
          { name: "Micah", chapters: 7 },
          { name: "Nahum", chapters: 3 },
          { name: "Habakkuk", chapters: 3 },
          { name: "Zephaniah", chapters: 3 },
          { name: "Haggai", chapters: 2 },
          { name: "Zechariah", chapters: 14 },
          { name: "Malachi", chapters: 3 },
        ],
      },
      {
        name: "Writings",
        books: [
          { name: "Psalms", chapters: 150 },
          { name: "Proverbs", chapters: 31 },
          { name: "Job", chapters: 42 },
          { name: "Song of Songs", chapters: 8 },
          { name: "Ruth", chapters: 4 },
          { name: "Lamentations", chapters: 5 },
          { name: "Ecclesiastes", chapters: 12 },
          { name: "Esther", chapters: 10 },
          { name: "Daniel", chapters: 12 },
          { name: "Ezra", chapters: 10 },
          { name: "Nehemiah", chapters: 13 },
          { name: "I Chronicles", chapters: 29 },
          { name: "II Chronicles", chapters: 36 },
        ],
      },
    ],
  },
  {
    name: "Mishnah",
    categories: [
      {
        name: "Seder Zeraim",
        books: [
          { name: "Berakhot", chapters: 9 },
          { name: "Peah", chapters: 8 },
          { name: "Demai", chapters: 7 },
          { name: "Kilayim", chapters: 9 },
          { name: "Sheviit", chapters: 10 },
          { name: "Terumot", chapters: 11 },
          { name: "Maasrot", chapters: 5 },
          { name: "Maaser Sheni", chapters: 5 },
          { name: "Challah", chapters: 4 },
          { name: "Orlah", chapters: 3 },
          { name: "Bikkurim", chapters: 3 },
        ],
      },
    ],
  },
];
