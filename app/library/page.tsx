"use client";

import { cn } from "@/lib/utils/utils";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

/**
 * DrashX Library Browser (Full Implementation)
 * Filepath: src/app/library/page.tsx
 * Role: The central nervous system for content discovery.
 * Includes: Catalog (Canon), Community Market (UGC), and Study Plans (Curriculum).
 */

// --- Types ---

type CategoryNode = {
  id: string;
  slug: string;
  title: string;
  he_title: string;
  count: number;
  color: string;
};

type RecentRead = {
  ref: string;
  title: string;
  loc: string;
  progress: number;
};

type FeaturedWork = {
  title: string;
  he_title: string;
  category: string;
  ref: string;
};

type CommunityResource = {
  id: number;
  title: string;
  author: string;
  type: "Translation" | "Notebook" | "Study Plan";
  adds: number;
  verified: boolean;
};

type Group = {
  id: string;
  name: string;
  members: number;
  verified: boolean;
};

// --- Mock Data ---

const CATEGORIES: CategoryNode[] = [
  {
    id: "1",
    slug: "tanakh",
    title: "Tanakh",
    he_title: "תנ״ך",
    count: 24,
    color: "bg-amber-100 text-amber-800",
  },
  {
    id: "2",
    slug: "mishnah",
    title: "Mishnah",
    he_title: "משנה",
    count: 63,
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "3",
    slug: "talmud",
    title: "Talmud",
    he_title: "תלמוד",
    count: 37,
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    id: "4",
    slug: "halakhah",
    title: "Halakhah",
    he_title: "הלכה",
    count: 14,
    color: "bg-rose-100 text-rose-800",
  },
  {
    id: "5",
    slug: "midrash",
    title: "Midrash",
    he_title: "מדרש",
    count: 20,
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "6",
    slug: "philosophy",
    title: "Philosophy",
    he_title: "מחשבת ישראל",
    count: 45,
    color: "bg-purple-100 text-purple-800",
  },
];

const RECENT_READS: RecentRead[] = [
  { ref: "Genesis.1", title: "Genesis", loc: "Ch. 1", progress: 10 },
  { ref: "Berakhot.2a", title: "Berakhot", loc: "Daf 2a", progress: 45 },
];

const FEATURED_WORKS: FeaturedWork[] = [
  {
    title: "Genesis",
    he_title: "בְּרֵאשִׁית",
    category: "Tanakh",
    ref: "Genesis.1.1",
  },
  {
    title: "Berakhot",
    he_title: "בְּרָכוֹת",
    category: "Talmud",
    ref: "Berakhot.2a",
  },
  {
    title: "Mishneh Torah",
    he_title: "מִשְׁנֵה תּוֹרָה",
    category: "Halakhah",
    ref: "Mishneh_Torah.Sefer_Mada.1.1",
  },
];

const COMMUNITY_RESOURCES: CommunityResource[] = [
  {
    id: 1,
    title: "The Sacks Tehillim",
    author: "Rabbi Sacks",
    type: "Translation",
    adds: 1205,
    verified: true,
  },
  {
    id: 2,
    title: "Intro to Kabbalah",
    author: "Sarah Jenkins",
    type: "Notebook",
    adds: 850,
    verified: false,
  },
  {
    id: 3,
    title: "Rambam Daily",
    author: "Mishneh Torah Project",
    type: "Study Plan",
    adds: 3400,
    verified: true,
  },
];

const OPEN_CHAVRUTAS: Group[] = [
  { id: "g1", name: "Daf Yomi Morning Circle", members: 32, verified: true },
  { id: "g2", name: "Rambam Daily Seekers", members: 18, verified: false },
  { id: "g3", name: "Bereshit Deep Dive", members: 45, verified: true },
];

// --- Components ---

interface HeaderProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
}

const LibraryHeader = ({ activeTab, setActiveTab }: HeaderProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      router.push(
        `/library/semantic-search?q=${encodeURIComponent(searchQuery)}`
      );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar (Restored Logic) */}
        <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search books, authors, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-100 border-none rounded-xl py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all outline-none"
          />
          {searchQuery.length > 2 && (
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
            >
              <Sparkles size={14} />
            </button>
          )}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none opacity-50 group-focus-within:opacity-0">
            <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 bg-white border border-zinc-200 rounded">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </form>

        {/* Tabs */}
        <div className="flex p-1 bg-zinc-100 rounded-xl">
          {["catalog", "community", "plans"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
                activeTab === tab
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

const CatalogView = () => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {/* Recent Reads Rail */}
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
          Continue Reading
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {RECENT_READS.map((item) => (
          <Link
            key={item.ref}
            href={`/read/${item.ref}`}
            className="group p-4 bg-white border border-zinc-100 rounded-2xl hover:shadow-md hover:border-orange-100 transition-all cursor-pointer block"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-zinc-50 rounded-lg group-hover:bg-orange-50 transition-colors">
                <BookOpen
                  size={20}
                  className="text-zinc-400 group-hover:text-orange-500"
                />
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {item.progress}%
              </span>
            </div>
            <h3 className="font-serif font-bold text-zinc-900 text-lg">
              {item.title}
            </h3>
            <p className="text-sm text-zinc-500">{item.loc}</p>
            <div className="w-full h-1 bg-zinc-100 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* Featured Works (Restored) */}
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
          Featured Works
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURED_WORKS.map((book) => (
          <Link
            key={book.title}
            href={`/read/${book.ref}`}
            className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all text-left group block"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-zinc-50 rounded-xl group-hover:bg-orange-50 transition-colors">
                <BookOpen className="w-5 h-5 text-zinc-400 group-hover:text-orange-600" />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                {book.category}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1">
                {book.title}
              </h3>
              <p
                className="font-serif text-lg text-zinc-500 leading-tight"
                dir="rtl"
              >
                {book.he_title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* Categories Grid */}
    <section>
      <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">
        Browse by Category
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/library/${cat.slug}`}
            className="group relative aspect-square p-4 flex flex-col justify-between bg-white border border-zinc-100 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden block"
          >
            <div
              className={cn(
                "absolute top-0 right-0 p-16 rounded-bl-full opacity-10 transition-opacity group-hover:opacity-20",
                cat.color
              )}
            />

            <div className="relative z-10">
              <span
                className={cn("inline-flex p-2 rounded-lg mb-2", cat.color)}
              >
                <BookOpen size={18} />
              </span>
              <h3 className="font-bold text-zinc-900">{cat.title}</h3>
              <p className="font-serif text-zinc-400 text-sm mt-1">
                {cat.he_title}
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-auto">
              <span className="text-xs text-zinc-400">{cat.count} Books</span>
              <ChevronRight
                size={14}
                className="text-zinc-300 group-hover:text-zinc-900 transition-colors"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  </div>
);

const CommunityView = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {/* Open Chavrutas (Restored from Prior Code) */}
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
          Open Chavrutas
        </h2>
        <Link
          href="/library/groups"
          className="text-xs text-orange-600 font-bold hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {OPEN_CHAVRUTAS.map((group) => (
          <div
            key={group.id}
            className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-bold">
                  {group.name[0]}
                </div>
                {group.verified && (
                  <ShieldCheck size={16} className="text-blue-500" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 leading-tight">
                  {group.name}
                </h4>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight mt-1">
                  {group.members} Active Members
                </p>
              </div>
            </div>
            <button className="mt-6 w-full py-3 bg-zinc-900 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Users size={14} /> Join Chavruta
            </button>
          </div>
        ))}
      </div>
    </section>

    {/* Community Market */}
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-zinc-900">Community Market</h2>
        <button className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm">
          <Filter size={14} />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMMUNITY_RESOURCES.map((res) => (
          <div
            key={res.id}
            className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <span
                className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                  res.type === "Translation"
                    ? "bg-blue-50 text-blue-700"
                    : res.type === "Notebook"
                    ? "bg-purple-50 text-purple-700"
                    : "bg-emerald-50 text-emerald-700"
                )}
              >
                {res.type}
              </span>
              {res.verified && (
                <div className="text-blue-500">
                  <Star size={14} fill="currentColor" />
                </div>
              )}
            </div>

            <h3 className="font-bold text-zinc-900 text-lg mb-1">
              {res.title}
            </h3>
            <p className="text-sm text-zinc-500 mb-6">by {res.author}</p>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Users size={14} />
                <span className="text-xs font-medium">{res.adds}</span>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={14} />
                Add to Shelf
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const PlansView = () => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    {/* Featured Plan (Daf Yomi) */}
    <div className="bg-zinc-900 rounded-3xl p-8 mb-10 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-orange-400">
            <Calendar size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Global Schedule
            </span>
          </div>
          <h2 className="text-3xl font-serif font-bold mb-2">
            Daf Yomi: Bava Batra 14
          </h2>
          <p className="text-zinc-400 max-w-lg">
            Join 150,000 learners worldwide in the daily study of the Talmud.
            Today we discuss the order of the Prophets.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white text-zinc-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
          Start Today <ArrowRight size={16} />
        </button>
      </div>
    </div>

    <h2 className="text-lg font-bold text-zinc-900 mb-6">
      Curated Learning Paths
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="group p-4 bg-white border border-zinc-100 rounded-2xl cursor-pointer hover:border-zinc-300 transition-colors"
        >
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0">
              <Clock size={24} className="text-zinc-400" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900">30 Days of Psalms</h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                A guided journey through the poetry of King David, focused on
                healing.
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- Main Page Component ---

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("catalog");

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <LibraryHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "catalog" && <CatalogView />}
        {activeTab === "community" && <CommunityView />}
        {activeTab === "plans" && <PlansView />}
      </main>
    </div>
  );
}
