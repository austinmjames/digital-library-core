import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// 1. Define the Shape of a Book (TypeScript Interface)
interface Book {
  slug: string;
  title_en: string;
  title_he: string | null;
  categories: string[] | null;
  section_names: string[];
  order_id: number;
}

export default async function LibraryCatalog() {
  const supabase = await createClient();

  // 2. Fetch from the VIEW (published_books) instead of the table
  // This automatically filters out books with zero verses.
  const { data } = await supabase
    .from("published_books") 
    .select("*")
    .order("order_id");
    
  // Force TypeScript to treat this data as our 'Book' type
  const books = data as Book[] | null;

  if (!books || books.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-6 text-center">
        <h1 className="text-3xl font-english font-bold text-ink">Library Empty</h1>
        <p className="text-pencil mt-4">
          No books with content were found. Run the ingest script to populate your library.
        </p>
      </div>
    );
  }

  // 3. Group books with strict typing
  const grouped = books.reduce((acc, book) => {
    const category = book.categories?.[0] || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(book);
    return acc;
  }, {} as Record<string, Book[]>);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-english font-bold mb-12 text-ink">Library</h1>

      {Object.entries(grouped).map(([category, categoryBooks]) => (
        <div key={category} className="mb-16">
          <h2 className="text-sm font-bold text-pencil uppercase tracking-widest border-b border-pencil/20 pb-3 mb-6">
            {category}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryBooks.map((book) => (
              <Link
                key={book.slug}
                href={`/reader?ref=${book.slug} 1`}
                className="group relative p-6 bg-white border border-pencil/20 rounded-lg hover:border-gold hover:shadow-md transition-all flex flex-col justify-between h-32"
              >
                <div className="flex justify-between items-start">
                  <span className="font-english font-semibold text-lg text-ink group-hover:text-gold transition-colors">
                    {book.title_en}
                  </span>
                  <span className="font-hebrew text-xl text-ink/70">
                    {book.title_he}
                  </span>
                </div>
                
                <div className="w-8 h-1 bg-pencil/10 group-hover:bg-gold/40 rounded-full mt-auto transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}