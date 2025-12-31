"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  BookOpen,
  ChevronRight,
  FolderOpen,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * CatalogView
 * Filepath: components/library/CatalogView.tsx
 * Role: Discovery marketplace for the DrashX library.
 * Schema: library.books, library.categories.
 */

interface CategoryNode {
  id: string;
  slug: string;
  en_title: string;
  he_title: string;
  path: string;
  color?: string;
}

interface FeaturedBook {
  id: string;
  slug: string;
  en_title: string;
  he_title: string;
  category_path: string;
}

// Mock for recent reads (Temporary bridge until ShelfView is standalone)
const QUICK_RESUME = [
  { ref: "Genesis.1", title: "Genesis", loc: "Ch. 1", progress: 10 },
  { ref: "Berakhot.2a", title: "Berakhot", loc: "Daf 2a", progress: 45 },
];

export const CatalogView = () => {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [featured, setFeatured] = useState<FeaturedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch Top Level Categories from Library Schema
        const { data: cats } = await supabase
          .schema("library")
          .from("categories")
          .select("*")
          .lt("depth", 3)
          .order("display_order", { ascending: true })
          .limit(6);

        // Fetch Featured Recommendations
        const { data: books } = await supabase
          .schema("library")
          .from("books")
          .select("id, slug, en_title, he_title, category_path")
          .limit(3);

        if (cats) {
          const styledCats = cats.map((c, i) => ({
            ...c,
            color: [
              "bg-zinc-100 text-zinc-800",
              "bg-orange-50 text-orange-700",
              "bg-blue-50 text-blue-700",
              "bg-emerald-50 text-emerald-700",
              "bg-indigo-50 text-indigo-700",
              "bg-rose-50 text-rose-700",
            ][i % 6],
          }));
          setCategories(styledCats);
        }
        if (books) setFeatured(books);
      } catch (err) {
        console.error("Catalog Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="animate-spin text-zinc-200" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
          Consulting the Archives...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Quick Resume Rail (PRD 3.1) */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2">
            <Sparkles size={12} className="text-amber-500" /> Quick Resume
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {QUICK_RESUME.map((item) => (
            <Link
              key={item.ref}
              href={`/read/${item.ref}`}
              className="group p-6 bg-white border border-zinc-100 rounded-[2rem] hover:shadow-xl hover:border-zinc-950/10 transition-all cursor-pointer flex items-center gap-6"
            >
              <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-zinc-950 group-hover:text-white transition-all duration-500">
                <BookOpen size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-black text-zinc-900 text-lg tracking-tight">
                    {item.title}
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {item.loc}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-950 rounded-full transition-all duration-1000"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-zinc-200 group-hover:text-zinc-950 group-hover:translate-x-1 transition-all"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Featured Works (PRD 2.2) */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
              Featured Manuscripts
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((book) => (
              <Link
                key={book.id}
                href={`/read/${book.slug}.1.1`}
                className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:border-zinc-900/10 transition-all text-left group relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-colors group-hover:bg-zinc-950" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-zinc-50 rounded-2xl group-hover:bg-white/10 group-hover:text-white transition-all">
                      <BookOpen size={20} />
                    </div>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2 py-1 rounded-md group-hover:bg-white/10 group-hover:text-white transition-all">
                      {book.category_path.split("/").pop()}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">
                    {book.en_title}
                  </h3>
                  <p
                    className="font-serif-hebrew text-2xl text-zinc-400 leading-tight group-hover:text-zinc-900 transition-colors"
                    dir="rtl"
                  >
                    {book.he_title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Categories Grid */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
            Browse by Category
          </h2>
        </div>
        {categories.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-zinc-100 rounded-[3rem] text-center">
            <FolderOpen size={32} className="mx-auto text-zinc-100 mb-4" />
            <p className="text-sm text-zinc-400 font-medium italic">
              The shelves are currently bare.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/library/${cat.slug}`}
                className="group relative aspect-square p-6 flex flex-col justify-between bg-white border border-zinc-100 rounded-[2rem] hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer overflow-hidden"
              >
                {/* Minimalist Decoration */}
                <div
                  className={cn(
                    "absolute top-0 right-0 p-12 rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity",
                    cat.color
                  )}
                />

                <div className="relative z-10">
                  <div
                    className={cn(
                      "inline-flex p-3 rounded-xl mb-4 shadow-sm",
                      cat.color
                    )}
                  >
                    <BookOpen size={20} />
                  </div>
                  <h3 className="font-black text-zinc-900 text-sm uppercase tracking-tight leading-tight">
                    {cat.en_title}
                  </h3>
                </div>

                <div className="relative z-10 flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest group-hover:text-zinc-900 transition-colors">
                    Explore
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-zinc-200 group-hover:text-zinc-950 transition-all"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
