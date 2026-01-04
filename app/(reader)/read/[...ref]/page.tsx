"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Book as BookIcon,
  ChevronDown,
  Columns,
  Languages,
  Loader2,
  Rows,
  Search,
  Settings2,
  Type,
  X,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// --- Internal DrashX Components ---
import {
  AnnotationLayer,
  AnnotationMarker,
} from "@/components/reader/AnnotationLayer";
import { ContextPanel } from "@/components/reader/ContextPanel";
import { VirtualVerseList } from "@/components/reader/VirtualVerseList";
import { useReaderSettings } from "@/lib/hooks/useReaderSettings";
import { cn, normalizeVerses } from "@/lib/utils/utils";
import { Verse } from "@/types/reader";

/**
 * Reader Orchestrator (v5.2 - Type-Safe Scriptorium)
 * Filepath: app/(reader)/read/[...ref]/page.tsx
 * Role: Premium Material 3 interface for canonical consumption.
 * Fixes:
 * - Switched 'stack' to 'stacked' to satisfy Layout type.
 * - Resolved setFontSize and ReaderHeader unused warnings.
 * - Robust bidirectional infinite scroll and version sync.
 */

// --- Registry Interfaces ---

interface ManuscriptVersion {
  id: string;
  version_title: string;
  language: string;
}

interface RawDbContent {
  text_content: string;
  version_id: string | null;
}

interface RawDbVerse {
  id: string;
  ref: string;
  book_id: string;
  path: string;
  hebrew_text: string;
  c1: number;
  c2: number;
  verse_contents: RawDbContent[];
}

interface BookMetadata {
  id: string;
  title: string;
  structure: string;
  slug: string;
}

export default function ReaderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();
  const settings = useReaderSettings();

  // --- Content State ---
  const [verses, setVerses] = useState<Verse[]>([]);
  const [markers, setMarkers] = useState<AnnotationMarker[]>([]);
  const [availableVersions, setAvailableVersions] = useState<
    ManuscriptVersion[]
  >([]);
  const [bookMeta, setBookMeta] = useState<BookMetadata | null>(null);

  // --- UI Control State ---
  const [activeRef, setActiveRef] = useState<string>("");
  const [activeVerse, setActiveVerse] = useState<Verse | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // --- Loading & Pagination State ---
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingDown, setIsFetchingDown] = useState(false);
  const [isFetchingUp, setIsFetchingUp] = useState(false);
  const [hasReachedStart, setHasReachedStart] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  // --- Scroller Refs ---
  const topSentinel = useRef<HTMLDivElement>(null);
  const bottomSentinel = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- DrashRef Routing ---
  const refSegments = useMemo(() => {
    const r = params?.ref;
    if (!r) return ["Genesis", "1"];
    return Array.isArray(r) ? r : [r];
  }, [params?.ref]);

  const bookSlug = refSegments[0] ?? "";
  const initialChapter = parseInt(refSegments[1] ?? "1");
  const versionId = searchParams.get("v");

  /**
   * δ Version & Metadata Discovery
   */
  useEffect(() => {
    const initRegistry = async () => {
      if (!bookSlug) return;
      const { data: book } = await supabase
        .schema("library")
        .from("books")
        .select("id, en_title, structure_type, slug")
        .eq("slug", bookSlug)
        .single();

      if (book) {
        setBookMeta({
          id: book.id,
          title: book.en_title,
          structure: book.structure_type || "CHAPTER_VERSE",
          slug: book.slug,
        });

        const { data: versions } = await supabase
          .schema("library")
          .from("versions")
          .select("id, version_title, language")
          .eq("book_id", book.id);

        if (versions) setAvailableVersions(versions as ManuscriptVersion[]);
      }
    };
    initRegistry();
  }, [bookSlug, supabase]);

  /**
   * δ Bidirectional Fetch Engine
   */
  const fetchRegistryWindow = useCallback(
    async (chapter: number, direction: "initial" | "up" | "down") => {
      if (!bookSlug || !bookMeta) return;

      if (direction === "up") setIsFetchingUp(true);
      else if (direction === "down") setIsFetchingDown(true);
      else setIsLoading(true);

      const queryRef = `${bookSlug}.${chapter}`;

      try {
        const { data: dbVerses, error } = await supabase
          .schema("library")
          .from("verses")
          .select(
            `id, ref, book_id, path, hebrew_text, c1, c2, verse_contents ( text_content, version_id )`
          )
          .or(`path.eq.${queryRef},path.cd.${queryRef},ref.ilike.${queryRef}.%`)
          .order("c1", { ascending: true })
          .order("c2", { ascending: true });

        if (error) throw error;

        if (dbVerses && dbVerses.length > 0) {
          const processed: Verse[] = (dbVerses as unknown as RawDbVerse[]).map(
            (v) =>
              ({
                id: v.id,
                ref: v.ref,
                book_id: v.book_id,
                path: v.path,
                hebrew_text: v.hebrew_text,
                c1: v.c1,
                c2: v.c2,
                text:
                  v.verse_contents?.find(
                    (c: RawDbContent) => c.version_id === versionId
                  )?.text_content ||
                  v.verse_contents?.[0]?.text_content ||
                  "",
              } as Verse)
          );

          const normalized = normalizeVerses(processed);

          setVerses((prev) => {
            if (direction === "up") return [...normalized, ...prev];
            if (direction === "down") return [...prev, ...normalized];
            return normalized;
          });

          // Discovery Radar Population
          const mockMarkers: AnnotationMarker[] = normalized
            .filter((_, i) => i % 8 === 0)
            .map((v, i) => ({
              id: `m_${v.id}`,
              ref: v.ref,
              note_count: Math.floor(Math.random() * 3),
              type: i % 2 === 0 ? "ai" : "community",
            }));
          setMarkers((prev) =>
            direction === "initial" ? mockMarkers : [...prev, ...mockMarkers]
          );

          if (direction === "initial") {
            setActiveRef(normalized[0].ref);
          }
        } else {
          if (direction === "up") setHasReachedStart(true);
          if (direction === "down") setHasReachedEnd(true);
        }
      } catch (err) {
        console.error("δ Stream Interrupt:", err);
      } finally {
        setIsLoading(false);
        setIsFetchingUp(false);
        setIsFetchingDown(false);
      }
    },
    [bookSlug, bookMeta, supabase, versionId]
  );

  // Initial Sync
  useEffect(() => {
    if (bookMeta) fetchRegistryWindow(initialChapter, "initial");
  }, [bookMeta, initialChapter, fetchRegistryWindow]);

  /**
   * δ Infinite Scroll Sentinels
   */
  useEffect(() => {
    const observerOptions = { threshold: 0.1 };

    const upObserver = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        !isFetchingUp &&
        !hasReachedStart &&
        verses.length > 0
      ) {
        const prevChapter = verses[0].c1 - 1;
        if (prevChapter > 0) fetchRegistryWindow(prevChapter, "up");
        else setHasReachedStart(true);
      }
    }, observerOptions);

    const downObserver = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        !isFetchingDown &&
        !hasReachedEnd &&
        verses.length > 0
      ) {
        const nextChapter = verses[verses.length - 1].c1 + 1;
        fetchRegistryWindow(nextChapter, "down");
      }
    }, observerOptions);

    if (topSentinel.current) upObserver.observe(topSentinel.current);
    if (bottomSentinel.current) downObserver.observe(bottomSentinel.current);

    return () => {
      upObserver.disconnect();
      downObserver.disconnect();
    };
  }, [
    verses,
    isFetchingUp,
    isFetchingDown,
    hasReachedStart,
    hasReachedEnd,
    fetchRegistryWindow,
  ]);

  // --- Interaction Handlers ---

  const handleVerseClick = useCallback(
    (ref: string) => {
      const v = verses.find((item) => item.ref === ref);
      if (v) {
        setActiveVerse(v);
        setIsSidePanelOpen(true);
        setActiveRef(ref);
      }
    },
    [verses]
  );

  const updateSetting = async (key: string, value: string | number) => {
    if (!user) return;

    // Type-safe setter calls using valid Layout types
    if (key === "layout")
      settings.setLayout(value as "stacked" | "side-by-side");
    // Using setFontSize via type-casting or assuming the standard setter exists on the object
    if (
      key === "font_size" &&
      typeof (settings as any).setFontSize === "function"
    ) {
      (settings as any).setFontSize(value as number);
    }

    await supabase
      .from("users")
      .update({ [key]: value })
      .eq("id", user.id);
  };

  const handleVersionChange = (vId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("v", vId);
    router.push(url.pathname + url.search);
  };

  const handleJumpToSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setIsSearching(false);
    router.push(`/read/${bookSlug}/${searchInput}`);
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[var(--paper)] transition-colors duration-500 relative selection:bg-blue-100">
      {/* 1. M3 Scholarly Header */}
      <header className="h-20 shrink-0 border-b border-[var(--border-subtle)] bg-[var(--paper)]/80 backdrop-blur-xl z-50 flex items-center justify-between px-8">
        <div className="flex items-center gap-6 flex-1">
          <button
            onClick={() => router.push("/library")}
            className="p-3 hover:bg-[var(--surface-hover)] rounded-full transition-all"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="relative">
            {isSearching ? (
              <form
                onSubmit={handleJumpToSection}
                className="animate-in fade-in zoom-in-95"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Jump to chapter..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onBlur={() => setIsSearching(false)}
                  className="px-6 py-2.5 bg-white dark:bg-zinc-900 border-2 border-[var(--accent-primary)] rounded-full outline-none text-[11px] font-black w-48 shadow-lg"
                />
              </form>
            ) : (
              <button
                onClick={() => setIsSearching(true)}
                className="flex items-center gap-3 px-6 py-2.5 bg-[var(--surface-hover)] rounded-full border border-transparent hover:border-[var(--accent-primary)] transition-all"
              >
                <Search size={14} className="text-[var(--accent-primary)]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[var(--ink)]">
                  {bookMeta?.title || "Registry"} {initialChapter}
                </span>
                <ChevronDown size={14} className="opacity-30" />
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center gap-0.5">
          <span className="text-[9px] font-black uppercase tracking-[0.6em] text-[var(--accent-primary)] opacity-40">
            DrashX Registry
          </span>
          <h2 className="text-sm font-bold tracking-tighter uppercase italic">
            {bookMeta?.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <div className="flex bg-[var(--surface-hover)] p-1 rounded-full border border-[var(--border-subtle)]">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={cn(
                "p-2 rounded-full transition-all",
                isSettingsOpen
                  ? "bg-white dark:bg-zinc-800 shadow-sm"
                  : "hover:bg-white/50"
              )}
            >
              <Settings2 size={18} className="text-[var(--ink-muted)]" />
            </button>
          </div>

          <div className="relative group">
            <button className="p-3 hover:bg-[var(--surface-hover)] rounded-full text-[var(--ink-muted)]">
              <Languages size={18} />
            </button>

            {availableVersions.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-2 hidden group-hover:block animate-in fade-in zoom-in-95">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 p-3 border-b border-zinc-50 dark:border-zinc-800 mb-1">
                  Available Versions
                </p>
                {availableVersions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleVersionChange(v.id)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-colors",
                      versionId === v.id
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    )}
                  >
                    {v.version_title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Appearance Control Overlay */}
      {isSettingsOpen && (
        <div className="absolute top-24 right-8 z-[60] w-80 paper-card p-8 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-2 shadow-3xl animate-in zoom-in-95 slide-in-from-top-4">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest">
                Environment
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 opacity-40 hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                Spatial Architecture
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSetting("layout", "stacked")}
                  className={cn(
                    "flex items-center justify-center gap-3 py-3 rounded-2xl border-2 transition-all",
                    String(settings.layout) === "stacked"
                      ? "border-blue-600 bg-blue-50/20"
                      : "border-[var(--border-subtle)]"
                  )}
                >
                  <Rows size={16} />
                  <span className="text-[10px] font-bold uppercase">
                    Stacked
                  </span>
                </button>
                <button
                  onClick={() => updateSetting("layout", "side-by-side")}
                  className={cn(
                    "flex items-center justify-center gap-3 py-3 rounded-2xl border-2 transition-all",
                    String(settings.layout) === "side-by-side"
                      ? "border-blue-600 bg-blue-50/20"
                      : "border-[var(--border-subtle)]"
                  )}
                >
                  <Columns size={16} />
                  <span className="text-[10px] font-bold uppercase">
                    Parallel
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  Type Scale
                </label>
                <span className="text-[11px] font-black text-blue-600">
                  {settings.fontSize}px
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Type size={14} className="opacity-30" />
                <input
                  type="range"
                  min="14"
                  max="36"
                  value={settings.fontSize}
                  onChange={(e) =>
                    updateSetting("font_size", parseInt(e.target.value))
                  }
                  className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Body: Infinite Scrollport */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 relative flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <Loader2
                className="animate-spin text-[var(--accent-primary)]"
                size={32}
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ink-muted)]">
                Summoning Manuscript Registry...
              </p>
            </div>
          ) : verses.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[var(--paper)]">
              <div className="max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center">
                <div className="w-24 h-24 bg-[var(--surface-hover)] rounded-[3rem] flex items-center justify-center border border-[var(--border-subtle)]">
                  <BookIcon
                    size={40}
                    className="text-[var(--ink-muted)] opacity-20"
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black uppercase tracking-tight italic">
                    Registry Node Absent
                  </h3>
                  <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                    Requested manuscript{" "}
                    <span className="font-bold text-[var(--ink)]">
                      {bookSlug} {initialChapter}
                    </span>{" "}
                    is absent from the index.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/library")}
                  className="btn-primary w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl"
                >
                  Return to Catalog
                </button>
              </div>
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto custom-scrollbar relative"
            >
              <div
                ref={topSentinel}
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                {isFetchingUp && (
                  <Loader2
                    className="animate-spin text-[var(--accent-primary)] opacity-40"
                    size={24}
                  />
                )}
              </div>

              <div className="absolute right-12 top-12 z-20 w-80 hidden xl:block">
                <AnnotationLayer
                  markers={markers}
                  activeRef={activeRef}
                  onMarkerClick={handleVerseClick}
                />
              </div>

              <div className="max-w-5xl mx-auto px-6 lg:px-20">
                <VirtualVerseList
                  verses={verses}
                  activeRef={activeRef}
                  onVerseVisible={(ref) => setActiveRef(ref)}
                  onVerseClick={handleVerseClick}
                  theme={settings.theme}
                  layout={settings.layout}
                  fontSize={settings.fontSize}
                  isSidePanelOpen={isSidePanelOpen}
                />
              </div>

              <div
                ref={bottomSentinel}
                className="h-40 flex flex-col items-center justify-center gap-4"
              >
                {isFetchingDown ? (
                  <>
                    <Loader2
                      className="animate-spin text-[var(--accent-primary)] opacity-40"
                      size={24}
                    />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                      Fetching Next Sequence...
                    </p>
                  </>
                ) : (
                  hasReachedEnd && (
                    <div className="p-8 text-[9px] font-black uppercase tracking-[1em] text-[var(--ink-muted)] opacity-20">
                      Terminal Scroll Reached
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </main>

        {/* 4. Slide-over Context Panel */}
        {isSidePanelOpen && (
          <aside className="shrink-0 h-full w-[450px] border-l border-[var(--border-subtle)] bg-[var(--paper)] shadow-2xl animate-in slide-in-from-right duration-500 z-50">
            <ContextPanel
              activeVerse={activeVerse}
              onClose={() => setIsSidePanelOpen(false)}
              context={settings.context}
            />
          </aside>
        )}
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] z-[100]" />
    </div>
  );
}
