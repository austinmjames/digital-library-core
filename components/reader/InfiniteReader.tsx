"use client";

import { useEffect, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { createClient } from "@/lib/supabase/client";

type ChapterContent = string | { he?: string; en?: string; text?: string; [key: string]: unknown };

// New interface to replace 'any' on line 62
interface ChapterData {
  id: string;
  chapter_number: number;
  content: ChapterContent | ChapterContent[];
  book_slug: string;
}

interface InfiniteReaderProps {
  initialChapter: ChapterData;
  bookSlug: string;
}

export default function InfiniteChapterList({ 
  initialChapter, 
  bookSlug 
}: InfiniteReaderProps) {
  const [chapters, setChapters] = useState<ChapterData[]>([initialChapter]);
  const [lastChapterNum, setLastChapterNum] = useState(initialChapter.chapter_number);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); 
  const supabase = createClient();

  const { ref, inView } = useInView();

  const getLang = useCallback((content: ChapterContent, lang: 'he' | 'en'): string => {
    if (typeof content === "string") return lang === 'he' ? content : "";
    if (typeof content === "object" && content !== null) {
      const obj = content as Record<string, unknown>;
      return (obj[lang] as string) || "";
    }
    return "";
  }, []);

  const loadNextChapter = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextNum = lastChapterNum + 1;

    // Removed the unused 'error' variable here to fix Ln 46
    const { data: verses } = await supabase
      .from("text_content")
      .select("content, verse_num")
      .eq("book_slug", bookSlug)
      .eq("chapter_num", nextNum)
      .order("verse_num", { ascending: true });

    if (verses && verses.length > 0) {
      const nextChapterObj: ChapterData = {
        id: `${bookSlug}-${nextNum}`,
        chapter_number: nextNum,
        content: verses.map(v => v.content as ChapterContent),
        book_slug: bookSlug
      };

      setChapters((prev) => [...prev, nextChapterObj]);
      setLastChapterNum(nextNum);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [lastChapterNum, bookSlug, loading, hasMore, supabase]);

  useEffect(() => {
    if (inView) loadNextChapter();
  }, [inView, loadNextChapter]);

  return (
    <div className="max-w-6xl mx-auto space-y-24">
      {chapters.map((ch) => (
        <div key={ch.id} className="chapter-block">
          <h2 className="text-center text-pencil/40 uppercase tracking-[0.3em] mb-12 text-sm border-b pb-4">
            Chapter {ch.chapter_number}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* English Column */}
            <div className="text-lg leading-relaxed font-serif text-ink order-2 md:order-1">
              {Array.isArray(ch.content) ? (
                ch.content.map((v, i) => (
                  <span key={i} className="block mb-4">
                    <sup className="text-[10px] mr-2 text-pencil/50">{i + 1}</sup>
                    {getLang(v, 'en') || <span className="text-pencil/20 italic text-sm">Translation pending...</span>}
                  </span>
                ))
              ) : (
                getLang(ch.content, 'en')
              )}
            </div>

            {/* Hebrew Column */}
            <div className="text-2xl leading-[2] font-serif text-ink text-right order-1 md:order-2" dir="rtl">
              {Array.isArray(ch.content) ? (
                ch.content.map((v, i) => (
                  <span key={i} className="block mb-4">
                    <sup className="text-[10px] ml-2 text-pencil/50">{i + 1}</sup>
                    <span dangerouslySetInnerHTML={{ __html: getLang(v, 'he') }} />
                  </span>
                ))
              ) : (
                <span dangerouslySetInnerHTML={{ __html: getLang(ch.content, 'he') }} />
              )}
            </div>
          </div>
        </div>
      ))}

      <div ref={ref} className="h-40 flex items-center justify-center">
        {loading && <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />}
      </div>
    </div>
  );
}