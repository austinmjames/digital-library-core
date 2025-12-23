import { fetchChapterBySlug } from "@/app/actions";
import InteractiveReader from "@/components/reader/InteractiveReader";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    collection: string;
    book: string;
    chapter: string;
    translation: string;
  }>;
}

/**
 * app/library/[collection]/[book]/[chapter]/[translation]/page.tsx
 * The versioned Reader page.
 * This route allows for specific translations to be bookmarked and shared.
 */
export default async function VersionedReaderPage({ params }: PageProps) {
  const { collection, book: bookSlug, chapter, translation } = await params;

  // We pass the slug and the translation ID to our action.
  // Note: We'll need to update the fetchChapterBySlug action to accept the translation parameter.
  const chapterData = await fetchChapterBySlug(bookSlug, chapter);

  if (!chapterData) {
    return notFound();
  }

  const initialData = {
    ...chapterData,
    collection,
    // We append the specific translation context here
    activeTranslation: translation,
  };

  return <InteractiveReader initialChapter={initialData} bookSlug={bookSlug} />;
}
