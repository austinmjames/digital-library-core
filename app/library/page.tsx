"use client";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import { useAuth } from "@/components/context/auth-context";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

interface LibraryBook {
  slug: string;
  title_en: string;
  title_he: string | null;
  categories: string[] | null;
  order_id: number;
}

/**
 * app/library/page.tsx
 * Updated: Removed redundant positioning and tracking classes.
 * Design: Dead-centered "Library" context with responsive top-left logo.
 */
export default function LibraryIndex() {
  const { user, isLoading: authLoading } = useAuth();
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchBooks() {
      const { data } = await supabase
        .from("library_books")
        .select("slug, title_en, title_he, categories, order_id")
        .order("order_id");

      if (data) setBooks(data as LibraryBook[]);
      setLoading(false);
    }
    fetchBooks();
  }, [supabase]);

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
    <div className="min-h-screen bg-paper">
      {/* Universal Header - Cleaned up redundant 'relative' and tracking */}
      <nav className="sticky top-0 z-50 w-full bg-paper/80 backdrop-blur-xl border-b border-pencil/10 px-6 h-16 flex items-center justify-between">
        {/* LEFT: Branding */}
        <div className="flex items-center z-10">
          <Link href="/" className="group">
            <Logo type="responsive" size="sm" />
          </Link>
        </div>

        {/* CENTER: Context - Perfectly Centered */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-serif font-bold text-lg text-ink tracking-[0.1em] pointer-events-auto">
            Library
          </span>
        </div>

        {/* RIGHT: User Controls */}
        <div className="flex items-center gap-3 z-10">
          {!authLoading && !user ? (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-bold uppercase tracking-widest"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="sm"
                  className="bg-ink text-paper rounded-full px-4 text-xs font-bold uppercase tracking-widest"
                >
                  Join
                </Button>
              </Link>
            </>
          ) : !authLoading && user ? (
            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full border border-pencil/10 bg-white shadow-sm flex items-center justify-center"
              >
                <Logo
                  type="icon"
                  size="sm"
                  className="border-none shadow-none bg-transparent"
                />
              </Button>
            </Link>
          ) : null}
        </div>
      </nav>

      <div className="p-6 md:p-12 max-w-7xl mx-auto">
        <header className="mb-12 md:mb-16 pb-8 flex items-baseline justify-between border-b border-pencil/10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink">
            Browse Catalog
          </h1>
          <p className="text-xs text-pencil font-mono uppercase tracking-widest">
            {books.length} Books Available
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Logo type="icon" size="lg" className="opacity-10" />
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <Info className="w-12 h-12 text-pencil/20" />
            <p className="text-pencil font-english">The catalog is empty.</p>
          </div>
        ) : (
          Object.entries(library)
            .sort(
              ([a], [b]) =>
                (categoryOrder.indexOf(a) === -1
                  ? 99
                  : categoryOrder.indexOf(a)) -
                (categoryOrder.indexOf(b) === -1
                  ? 99
                  : categoryOrder.indexOf(b))
            )
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
                      className="group relative h-32 md:h-40 p-6 bg-white border border-pencil/10 rounded-2xl hover:border-accent/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="text-left">
                        <h3 className="font-serif text-lg md:text-xl text-ink font-medium group-hover:text-accent transition-colors">
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
                        <div className="w-8 h-1 bg-pencil/10 group-hover:bg-accent rounded-full transition-colors" />
                        <ChevronRight className="w-4 h-4 text-pencil/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))
        )}
      </div>
    </div>
  );
}
