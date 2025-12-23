import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    collection: string;
    book: string;
    chapter: string;
  }>;
}

/**
 * app/library/[collection]/[book]/[chapter]/page.tsx
 * Default redirector.
 * If a user visits a chapter without a version, we send them to the default (JPS).
 */
export default async function ChapterRedirectPage({ params }: PageProps) {
  const { collection, book, chapter } = await params;

  // In the future, this 'jps-1985' could be fetched from user settings/cookies
  const defaultTranslation = "jps-1985";

  redirect(`/library/${collection}/${book}/${chapter}/${defaultTranslation}`);
}
