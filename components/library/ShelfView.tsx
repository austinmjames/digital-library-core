"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import {
  Bookmark,
  BookOpen,
  ChevronRight,
  Clock,
  Loader2,
  Lock,
  MoreHorizontal,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * ShelfView (v2.1 - Auth Aware)
 * Filepath: components/library/ShelfView.tsx
 * Role: Personal library management with Auth/Unauth state handling.
 * PRD Alignment: Section 3.1 (Shelf Management) & Section 4 (Onboarding).
 * Fix: Resolved "infinite loading" for guests and added a premium CTA state.
 */

interface ShelfItem {
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
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [loadingHistory, setLoadingHistory] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchShelf() {
      // If we are still checking auth, or if not logged in, stop here.
      if (authLoading || !isAuthenticated || !user) return;

      setLoadingHistory(true);
      try {
        // Fetch user history joined with book metadata
        // Ref: library schema in supabase/migrations/20240521_library_schema.sql
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
        console.error("[ShelfView] Fetch Error:", err);
      } finally {
        setLoadingHistory(false);
      }
    }

    fetchShelf();
  }, [user, authLoading, isAuthenticated, supabase]);

  // 1. Loading State (Overall)
  if (authLoading || (isAuthenticated && loadingHistory)) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="animate-spin text-zinc-200" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
          Syncing Scriptorium...
        </p>
      </div>
    );
  }

  // 2. UNAUTHENTICATED VERSION (Guest View)
  if (!isAuthenticated) {
    return (
      <div className="py-24 text-center space-y-12 bg-white border border-zinc-100 rounded-[4rem] shadow-sm animate-in fade-in duration-700">
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-zinc-50 rounded-full animate-pulse" />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <Lock className="w-12 h-12 text-zinc-300" />
          </div>
        </div>

        <div className="max-w-md mx-auto space-y-4 px-6">
          <h3 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase">
            A Scholar&rsquo;s Archive
          </h3>
          <p className="text-sm text-zinc-500 leading-relaxed font-medium">
            Your personal shelf tracks active manuscripts, saves your last-read
            verses, and compiles your contribution XP. Join the community to
            begin your collection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6">
          <Link
            href="/login"
            className="w-full sm:w-auto px-10 py-4 bg-zinc-950 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Enter Scriptorium <ChevronRight size={14} />
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto px-10 py-4 bg-white border border-zinc-200 text-zinc-900 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
          >
            Become a Scholar <UserPlus size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // 3. AUTHENTICATED VERSION (Empty State)
  if (items.length === 0) {
    return (
      <div className="py-32 text-center space-y-8 bg-zinc-50/50 border-2 border-dashed border-zinc-200 rounded-[4rem] animate-in fade-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
          <Bookmark className="w-10 h-10 text-zinc-200" />
        </div>
        <div className="max-w-xs mx-auto space-y-2">
          <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
            The Shelf is Awaiting
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
            Any manuscript you open in the catalog will be automatically pinned
            here for your next session.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-zinc-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  // 4. AUTHENTICATED VERSION (Active Shelf)
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <Clock size={12} className="text-orange-500" /> Resuming Study
        </h2>
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
          <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
          <span>Manuscripts Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <div
            key={item.book.id}
            className="group relative bg-white border border-zinc-100 rounded-[3rem] p-8 shadow-sm hover:shadow-2xl hover:border-zinc-900/10 transition-all flex flex-col justify-between min-h-[320px] overflow-hidden"
          >
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
                <h3 className="text-2xl font-black text-zinc-900 tracking-tighter leading-tight uppercase group-hover:text-zinc-950">
                  {item.book.en_title}
                </h3>
                <p
                  className="font-serif-hebrew text-2xl text-zinc-400 group-hover:text-zinc-600 transition-colors mt-2"
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
                    {new Date(item.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded uppercase tracking-wider">
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

            {/* Aesthetic Leather Accent */}
            <div className="absolute top-0 left-0 w-1.5 bg-zinc-950 h-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-2 group-hover:translate-x-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
