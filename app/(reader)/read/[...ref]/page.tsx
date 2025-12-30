// Filepath: app/(reader)/read/[...ref]/page.tsx

"use client";

import { ChevronRight, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// --- Imports from Refactored Architecture ---
import { SideNav } from "@/components/layout/SideNav";
import { ContextPanel } from "@/components/reader/ContextPanel";
import { ReaderHeader } from "@/components/reader/ReaderHeader";
import { ReaderLayout } from "@/components/reader/ReaderLayout";
import { VerseSegment } from "@/components/reader/VerseSegment";
import { useReaderSettings } from "@/lib/hooks/useReaderSettings";
import { Verse } from "@/types/reader"; // Ensure this matches your type definition path

// --- Mock Data Service (Simulating Supabase Fetch) ---
const MOCK_VERSES_DATA: Verse[] = [
  {
    ref: "Genesis.1.1",
    he: "בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃",
    en: "In the beginning God created the heaven and the earth.",
    c1: 1,
    c2: 1,
  },
  {
    ref: "Genesis.1.2",
    he: "וְהָאָ֗רֶץ הָיְתָ֥ה תֹ֙הוּ֙ וָבֹ֔הוּ וְחֹ֖שֶׁךְ עַל־פְּנֵ֣י תְה֑וֹם וְר֣וּחַ אֱלֹהִ֔ים מְרַחֶ֖פֶת עַל־פְּנֵ֥י הַמָּֽיִם׃",
    en: "Now the earth was unformed and void, and darkness was upon the face of the deep; and the spirit of God hovered over the face of the waters.",
    c1: 1,
    c2: 2,
  },
  {
    ref: "Genesis.1.3",
    he: "וַיֹּ֥אמֶר אֱלֹהִ֖ים יְהִ֣י א֑וֹר וַֽיְהִי־אֽוֹר׃",
    en: "And God said: Let there be light. And there was light.",
    c1: 1,
    c2: 3,
  },
  {
    ref: "Genesis.1.4",
    he: "וַיַּ֧רְא אֱלֹהִ֛ים אֶת־הָא֖וֹר כִּי־ט֑וֹב וַיַּבְדֵּ֣ל אֱלֹהִ֔ים בֵּ֥ין הָא֖וֹר וּבֵ֥ין הַחֹֽשֶׁךְ׃",
    en: "And God saw the light, that it was good; and God divided the light from the darkness.",
    c1: 1,
    c2: 4,
  },
  {
    ref: "Genesis.1.5",
    he: "וַיִּקְרָ֨א אֱלֹהִ֤ים ׀ לָאֹור֙ י֔וֹם וְלַחֹ֖שֶׁךְ קָ֣רָא לָ֑יְלָה וַֽיְהִי־עֶ֥רֶב וַֽיְהִי־בֹ֖קֶר י֥וֹם אֶחָֽד׃",
    en: "And God called the light Day, and the darkness He called Night. And there was evening and there was morning, one day.",
    c1: 1,
    c2: 5,
  },
];

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();

  // 1. Hook Integration (State Management)
  const settings = useReaderSettings(); // theme, fontSize, context, setters...

  // 2. Local UI State
  const [activeNavTab, setActiveNavTab] = useState("library");
  const [activeVerse, setActiveVerse] = useState<Verse | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Route Parsing (Genesis.1 -> Book: Genesis, Chapter: 1)
  // params.ref is string[] (e.g. ['Genesis', '1'])
  const bookSlug = params.ref?.[0] || "Genesis";
  const chapterSlug = params.ref?.[1] || "1";

  const displayBookTitle = bookSlug.charAt(0).toUpperCase() + bookSlug.slice(1);

  // 4. Data Fetching Effect
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 600));

      // In production: const data = await supabase.from('verses').select('*')...
      setVerses(MOCK_VERSES_DATA);
      setIsLoading(false);
    };

    loadData();
  }, [bookSlug, chapterSlug]);

  // 5. Interaction Handlers
  const handleVerseClick = (verse: Verse) => {
    setActiveVerse(verse);
    setIsSidePanelOpen(true);
  };

  const handleSidebarToggle = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  return (
    <ReaderLayout
      theme={settings.theme}
      // A. Global Navigation
      sideNav={
        <SideNav
          activeTab={activeNavTab}
          setActiveTab={(tab: string) => {
            // Added explicit type annotation here
            setActiveNavTab(tab);
            if (tab === "library") router.push("/library");
          }}
        />
      }
      // B. Header Toolbar
      header={
        <ReaderHeader
          book={displayBookTitle}
          chapter={chapterSlug}
          toggleSidebar={handleSidebarToggle}
          // Pass settings from hook
          context={settings.context}
          setContext={settings.setContext}
          fontSize={settings.fontSize}
          increaseFont={settings.increaseFont}
          decreaseFont={settings.decreaseFont}
          theme={settings.theme}
          setTheme={settings.setTheme}
        />
      }
      // C. Right Context Panel
      sidePanel={
        <ContextPanel
          isOpen={isSidePanelOpen}
          activeVerse={activeVerse}
          onClose={() => setIsSidePanelOpen(false)}
          context={settings.context}
        />
      }
    >
      {/* D. Main Content (Scrollport) */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4 text-zinc-400">
          <Loader2 className="animate-spin text-zinc-300" size={32} />
          <p className="text-xs font-bold uppercase tracking-widest">
            Summoning the Canon...
          </p>
        </div>
      ) : (
        <div
          className={`min-h-screen transition-colors ${
            settings.theme === "dark" ? "bg-zinc-950" : "bg-transparent"
          }`}
        >
          {verses.map((verse) => (
            <VerseSegment
              key={verse.ref}
              verse={verse}
              isActive={activeVerse?.ref === verse.ref}
              onClick={handleVerseClick}
              theme={settings.theme}
              fontSize={settings.fontSize}
            />
          ))}

          {/* Infinite Scroll Trigger */}
          <div className="py-16 text-center">
            <button className="text-zinc-400 text-sm hover:text-zinc-600 transition-colors flex items-center justify-center gap-2 mx-auto group">
              <span className="group-hover:underline">
                Load Chapter {parseInt(chapterSlug) + 1}
              </span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </ReaderLayout>
  );
}
