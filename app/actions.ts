'use server'

/**
 * Server-Side Footnote Processor
 */
function processText(html: string | undefined): string {
  if (!html) return "";

  // 1. Standardize Sefaria's i-tag footnotes into a consistent wrapper
  let processedHtml = html.replace(
    /<i class="footnote">(.*?)<\/i>/g,
    (match, noteContent) => {
      const inlineNote = noteContent
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/?p[^>]*>/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      return `<span class="footnote-container"><span class="footnote-trigger">*</span><span class="footnote-content">${inlineNote}</span></span>`;
    }
  );

  // 2. Wrap superscript markers in a similar, interactive container
  processedHtml = processedHtml.replace(
    /<sup[^>]*>(.*?)<\/sup>/g,
    (match, supContent) => {
      // Avoid wrapping empty or placeholder sups
      if (supContent.trim() === "" || supContent.trim() === "*") return "";
      return `<span class="footnote-container"><span class="footnote-trigger">${supContent}</span></span>`;
    }
  );

  return processedHtml;
}

export async function fetchNextChapter(ref: string) {
  try {
    const res = await fetch(`https://www.sefaria.org/api/texts/${ref}?context=0&alts=0&pad=0`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return null;
    const data = await res.json();

    const length = Math.max(data.text?.length || 0, data.he?.length || 0);
    
    const verses = Array.from({ length }).map((_, i) => ({
      id: `${data.ref}:${i + 1}`,
      c2_index: i + 1,
      en: processText(data.text?.[i] || ""),
      he: processText(data.he?.[i] || ""),
    }));

    return {
      id: data.ref,
      ref: data.ref,
      book: data.indexTitle,
      chapterNum: data.sections[0],
      verses,
      nextRef: data.next 
    };
  } catch (e) {
    console.error("Fetch Error:", e);
    return null;
  }
}