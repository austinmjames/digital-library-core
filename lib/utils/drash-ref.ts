/**
 * Drash Reference Utility (DrashRef)
 * Filepath: lib/utils/drash-ref.ts
 * Role: Centralizes logic for parsing, validating, and manipulating canonical references.
 * Alignment: Technical Manifest Section 5 (Standard Reference Format).
 */

export type StructureType =
  | "CHAPTER_VERSE"
  | "DAF_LINE"
  | "SIMAN_SEIF"
  | "NAMED_SECTION";

interface ParsedRef {
  book: string;
  section: string | null;
  segment: string | null;
}

export class DrashRef {
  /**
   * Parses a standard Ref string (e.g., "Genesis.1.1" or "Berakhot.2a")
   * into its constituent parts.
   */
  static parse(ref: string): ParsedRef {
    if (!ref) return { book: "", section: null, segment: null };

    // Normalize: Replace spaces with dots if legacy format is used
    const normalized = ref.replace(/ /g, ".");
    const parts = normalized.split(".");

    return {
      book: parts[0] || "",
      section: parts[1] || null,
      segment: parts[2] || null,
    };
  }

  /**
   * Converts a Ref string into a human-readable display string.
   * e.g., "Genesis.1.1" -> "Genesis 1:1"
   * e.g., "Berakhot.2a" -> "Berakhot 2a"
   */
  static toDisplay(ref: string): string {
    const { book, section, segment } = DrashRef.parse(ref);
    if (!section) return book;

    // Check if section looks like a Daf (ends in 'a' or 'b')
    const isDaf = /[0-9]+[ab]$/.test(section);

    if (isDaf) {
      // Talmud format: Book Daf:Line
      return segment ? `${book} ${section}:${segment}` : `${book} ${section}`;
    }

    // Standard Bible format: Book Chapter:Verse
    return segment ? `${book} ${section}:${segment}` : `${book} ${section}`;
  }

  /**
   * Reconstructs a URL-safe Ref string from params array
   */
  static fromUrlParams(params: string[]): string {
    if (!params || params.length === 0) return "";
    return params.join(".");
  }

  /**
   * Logic to find the next section in a sequence.
   * e.g., 1 -> 2, 2a -> 2b, 2b -> 3a
   */
  static getNextSection(
    currentSection: string,
    structure: StructureType
  ): string | null {
    if (structure === "DAF_LINE") {
      const match = currentSection.match(/(\d+)([ab])/);
      if (!match) return null;

      const num = parseInt(match[1]);
      const side = match[2];

      if (side === "a") return `${num}b`;
      return `${num + 1}a`;
    }

    // Default integer increment (Chapters/Simanim)
    const num = parseInt(currentSection);
    return isNaN(num) ? null : (num + 1).toString();
  }

  /**
   * Logic to find the previous section.
   * e.g., 2 -> 1, 2b -> 2a, 3a -> 2b
   */
  static getPrevSection(
    currentSection: string,
    structure: StructureType
  ): string | null {
    if (structure === "DAF_LINE") {
      const match = currentSection.match(/(\d+)([ab])/);
      if (!match) return null;

      const num = parseInt(match[1]);
      const side = match[2];

      if (side === "b") return `${num}a`;
      if (num === 2) return null; // Standard start of Talmud is 2a
      return `${num - 1}b`;
    }

    // Default integer decrement
    const num = parseInt(currentSection);
    return isNaN(num) || num <= 1 ? null : (num - 1).toString();
  }
}
