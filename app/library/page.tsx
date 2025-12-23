import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Scroll, ChevronRight, Info } from "lucide-react";

interface LibraryBook {
  slug: string;
  title_en: string;
  title_he: string | null;
  categories: string[] | null;
  order_id: number;
}

export default async function LibraryIndex() {
  const supabase = await createClient();

  // Fetch books from the table we just populated with setup_library.sql
  const { data, error } = await supabase
    .from("library_books")
    .select("slug, title_en, title_he, categories, order_id")
    .order("order_id");

  if (error) {
    console.error("Library Fetch Error:", error.message);
  }

  const books = (data as LibraryBook[]) || [];

  // Group by primary category
  const library = books.reduce((acc, book) => {
    const cat = book.categories?.[0] || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(book);
    return acc;
  }, {} as Record<string, LibraryBook[]>);

  const categoryOrder = [
    "Torah",
    "Prophets",
    "Writings",
    "Mishnah",
    "Talmud",
    "Philosophy",
  ];

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto bg-paper">
      <header className="mb-12 md:mb-16 border-b border-pencil/20 pb-8 flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink flex items-center gap-3">
          <Scroll className="w-8 h-8 text-gold" />
          Library
        </h1>
        <Link
          href="/"
          className="text-sm text-pencil hover:text-ink transition-colors font-medium"
        >
          Home
        </Link>
      </header>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <Info className="w-12 h-12 text-pencil/20" />
          <p className="text-pencil font-english">
            The library catalog is currently empty.
          </p>
          <p className="text-xs text-pencil/50 uppercase tracking-widest">
            Verify your Supabase connection and library_books table.
          </p>
        </div>
      ) : (
        Object.entries(library)
          .sort(([a], [b]) => {
            const idxA = categoryOrder.indexOf(a);
            const idxB = categoryOrder.indexOf(b);
            return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
          })
          .map(([category, items]) => (
            <section
              key={category}
              className="mb-20 animate-in fade-in slide-in-from-bottom-2 duration-700"
            >
              <h2 className="text-xs md:text-sm font-sans font-bold text-pencil uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
                {category}
                <div className="h-px bg-pencil/20 flex-1" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {items.map((book) => (
                  <Link
                    key={book.slug}
                    href={`/library/${category.toLowerCase()}/${book.slug}/1`}
                    className="group relative h-32 md:h-40 p-6 bg-white border border-pencil/10 rounded-xl hover:border-gold/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-serif text-lg md:text-xl text-ink font-medium group-hover:text-gold transition-colors">
                        {book.title_en}
                      </h3>
                      <p
                        className="font-hebrew text-base md:text-lg text-pencil/60 mt-1"
                        dir="rtl"
                      >
                        {book.title_he}
                      </p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="w-8 h-1 bg-pencil/10 group-hover:bg-gold rounded-full transition-colors" />
                      <ChevronRight className="w-4 h-4 text-pencil/20 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
      )}
    </div>
  );
}
