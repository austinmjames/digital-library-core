/**
 * lib/text-utils.ts
 * Pure utility functions for text processing.
 * Separated from actions to allow usage in both client and server components.
 */

/**
 * processText
 * Sanitizes Sefaria HTML and converts footnotes into interactive triggers.
 */
export function processText(html: string | undefined): string {
  if (!html) return "";

  // Remove existing sup markers to avoid duplication
  const cleaned = html.replace(/<sup[^>]*>\*<\/sup>/g, "");

  // Convert Sefaria's footnote class to our interactive wrapper
  return cleaned.replace(
    /<i class="footnote">(.*?)<\/i>/g,
    (match, noteContent) => {
      const inlineNote = noteContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return `<span class="sefaria-note-wrapper"><span class="sefaria-note-trigger">*</span><span class="sefaria-note-content">${inlineNote}</span></span>`;
    }
  );
}
