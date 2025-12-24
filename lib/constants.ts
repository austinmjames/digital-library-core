/**
 * lib/constants.ts
 * Centralized mappings for translations and library configuration.
 */

export const TRANSLATION_MAP: Record<string, string> = {
  "jps-1985": "Tanakh: The Holy Scriptures, published by JPS",
  "jps-1917": "The Holy Scriptures: A New Translation (JPS 1917)",
  "sefaria-community": "Sefaria Community Translation",
};

export const DEFAULT_TRANSLATION = "jps-1985";

export const ALLOW_CROSS_BOOK_SCROLLING = [
  "tanakh",
  "torah",
  "prophets",
  "writings",
];

/**
 * Sovereignty Marketplace Configuration
 * Defines labels and categories for community-published translations.
 */
export const MARKETPLACE_CATEGORIES = [
  { id: "scholarly", label: "Academic / Scholarly" },
  { id: "plain", label: "Literal / Plain English" },
  { id: "interpretive", label: "Poetic / Interpretive" },
  { id: "mystical", label: "Chassidic / Mystical" },
];

/**
 * Publishing Status Logic
 * Defines the workflow for personal projects entering the community sanctuary.
 */
export const PUBLISHING_STATUS = {
  PRIVATE: "private",
  IN_REVIEW: "in_review",
  PUBLIC: "public",
  ARCHIVED: "archived",
} as const;
