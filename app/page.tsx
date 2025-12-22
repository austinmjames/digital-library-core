import { fetchNextChapter } from "@/app/actions";
import Reader from "@/components/reader/Reader";
import { notFound } from "next/navigation";

export default async function HomePage() {
  const initialChapter = await fetchNextChapter("Genesis 1");

  if (!initialChapter) {
    notFound();
  }

  return <Reader initialChapter={initialChapter} />;
}
