import { fetchNextChapter } from "@/app/actions";
import Reader from "@/components/reader/Reader";
import { notFound } from "next/navigation";

export default async function ReaderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const ref =
    typeof searchParams.ref === "string" ? searchParams.ref : "Genesis 1";
  const initialChapter = await fetchNextChapter(ref);

  if (!initialChapter) {
    notFound();
  }

  return <Reader initialChapter={initialChapter} />;
}
