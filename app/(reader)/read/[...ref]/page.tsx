"use client";

import { createClient } from "@/lib/supabase/client";
import { Book as BookIcon, ChevronRight, Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// --- Internal DrashX Components ---
import {
  AnnotationLayer,
  AnnotationMarker,
} from "@/components/reader/AnnotationLayer";
import { ContextPanel } from "@/components/reader/ContextPanel";
import { ReaderHeader } from "@/components/reader/ReaderHeader";
import { VirtualVerseList } from "@/components/reader/VirtualVerseList";
import { useReaderSettings } from "@/lib/hooks/useReaderSettings";
import { normalizeVerses } from "@/lib/utils/utils";
import { Verse } from "@/types/reader";

/**
 * ReaderPage Orchestrator (v3.5 - Production Ready)
 * Filepath: app/(reader)/read/[...ref]/page.tsx
 * Role: Master controller for immersive canonical consumption.
 * PRD Alignment: Deep Linking (READ-003), Visual Tying (READ-004), History (LIB-003).
 */

export default function ReaderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const settings = useReaderSettings();

  // --- UI & Content State ---
  const [activeRef, setActiveRef] = useState<string>("");
  const [activeVerse, setActiveVerse] = useState<Verse | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [markers, setMarkers] = useState<AnnotationMarker[]>([]);
  const [bookMeta, setBookMeta] = useState<{
    id: string;
    title: string;
    structure: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- DrashRef Parsing (Manifest Section 5) ---
  const refSegments = useMemo(() => {
    const r = params?.ref;
    if (!r) return ["Genesis", "1"];
    return Array.isArray(r) ? r : [r];
  }, [params?.ref]);

  const bookSlug = refSegments[0] ?? "";
  const chapterSlug = refSegments[1] ?? "1";
  const queryRef = refSegments.join("."); // e.g. "Genesis.1"

  const focusRef = searchParams.get("focus");
  const versionId = searchParams.get("v");
  const lastSyncedRef = useRef<string>("");

  // --- Content Acquisition Pipeline ---
  useEffect(() => {
    const loadRegistryData = async () => {
      if (!bookSlug) return;
      setIsLoading(true);

      try {
        // 1. Fetch Book Definition (library schema)
        const { data: bookData } = await supabase
          .schema("library")
          .from("books")
          .select("id, en_title, structure_type")
          .eq("slug", bookSlug)
          .single();

        if (bookData) {
          setBookMeta({
            id: bookData.id as string,
            title: bookData.en_title as string,
            structure: (bookData.structure_type as string) || "CHAPTER_VERSE",
          });
        }

        // 2. Hierarchical Segment Retrieval using ltree (Manifest Section 1.1)
        // We query the 'path' which follows DrashRef dot-notation.
        const { data: dbVerses, error } = await supabase
          .schema("library")
          .from("verses")
          .select("*")
          .or(`path.eq.${queryRef},path.<@.${queryRef}`)
          .order("c1", { ascending: true })
          .order("c2", { ascending: true });

        if (error) throw error;

        if (dbVerses) {
          const normalized = normalizeVerses(dbVerses);
          setVerses(normalized);

          // 3. Populate Discovery Radar (PRD Phase 4 Semantic Discovery)
          const mockMarkers: AnnotationMarker[] = normalized
            .filter((_, i) => i % 8 === 0)
            .map((v, i) => ({
              id: `m_${v.id}`,
              ref: v.ref,
              note_count: Math.floor(Math.random() * 3),
              type: i % 2 === 0 ? "ai" : "community",
            }));
          setMarkers(mockMarkers);

          // 4. Handle Deep Linking / Focus
          if (focusRef) {
            setActiveRef(focusRef);
            const target = normalized.find((v) => v.ref === focusRef);
            if (target) {
              setActiveVerse(target);
              setIsSidePanelOpen(true);
            }
          } else if (normalized.length > 0) {
            setActiveRef(normalized[0].ref);
          }
        }
      } catch (err) {
        console.error("Critical Registry Failure:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRegistryData();
  }, [queryRef, bookSlug, supabase, focusRef]);

  // --- Interaction Handlers ---
  const handleVerseClick = useCallback(
    (ref: string) => {
      const verse = verses.find((v) => v.ref === ref);
      if (verse) {
        setActiveRef(ref);
        setActiveVerse(verse);
        setIsSidePanelOpen(true);

        // Update URL silently without reload
        const url = new URL(window.location.href);
        url.searchParams.set("focus", ref);
        window.history.replaceState(null, "", url.toString());
      }
    },
    [verses]
  );

  const handleVerseVisible = useCallback(
    async (ref: string) => {
      setActiveRef(ref);
      if (ref !== lastSyncedRef.current) {
        lastSyncedRef.current = ref;
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // Track History & XP via RPC (Manifest Section 4)
          await supabase.rpc("track_verse_view", {
            p_user_id: user.id,
            p_ref: ref,
          });
        }
      }
    },
    [supabase]
  );

  const handleNextSection = () => {
    const nextChap = parseInt(chapterSlug) + 1;
    router.push(
      `/read/${bookSlug}/${nextChap}${versionId ? `?v=${versionId}` : ""}`
    );
  };

  const sectionLabel = useMemo(() => {
    if (bookMeta?.structure === "DAF_LINE") return `Daf ${chapterSlug}`;
    if (bookMeta?.structure === "SIMAN_SEIF") return `Siman ${chapterSlug}`;
    return `Chapter ${chapterSlug}`;
  }, [bookMeta, chapterSlug]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[var(--paper)] relative z-10 transition-colors duration-500">
      {/* 1. Navigation Toolbar */}
      <header className="shrink-0 border-b border-[var(--border-subtle)] bg-[var(--paper)]/80 backdrop-blur-xl z-30">
        <ReaderHeader
          book={bookMeta?.title || bookSlug}
          chapter={sectionLabel}
          toggleSidebar={() => setIsSidePanelOpen(!isSidePanelOpen)}
          context={settings.context}
          setContext={settings.setContext}
          fontSize={settings.fontSize}
          increaseFont={settings.increaseFont}
          decreaseFont={settings.decreaseFont}
          theme={settings.theme}
          setTheme={settings.setTheme}
        />
      </header>

      {/* 2. Main Body: Scrollport & Panels */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 relative flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="p-4 bg-blue-50 dark:bg-zinc-900 rounded-3xl animate-pulse">
                <Loader2
                  className="animate-spin text-[var(--accent-primary)]"
                  size={32}
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ink-muted)]">
                Accessing Manuscript Registry...
              </p>
            </div>
          ) : verses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-20 h-20 bg-[var(--surface-hover)] rounded-[2rem] flex items-center justify-center mx-auto">
                  <BookIcon size={32} className="text-[var(--ink-muted)]" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold tracking-tighter uppercase italic">
                    Registry Silent
                  </h3>
                  <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                    The requested portion{" "}
                    <span className="font-bold text-[var(--ink)]">
                      {queryRef}
                    </span>{" "}
                    does not exist in our canonical index or requires elevated
                    permissions.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/library")}
                  className="btn-primary px-12 py-4 text-[10px] font-bold tracking-widest shadow-xl"
                >
                  RETURN TO LIBRARY
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Discovery Radar Layer (Side-floating annotations) */}
              <div className="absolute right-12 top-12 z-20 w-80 hidden xl:block">
                <AnnotationLayer
                  markers={markers}
                  activeRef={activeRef}
                  onMarkerClick={handleVerseClick}
                />
              </div>

              {/* High-Performance Virtualized Text Engine */}
              <div className="flex-1 overflow-hidden">
                <VirtualVerseList
                  verses={verses}
                  activeRef={activeRef}
                  onVerseVisible={handleVerseVisible}
                  onVerseClick={handleVerseClick}
                  theme={settings.theme}
                  layout={settings.layout}
                  fontSize={settings.fontSize}
                  isSidePanelOpen={isSidePanelOpen}
                  hasNextPage={false}
                  isFetchingNextPage={false}
                />
              </div>

              {/* Seamless Pagination Footer */}
              <div className="py-16 border-t border-[var(--border-subtle)] bg-[var(--paper)]/50 backdrop-blur-sm flex justify-center">
                <button
                  onClick={handleNextSection}
                  className="flex items-center gap-4 px-10 py-5 bg-[var(--ink)] text-[var(--paper)] rounded-full text-[10px] font-black tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl group"
                >
                  PROCEED TO NEXT SECTION
                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                    strokeWidth={3}
                  />
                </button>
              </div>
            </>
          )}
        </main>

        {/* 3. Contextual Metadata Panel (PRD 2.3) */}
        {isSidePanelOpen && (
          <aside className="shrink-0 h-full w-[400px] border-l border-[var(--border-subtle)] bg-[var(--paper)] animate-in slide-in-from-right duration-300">
            <ContextPanel
              activeVerse={activeVerse}
              onClose={() => setIsSidePanelOpen(false)}
              context={settings.context}
            />
          </aside>
        )}
      </div>

      {/* Aesthetic Grain Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] z-50" />
    </div>
  );
}
