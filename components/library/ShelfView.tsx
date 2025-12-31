"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Bookmark,
  BookOpen,
  ChevronRight,
  Clock,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * ShelfView
 * Filepath: components/library/ShelfView.tsx
 * Role: Personal library management ("My Shelf").
 * PRD Alignment: Section 3.1 (Shelf Management) & Section 2.2 (Marketplace).
 */

interface ShelfItem {
  id: string;
  last_ref: string;
  updated_at: string;
  book: {
    id: string;
    slug: string;
    en_title: string;
    he_title: string;
    category_path: string;
  };
}

export const ShelfView = () => {
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchShelf() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user history joined with book metadata
        // In DrashX, the 'Shelf' is primarily driven by active study history
        const { data, error } = await supabase
          .from("user_history")
          .select(
            `
            last_ref,
            updated_at,
            book:library_books (
              id,
              slug,
              en_title,
              he_title,
              category_path
            )
          `
          )
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        if (data) setItems(data as unknown as ShelfItem[]);
      } catch (err) {
        console.error("Shelf Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchShelf();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="animate-spin text-zinc-200" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
          Loading your Shelf...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-32 text-center space-y-8 bg-white border-2 border-dashed border-zinc-100 rounded-[4rem] animate-in fade-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Bookmark className="w-10 h-10 text-zinc-200" />
        </div>
        <div className="max-w-xs mx-auto space-y-2">
          <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
            Your Shelf is Empty
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
            Manuscripts you begin reading in the catalog will automatically
            appear here for quick access.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-zinc-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          Browse Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Header Metrics */}
      <div className="flex items-center justify-between px-4">
        <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <Clock size={12} className="text-blue-500" /> Active Manuscripts
        </h2>
        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
          {items.length} Books on Shelf
        </span>
      </div>

      {/* 2. Shelf Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <div
            key={item.book.id}
            className="group relative bg-white border border-zinc-100 rounded-[3rem] p-8 shadow-sm hover:shadow-2xl hover:border-zinc-900/10 transition-all flex flex-col justify-between min-h-[320px]"
          >
            {/* Action Menu */}
            <button className="absolute top-8 right-8 p-2 text-zinc-200 hover:text-zinc-900 transition-colors z-20">
              <MoreHorizontal size={20} />
            </button>

            <div className="relative z-10">
              <div className="flex items-start mb-8">
                <div className="p-4 bg-zinc-50 rounded-2xl group-hover:bg-zinc-950 group-hover:text-white transition-all duration-500 shadow-sm">
                  <BookOpen size={28} />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                  {item.book.category_path.split("/").pop()}
                </span>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tighter leading-tight uppercase">
                  {item.book.en_title}
                </h3>
                <p
                  className="font-serif-hebrew text-2xl text-zinc-400 group-hover:text-zinc-600 transition-colors"
                  dir="rtl"
                >
                  {item.book.he_title}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-50 flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between text-zinc-400">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Last read {new Date(item.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded uppercase">
                  {item.last_ref}
                </span>
              </div>

              <Link
                href={`/read/${item.last_ref}`}
                className="w-full py-4 bg-zinc-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
              >
                Resume Study <ChevronRight size={14} />
              </Link>
            </div>

            {/* Leather accent */}
            <div className="absolute top-0 left-0 w-1.5 bg-zinc-950 h-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
};
