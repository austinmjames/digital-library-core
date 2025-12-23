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

export default async function VersionedReaderPage({ params }: PageProps) {
  const { collection, book: bookSlug, chapter, translation } = await params;

  // Attempt to fetch data
  const chapterData = await fetchChapterBySlug(bookSlug, chapter, translation);

  if (!chapterData) {
    // Instead of a generic 404, we log the failure to help debug.
    console.error(
      `[VersionedReaderPage] Failed to load: ${bookSlug} ${chapter} (${translation})`
    );
    return notFound();
  }

  const initialData = {
    ...chapterData,
    collection,
    activeTranslation: translation,
  };

  return (
    <InteractiveReader
      initialChapter={initialData}
      bookSlug={bookSlug}
      activeTranslation={translation}
    />
  );
}
