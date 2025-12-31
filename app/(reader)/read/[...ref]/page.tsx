"use client";

import { createClient } from "@/lib/supabase/client";
import { ChevronRight, Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// --- Imports from Refactored Architecture ---
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
 * ReaderPage Orchestrator (v3.2)
 * Filepath: app/(reader)/read/[...ref]/page.tsx
 * Role: Master controller for the immersive reading experience.
 * PRD Alignment: Deep Linking (READ-003), Analytics (AUD-001), History (LIB-003).
 * Fixes: Removed redundant ReaderLayout dependency and invalid client-side metadata export.
 */

export default function ReaderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const settings = useReaderSettings();

  // --- UI State ---
  const [activeRef, setActiveRef] = useState<string>("");
  const [activeVerse, setActiveVerse] = useState<Verse | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // --- Data State ---
  const [verses, setVerses] = useState<Verse[]>([]);
  const [markers, setMarkers] = useState<AnnotationMarker[]>([]);
  const [bookMeta, setBookMeta] = useState<{
    id: string;
    title: string;
    structure: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Ref Parsing ---
  const refSegments = useMemo(() => {
    const r = params?.ref;
    if (!r) return ["Genesis", "1"];
    return Array.isArray(r) ? r : [r];
  }, [params?.ref]);

  const bookSlug = refSegments[0] ?? "";
  const chapterSlug = refSegments[1] ?? "1";
  const queryRef = refSegments.join(".");

  const focusRef = searchParams.get("focus");
  const versionId = searchParams.get("v");

  const lastSyncedRef = useRef<string>("");

  // --- Data Fetching ---
  useEffect(() => {
    const loadData = async () => {
      if (!bookSlug) return;

      setIsLoading(true);
      try {
        // 1. Fetch Book Metadata
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

        // 2. Fetch Verses using ltree path
        const pathPrefix = queryRef.replace(/\./g, "_");
        const { data: dbVerses, error } = await supabase
          .schema("library")
          .from("verses")
          .select("*")
          .or(`path.eq.${pathPrefix},path.<@.${pathPrefix}`)
          .order("c1", { ascending: true })
          .order("c2", { ascending: true });

        if (error) throw error;

        if (dbVerses) {
          const normalized = normalizeVerses(dbVerses);
          setVerses(normalized);

          // Mocking markers for the AnnotationLayer based on content density (PRD Discovery)
          const mockMarkers: AnnotationMarker[] = normalized
            .filter((_, i) => i % 5 === 0)
            .map((v, i) => ({
              id: `marker_${i}`,
              ref: v.ref,
              note_count: Math.floor(Math.random() * 5) + 1,
              type: i % 3 === 0 ? "ai" : i % 3 === 1 ? "personal" : "community",
            }));
          setMarkers(mockMarkers);

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
        console.error("Reader Load Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [queryRef, focusRef, bookSlug, versionId, supabase]);

  // --- Handlers ---

  const handleVerseClick = useCallback(
    (ref: string) => {
      const verse = verses.find((v) => v.ref === ref);
      if (verse) {
        setActiveRef(ref);
        setActiveVerse(verse);
        setIsSidePanelOpen(true);

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
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          await supabase.rpc("track_verse_view", {
            p_user_id: authData.user.id,
            p_ref: ref,
          });
        }
      }
    },
    [supabase]
  );

  const handleSidebarToggle = () => setIsSidePanelOpen(!isSidePanelOpen);

  const handleNextChapter = () => {
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
    <div className="flex flex-col h-screen w-full overflow-hidden bg-paper relative z-10">
      {/* 1. Scholarly Header (AA Settings & Breadcrumbs) */}
      <div className="shrink-0">
        <ReaderHeader
          book={bookMeta?.title || bookSlug}
          chapter={sectionLabel}
          toggleSidebar={handleSidebarToggle}
          context={settings.context}
          setContext={settings.setContext}
          fontSize={settings.fontSize}
          increaseFont={settings.increaseFont}
          decreaseFont={settings.decreaseFont}
          theme={settings.theme}
          setTheme={settings.setTheme}
        />
      </div>

      {/* 2. Main Body Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Manuscript Area */}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-400">
              <Loader2 className="animate-spin text-zinc-300" size={32} />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                Summoning the Canon...
              </p>
            </div>
          ) : verses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-10 text-center">
              <p className="text-2xl font-black mb-4 text-zinc-900 font-serif italic uppercase tracking-tighter">
                This section is silent.
              </p>
              <p className="text-xs font-medium max-w-xs mx-auto mb-10 text-zinc-400 leading-relaxed">
                The manuscript registers for {queryRef} are empty or restricted.
              </p>
              <button
                onClick={() => router.push("/library")}
                className="px-10 py-4 bg-zinc-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] shadow-2xl active:scale-95 transition-all"
              >
                Return to library
              </button>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col relative">
              {/* Floating Discovery Radar Layer (PRD 3.2) */}
              <div className="absolute right-8 top-8 z-20 w-80 hidden xl:block pointer-events-auto">
                <AnnotationLayer
                  markers={markers}
                  activeRef={activeRef}
                  onMarkerClick={handleVerseClick}
                />
              </div>

              {/* Scrollable Virtualized Text Engine */}
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

              {/* Seamless Navigation Footer */}
              <div className="py-12 text-center border-t border-zinc-100 bg-white/80 backdrop-blur-xl">
                <button
                  onClick={handleNextChapter}
                  className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] hover:text-zinc-950 transition-all flex items-center justify-center gap-4 mx-auto group ring-1 ring-zinc-100 px-8 py-4 rounded-full hover:ring-zinc-950 hover:shadow-2xl"
                >
                  <span className="group-hover:translate-x-[-2px] transition-transform">
                    Proceed to Next Section
                  </span>
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-[2px] transition-transform text-amber-500"
                  />
                </button>
              </div>
            </div>
          )}
        </main>

        {/* 3. Contextual Metadata Panel (Right Sidebar) */}
        {isSidePanelOpen && (
          <div className="shrink-0 h-full">
            <ContextPanel
              activeVerse={activeVerse}
              onClose={() => setIsSidePanelOpen(false)}
              context={settings.context}
            />
          </div>
        )}
      </div>

      {/* Subtle Paper Texture Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] z-50" />
    </div>
  );
}
