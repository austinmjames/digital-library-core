"use client";

import { cn } from "@/lib/utils/utils";
import {
  ArrowRight,
  Bell,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Library,
  Loader2,
  MoreHorizontal,
  Search,
  Settings,
  TrendingUp,
  UserCircle,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * DrashX Library Hub (v2.5)
 * Filepath: app/library/page.tsx
 * Role: Primary hub for canonical navigation and study management.
 * Aesthetic: Modern Google (Material 3). Pill shapes, Material accents, high-clarity surfaces.
 */

export type LibraryTab = "shelf" | "catalog" | "community" | "plans";

// --- Sub-Components ---

const LibraryHeader = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: LibraryTab;
  setActiveTab: (tab: LibraryTab) => void;
}) => (
  <header className="sticky top-0 z-30 bg-[var(--paper)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] pt-6 pb-2 px-6 transition-colors">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Tier: Identity & Google-Style Search */}
      <div className="flex items-center justify-between gap-12">
        <div className="flex items-center gap-4 shrink-0">
          <div className="p-2.5 bg-[var(--accent-primary)] rounded-2xl text-white shadow-sm transition-transform active:scale-95">
            <Library size={20} strokeWidth={2} />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-medium tracking-tight text-[var(--ink)] leading-none">
              DrashX <span className="text-[var(--ink-muted)]">Library</span>
            </h1>
          </div>
        </div>

        {/* Global Search Centerpiece (Material Style) */}
        <div className="flex-1 max-w-2xl group">
          <div className="relative">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search library, masechet, or specific verse..."
              className="architect-input w-full pl-12 pr-16"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-2 py-0.5 bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded text-[10px] font-bold text-[var(--ink-muted)] pointer-events-none uppercase">
              <span className="text-[11px] opacity-60">⌘</span>K
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <button className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors p-2 hover:bg-[var(--surface-hover)] rounded-full">
            <Bell size={20} strokeWidth={2} />
          </button>
          <button className="flex items-center gap-2 p-0.5 rounded-full hover:bg-[var(--surface-hover)] transition-colors">
            <div className="w-9 h-9 bg-[var(--surface-hover)] rounded-full flex items-center justify-center text-[var(--ink-muted)] overflow-hidden border border-[var(--border-subtle)] shadow-inner">
              <UserCircle size={24} />
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Tier: Contextual Pill Navigation (Material Chips) */}
      <nav className="flex items-center justify-center pb-2">
        <div className="nav-pill-container">
          {[
            { id: "shelf", label: "My Shelf", icon: Bookmark },
            { id: "catalog", label: "Catalog", icon: BookOpen },
            { id: "community", label: "Community", icon: Users },
            { id: "plans", label: "Study Plans", icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as LibraryTab)}
              className={cn(
                "nav-pill-item",
                activeTab === tab.id && "nav-pill-active"
              )}
            >
              <tab.icon
                size={16}
                strokeWidth={activeTab === tab.id ? 2.5 : 2}
              />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  </header>
);

const ShelfView = () => {
  const router = useRouter();
  const recentBooks = [
    {
      title: "Bereshit",
      category: "Torah",
      progress: 65,
      lastRead: "2h ago",
      color: "bg-blue-600",
    },
    {
      title: "Gate of Unity",
      category: "Chasidut",
      progress: 12,
      lastRead: "Yesterday",
      color: "bg-indigo-600",
    },
    {
      title: "Berakhot",
      category: "Talmud",
      progress: 40,
      lastRead: "3 days ago",
      color: "bg-emerald-600",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Active Reshimu (Recent) */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--ink-muted)] mb-1.5 leading-none">
              Session Context
            </h2>
            <p className="text-3xl font-normal text-[var(--ink)] tracking-tight">
              Active Reshimu
            </p>
          </div>
          <button className="btn-ghost px-4 py-2 border border-[var(--border-subtle)]">
            Manage Shelf <Settings size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentBooks.map((book) => (
            <div
              key={book.title}
              onClick={() => router.push("/reader")}
              className="paper-card paper-card-hover group p-7 flex flex-col justify-between min-h-[190px] cursor-pointer"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div
                    className={cn(
                      "p-2.5 rounded-xl text-white shadow-sm transition-transform group-hover:scale-105",
                      book.color
                    )}
                  >
                    <BookOpen size={18} strokeWidth={2.5} />
                  </div>
                  <button className="p-2 hover:bg-[var(--surface-hover)] rounded-full transition-colors">
                    <MoreHorizontal
                      size={16}
                      className="text-[var(--ink-muted)] group-hover:text-[var(--ink)]"
                    />
                  </button>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-1.5">
                  {book.category}
                </p>
                <h3 className="text-xl font-medium text-[var(--ink)] tracking-tight">
                  {book.title}
                </h3>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex justify-between text-[11px] font-medium text-[var(--ink-muted)]">
                  <span className="tracking-wide">Progress</span>
                  <span className="text-[var(--ink)]">{book.progress}%</span>
                </div>
                <div className="h-1.5 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-1000",
                      book.color
                    )}
                    style={{ width: `${book.progress}%` }}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--ink-muted)] font-medium">
                  <Clock size={12} strokeWidth={2.5} /> {book.lastRead}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Highlight & Collections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-blue-50 dark:bg-blue-900/10 p-10 rounded-[2rem] flex flex-col justify-between min-h-[340px] relative overflow-hidden group border border-blue-100 dark:border-blue-900/30">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8">
              <TrendingUp size={12} strokeWidth={2.5} />
              Daily Illuminated Focus
            </div>
            <h3 className="text-3xl font-medium tracking-tight text-[var(--ink)] leading-tight mb-6">
              Mesillat Yesharim
            </h3>
            <p className="text-[var(--ink-muted)] text-sm font-normal leading-relaxed max-w-sm">
              Rabbi Moshe Chaim Luzzatto&apos;s guide to ethical refinement.
              Continue your chapter-a-day progression.
            </p>
          </div>
          <button className="btn-primary w-fit px-10 py-4 text-xs tracking-[0.1em] shadow-lg shadow-blue-500/20">
            Resume Session <ArrowRight size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="paper-card p-10 flex flex-col">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-8 border-b border-[var(--border-subtle)] pb-5 leading-none">
            Personal Collections
          </h4>
          <div className="space-y-4 flex-1">
            {[
              {
                name: "Yom Kippur Preparations",
                items: 12,
                iconColor: "text-blue-600",
                bg: "bg-blue-50 dark:bg-blue-900/20",
              },
              {
                name: "Daily Kabbalah Routine",
                items: 5,
                iconColor: "text-emerald-600",
                bg: "bg-emerald-50 dark:bg-emerald-900/20",
              },
              {
                name: "Academic References",
                items: 28,
                iconColor: "text-indigo-600",
                bg: "bg-indigo-50 dark:bg-indigo-900/20",
              },
            ].map((coll) => (
              <div
                key={coll.name}
                className="flex items-center justify-between p-4 hover:bg-[var(--surface-hover)] rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-[var(--border-subtle)]"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-95",
                      coll.bg
                    )}
                  >
                    <Bookmark size={20} className={cn(coll.iconColor)} />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-[var(--ink)] tracking-tight leading-none mb-1.5">
                      {coll.name}
                    </p>
                    <p className="text-[10px] font-medium uppercase text-[var(--ink-muted)] tracking-wide">
                      {coll.items} manuscripts
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-[var(--border-subtle)] group-hover:text-[var(--ink)] group-hover:translate-x-1 transition-all"
                />
              </div>
            ))}
          </div>
          <button className="w-full py-5 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl text-[11px] font-bold uppercase tracking-widest text-[var(--ink-muted)] hover:border-[var(--ink-muted)] hover:text-[var(--ink)] transition-all mt-8">
            Create New Collection
          </button>
        </div>
      </section>
    </div>
  );
};

const CatalogView = () => {
  const router = useRouter();
  const categories = [
    {
      title: "Torah",
      count: "5 Books",
      tags: ["Genesis", "Exodus", "Leviticus"],
    },
    {
      title: "Prophets",
      count: "8 Books",
      tags: ["Isaiah", "Jeremiah", "Kings"],
    },
    {
      title: "Talmud",
      count: "63 Tractates",
      tags: ["Bavli", "Yerushalmi", "Mishnah"],
    },
    {
      title: "Midrash",
      count: "12 Volumes",
      tags: ["Rabbah", "Tanchuma", "Aggadah"],
    },
    {
      title: "Kabbalah",
      count: "Ancient Texts",
      tags: ["Zohar", "Bahir", "Lurianic"],
    },
    {
      title: "Chasidut",
      count: "Foundational",
      tags: ["Tanya", "Gate of Unity", "Breslov"],
    },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-subtle)] pb-8">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--ink-muted)] mb-2 leading-none">
            Universal Canon
          </h2>
          <p className="text-4xl font-normal text-[var(--ink)] tracking-tight">
            Canonical Registry
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary px-6 shadow-none">
            Filter Registry
          </button>
          <button className="btn-primary px-8">Browse All Books</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <div
            key={cat.title}
            onClick={() => router.push("/reader")}
            className="paper-card paper-card-hover p-9 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <h3 className="text-2xl font-medium text-[var(--ink)] tracking-tight mb-2 leading-none">
                {cat.title}
              </h3>
              <p className="text-[11px] font-medium uppercase text-[var(--ink-muted)] tracking-widest mb-8">
                {cat.count}
              </p>
              <div className="flex flex-wrap gap-2">
                {cat.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 bg-[var(--surface-hover)] text-[var(--ink-muted)] rounded-full text-[10px] font-medium tracking-wide group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-10 pt-5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-[var(--ink-muted)] group-hover:text-[var(--accent-primary)] transition-colors">
              Explore Section
              <ArrowRight size={16} strokeWidth={2.5} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Library Page Orchestrator ---

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<LibraryTab>("shelf");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--paper)] selection:bg-blue-100 selection:text-blue-900 font-sans overflow-x-hidden relative transition-colors duration-300">
      {/* Google Header Container */}
      <LibraryHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Layout Area */}
      <main className="max-w-7xl mx-auto px-6 py-12 pb-40 relative z-10">
        {!isReady ? (
          <div className="flex flex-col items-center justify-center py-48 gap-4 text-[var(--ink-muted)]">
            <Loader2
              className="animate-spin text-[var(--accent-primary)]"
              size={36}
              strokeWidth={2}
            />
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] animate-pulse">
              Restoring the Registry...
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
            {activeTab === "shelf" && <ShelfView />}
            {activeTab === "catalog" && <CatalogView />}

            {(activeTab === "community" || activeTab === "plans") && (
              <div className="h-[45vh] flex flex-col items-center justify-center text-center space-y-6">
                <div className="p-8 bg-[var(--surface-hover)] rounded-full text-[var(--border-subtle)] shadow-inner">
                  <Settings
                    size={40}
                    className="animate-spin-slow text-[var(--accent-primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-[var(--ink)] tracking-tight">
                    Deployment Pending
                  </h3>
                  <p className="text-[var(--ink-muted)] text-sm max-w-[320px] mx-auto leading-relaxed">
                    The {activeTab} framework is currently being refined for
                    architectural standardisation.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("shelf")}
                  className="btn-secondary px-8"
                >
                  Back to My Shelf
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Brand Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-10 flex justify-center pointer-events-none z-0">
        <p className="text-[10px] font-medium uppercase tracking-[1.5em] text-[var(--ink-muted)] opacity-30">
          DrashX Registry v2.5
        </p>
      </footer>
    </div>
  );
}
