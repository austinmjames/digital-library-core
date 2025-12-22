'use server'

/**
 * Server-Side Footnote Processor
 */
function processText(html: string | undefined): string {
  if (!html) return "";
  const noSuperscript = html.replace(/<sup[^>]*>\*<\/sup>/g, "");
  return noSuperscript.replace(
    /<i class="footnote">(.*?)<\/i>/g, 
    (match, noteContent) => {
      const inlineNote = noteContent
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/?p[^>]*>/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      return `<span class="sefaria-note-wrapper"><span class="sefaria-note-trigger">*</span><span class="sefaria-note-content">${inlineNote}</span></span>`;
    }
  );
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