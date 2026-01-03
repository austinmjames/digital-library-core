"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useZmanim } from "@/lib/hooks/useZmanim";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  ArrowRight,
  Bell,
  Book,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  HelpCircle,
  Info,
  Library,
  Loader2,
  MoreHorizontal,
  PlayCircle,
  Scroll,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * DrashX Library Hub (v5.5 - Type-Safe & Sanitized)
 * Filepath: app/library/page.tsx
 * Role: Master workspace for canonical navigation and study management.
 * Features: Adaptive Description Logic, Responsive Parasha Hero.
 * Fixes: Removed redundant theme effect; Resolved TypeScript 'any' warnings.
 */

export type LibraryTab = "hub" | "catalog" | "community" | "plans";

interface PortionData {
  title: string;
  translation?: string;
  nextTitle?: string;
  torah: string;
  torahStartRef: string;
  haftarah: string;
  haftarahStartRef: string;
  desc: string;
  longDesc?: string;
  bookName?: string;
}

interface QuestionData {
  text: string;
  scholar: string;
}

interface RecentBook {
  book_title: string;
  book_slug: string;
  last_ref: string;
  updated_at: string;
}

interface DiscoverBook {
  en_title: string;
  slug: string;
  category_path: string;
}

interface ShabbatItem {
  category: string;
  title: string;
  date: string;
  memo?: string;
}

interface HebcalResponse {
  items: ShabbatItem[];
}

const TRANSLATIONS: Record<string, string> = {
  Bereishit: "In the Beginning",
  Noach: "Noah",
  "Lech Lecha": "Go Forth",
  Vayeira: "And He Appeared",
  "Chayei Sarah": "Life of Sarah",
  Toldot: "Generations",
  Vayetzei: "And He Went Out",
  Vayishlach: "And He Sent",
  Vayeshev: "And He Settled",
  Miketz: "At the End",
  Vayigash: "And He Approached",
  Vayechi: "And He Lived",
  Shemot: "Names",
  Vaera: "And I Appeared",
  Bo: "Come",
  Beshalach: "When He Sent",
  Yitro: "Jethro",
  Mishpatim: "Laws",
  Terumah: "Offering",
  Tetzaveh: "You Shall Command",
  "Ki Tisa": "When You Take",
  Vayakhel: "And He Assembled",
  Pekudei: "Accountings",
};

const formatCitation = (start: string, end: string): string => {
  if (!start || !end) return "Reading Reference";
  const s = start.split(".");
  const e = end.split(".");
  const book = s[0].replace(/_/g, " ");
  const startChap = s[1];
  const startVerse = s[2];
  const endChap = e[1];
  const endVerse = e[2];

  if (s[0] === e[0]) {
    return `${book} ${startChap}:${startVerse} — ${endChap}:${endVerse}`;
  }
  return `${book} ${startChap}:${startVerse} — ${e[0]} ${endChap}:${endVerse}`;
};

// --- Row 1: Portion Insights ---
const PortionRow = ({
  parasha,
  question,
}: {
  parasha: PortionData | null;
  question: QuestionData | null;
}) => {
  const router = useRouter();
  if (!parasha) return null;

  const titleLength = parasha.title.length;
  const responsiveSize =
    titleLength > 12 ? "text-4xl" : titleLength > 8 ? "text-5xl" : "text-7xl";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="lg:col-span-8 paper-card p-10 bg-white dark:bg-zinc-900 border-2 border-[var(--border-subtle)] group relative overflow-hidden flex flex-col justify-between min-h-[340px] transition-colors duration-500">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--ink-muted)] opacity-60 leading-none">
              Weekly Portion
            </p>
            <div className="space-y-2">
              <h3
                className={cn(
                  "font-normal tracking-tighter uppercase italic leading-[0.8] break-words text-[var(--ink)] dark:text-white transition-all duration-500 py-2",
                  responsiveSize
                )}
              >
                {parasha.title}
              </h3>
              <p className="text-xl font-serif italic text-[var(--ink)]/60 dark:text-white/60 border-l-2 border-[var(--border-subtle)] pl-4">
                &ldquo;{parasha.translation || "Illuminated Path"}&rdquo;
              </p>
              {parasha.nextTitle && (
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--ink)]/40 dark:text-white/40 pt-4 flex items-center gap-2">
                  <ArrowRight size={10} className="opacity-60" /> Next Cycle:{" "}
                  {parasha.nextTitle}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Info size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest opacity-100">
                Registry Narrative
              </span>
            </div>
            <div className="font-sans leading-relaxed text-zinc-600 dark:text-zinc-100">
              <p className="md:hidden line-clamp-6 text-[14px]">
                {parasha.desc}
              </p>
              <p className="hidden md:block text-[15px] leading-relaxed">
                {parasha.longDesc || parasha.desc}
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3 mt-10">
          <Link
            href={`/read/${parasha.torahStartRef}`}
            className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-white/10 rounded-2xl hover:bg-zinc-200 dark:hover:bg-white/20 transition-all group/btn border border-[var(--border-subtle)] dark:border-white/5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Book size={14} className="text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[220px] text-[var(--ink)] dark:text-white">
                {parasha.torah}
              </span>
            </div>
            <ChevronRight
              size={14}
              className="opacity-60 text-[var(--ink)] dark:text-white group-hover/btn:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            href={`/read/${parasha.haftarahStartRef}`}
            className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-white/5 rounded-2xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-all group/btn border border-[var(--border-subtle)] dark:border-white/5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Scroll size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[220px] text-[var(--ink)] dark:text-white">
                {parasha.haftarah}
              </span>
            </div>
            <ChevronRight
              size={14}
              className="opacity-60 text-[var(--ink)] dark:text-white group-hover/btn:translate-x-1 transition-transform"
            />
          </Link>
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-[0.03] dark:opacity-5 pointer-events-none text-[var(--ink)] dark:text-white">
          <BookOpen size={300} />
        </div>
      </div>

      <div className="lg:col-span-4 paper-card p-10 bg-[var(--surface-hover)] dark:bg-zinc-900/60 border-dashed border-2 border-[var(--border-subtle)] flex flex-col justify-between min-h-[340px]">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-[var(--accent-primary)]">
            <HelpCircle size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Registry Inquiry
            </span>
          </div>
          <div className="space-y-4">
            <p className="text-lg leading-relaxed text-[var(--ink)] dark:text-zinc-100 font-bold tracking-tight">
              &ldquo;{question?.text}&rdquo;
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] opacity-70">
              — {question?.scholar}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/editor")}
          className="mt-8 btn-secondary w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm bg-white dark:bg-zinc-800 text-[var(--ink)] dark:text-white"
        >
          Engage Protocol <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

// --- Rails Logic ---
const RecentRail = ({ history }: { history: RecentBook[] }) => {
  const router = useRouter();
  if (history.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--ink-muted)] flex items-center gap-3">
          <PlayCircle size={16} className="text-[var(--accent-primary)]" />
          Continue Reading
        </h3>
        <button className="text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
          Clear Registry History
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 px-1">
        {history.map((item, i) => (
          <div
            key={`${item.book_slug}-${i}`}
            onClick={() => router.push(`/read/${item.last_ref}`)}
            className="w-80 shrink-0 paper-card p-6 bg-white dark:bg-zinc-900 border-2 border-[var(--border-subtle)] hover:shadow-xl transition-all cursor-pointer group flex items-center gap-6"
          >
            <div className="w-20 h-28 bg-zinc-900 rounded-lg shadow-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-zinc-800">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/40" />
              <BookOpen size={24} className="text-white/20" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-bold text-[var(--ink)] dark:text-zinc-100 truncate uppercase tracking-tighter">
                {item.book_title}
              </h4>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-primary)] mt-1 mb-3">
                Position: {item.last_ref}
              </p>
              <div className="flex items-center gap-2 text-[9px] text-zinc-400 font-bold uppercase">
                <Clock size={10} />{" "}
                {new Date(item.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const DiscoverRail = ({ books }: { books: DiscoverBook[] }) => {
  const router = useRouter();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--ink-muted)] flex items-center gap-3">
          <Sparkles size={16} className="text-amber-500" />
          Discover Artifacts
        </h3>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-1">
        {books.map((book, i) => (
          <div
            key={`${book.slug}-${i}`}
            onClick={() => router.push(`/read/${book.slug}/1`)}
            className="w-56 shrink-0 paper-card p-8 bg-zinc-50 dark:bg-zinc-900/40 border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all cursor-pointer group text-center"
          >
            <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-zinc-100 dark:border-zinc-700 group-hover:scale-110 transition-transform">
              <Book
                size={20}
                className="text-zinc-400 group-hover:text-[var(--accent-primary)]"
              />
            </div>
            <h4 className="text-sm font-black uppercase tracking-tighter text-[var(--ink)] dark:text-zinc-100 leading-tight mb-2 line-clamp-1">
              {book.en_title}
            </h4>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)] opacity-60 truncate">
              {book.category_path.replace(/\./g, " › ")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<LibraryTab>("hub");
  const [isReady, setIsReady] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const { user } = useAuth();
  const { location } = useZmanim();
  const supabase = createClient();

  const [parasha, setParasha] = useState<PortionData | null>(null);
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [recentHistory, setRecentHistory] = useState<RecentBook[]>([]);
  const [discoverBooks, setDiscoverBooks] = useState<DiscoverBook[]>([]);

  const lat = location?.lat;
  const lng = location?.lng;
  const userId = user?.id;

  useEffect(() => {
    async function loadRegistryContext() {
      setIsDataLoading(true);
      const activeLat = lat || 32.7767;
      const activeLng = lng || -96.797;

      try {
        const shRes = await fetch(
          `https://www.hebcal.com/shabbat?cfg=json&latitude=${activeLat}&longitude=${activeLng}&m=50`
        );
        const shJson: HebcalResponse = await shRes.json();
        const pItems = shJson.items.filter(
          (i: ShabbatItem) => i.category === "parashat"
        );

        if (pItems.length > 0) {
          const pItem = pItems[0];
          const nextPItem = pItems[1];
          const hebcalName = pItem.title.replace("Parashat ", "");
          const nextHebcalName = nextPItem?.title.replace("Parashat ", "");

          const { data: blueprint } = await supabase
            .from("portion_library")
            .select("*")
            .or(`hebcal_name.eq."${hebcalName}",name.eq."${hebcalName}"`)
            .maybeSingle();
          if (blueprint) {
            setParasha({
              title: blueprint.name,
              translation: TRANSLATIONS[blueprint.name],
              nextTitle: nextHebcalName,
              torah: formatCitation(blueprint.start_ref, blueprint.end_ref),
              torahStartRef: blueprint.start_ref.replace(/\./g, "/"),
              haftarah: blueprint.secondary_ref
                ? formatCitation(
                    blueprint.secondary_ref,
                    blueprint.secondary_end_ref
                  )
                : "Reflection",
              haftarahStartRef: blueprint.secondary_ref
                ? blueprint.secondary_ref.replace(/\./g, "/")
                : "Isaiah/1/1",
              desc: blueprint.summary || "Weekly canonical registry portion.",
              longDesc: blueprint.long_summary,
              bookName: blueprint.start_ref.split(".")[0],
            });
            const { data: qData } = await supabase
              .from("portion_questions")
              .select("*")
              .eq("portion_id", blueprint.id);
            if (qData && qData.length > 0) {
              const randomQ = qData[Math.floor(Math.random() * qData.length)];
              setQuestion({
                text: randomQ.question_text,
                scholar: randomQ.scholar_name,
              });
            }
          }
        }

        if (userId) {
          const { data: historyData } = await supabase
            .from("recent_study_sessions")
            .select("*")
            .eq("user_id", userId)
            .limit(10);
          if (historyData) setRecentHistory(historyData);
        }

        const { data: randomBooks } = await supabase
          .schema("library")
          .from("books")
          .select("en_title, slug, category_path")
          .limit(10);
        if (randomBooks) setDiscoverBooks(randomBooks as DiscoverBook[]);
      } catch (err) {
        console.error("Hub Sync Failed", err);
      } finally {
        setIsDataLoading(false);
        setIsReady(true);
      }
    }
    loadRegistryContext();
  }, [lat, lng, supabase, userId]);

  return (
    <div className="min-h-screen bg-[var(--paper)] transition-colors duration-500 selection:bg-blue-100">
      <header className="sticky top-0 z-30 bg-[var(--paper)]/95 backdrop-blur-md transition-colors border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-4 shrink-0">
            <div className="p-2.5 bg-[var(--accent-primary)] rounded-2xl text-white shadow-sm">
              <Library size={20} />
            </div>
            <h1 className="text-xl font-medium tracking-tight text-[var(--ink)] leading-none hidden lg:block">
              DrashX{" "}
              <span className="text-[var(--ink-muted)] opacity-60 uppercase text-[10px] font-black tracking-[0.3em] ml-2">
                Library Hub
              </span>
            </h1>
          </div>
          <div className="flex-1 max-w-2xl mx-12">
            <div className="relative">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search registry artifacts..."
                className="architect-input w-full pl-12 pr-16 bg-[var(--surface-hover)] dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-zinc-800"
              />
            </div>
          </div>
          <div className="flex items-center shrink-0 gap-2">
            <button className="text-[var(--ink-muted)] p-3 hover:bg-[var(--surface-hover)] dark:hover:bg-zinc-800 rounded-full relative">
              <Bell size={20} />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[var(--paper)]" />
            </button>
          </div>
        </div>
        <nav className="flex items-center justify-center py-4 px-6 overflow-x-auto no-scrollbar">
          <div className="bg-[var(--surface-hover)] dark:bg-zinc-900/50 p-1 rounded-full flex gap-1 shadow-inner">
            {[
              { id: "hub", label: "My Hub", icon: Bookmark },
              { id: "catalog", label: "Catalog", icon: BookOpen },
              { id: "community", label: "Community", icon: Users },
              { id: "plans", label: "Plans", icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as LibraryTab)}
                className={cn(
                  "px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95",
                  activeTab === tab.id
                    ? "bg-white dark:bg-zinc-800 text-[var(--ink)] dark:text-white shadow-md"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                )}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 pb-32 relative z-10 space-y-24">
        {!isReady || isDataLoading ? (
          <div className="flex flex-col items-center justify-center py-48 gap-4">
            <Loader2
              className="animate-spin text-[var(--accent-primary)]"
              size={36}
            />
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--ink-muted)]">
              Synchronizing Hub...
            </p>
          </div>
        ) : (
          <>
            {activeTab === "hub" && (
              <>
                <PortionRow parasha={parasha} question={question} />
                <RecentRail history={recentHistory} />
                <DiscoverRail books={discoverBooks} />
              </>
            )}

            {activeTab === "catalog" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4">
                {[
                  "Torah",
                  "Prophets",
                  "Talmud",
                  "Midrash",
                  "Kabbalah",
                  "Chasidut",
                ].map((cat) => (
                  <div
                    key={cat}
                    className="paper-card p-10 cursor-pointer group hover:border-[var(--accent-primary)] transition-all bg-white dark:bg-zinc-900 border-2 border-[var(--border-subtle)]"
                  >
                    <h3 className="text-3xl font-normal tracking-tight mb-2 uppercase text-[var(--ink)] dark:text-white">
                      {cat}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--ink-muted)] opacity-60">
                      Canonical Collection
                    </p>
                    <div className="mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--ink)] dark:text-white">
                        Explore
                      </span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(activeTab === "community" || activeTab === "plans") && (
              <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-6">
                <div className="p-10 bg-zinc-50 dark:bg-zinc-900 rounded-full text-zinc-300 shadow-inner">
                  <Settings
                    size={40}
                    className="text-[var(--accent-primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-normal uppercase tracking-tight text-[var(--ink)] dark:text-white">
                    Under Development
                  </h3>
                  <p className="text-sm text-[var(--ink-muted)] max-w-xs mx-auto font-sans">
                    These registry features are being synchronized with the
                    annual cycle.
                  </p>
                </div>
              </div>
            )}
            <div className="hidden">
              <MoreHorizontal size={16} />
              <TrendingUp size={16} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
