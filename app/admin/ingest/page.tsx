"use client";

import { DrashButton } from "@/components/ui/DrashButton";
import {
  DrashCard,
  DrashCardContent,
  DrashCardHeader,
} from "@/components/ui/DrashCard";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, ChevronRight, Database, Layers } from "lucide-react";
import { useState } from "react";

/**
 * Ingest Orchestrator (v1.2 - Strict Type Safety)
 * Filepath: app/admin/ingest/page.tsx
 * Role: Admin tool to seed the 'library' schema with canonical manuscripts.
 * Logic: Handles Book metadata and 5-level hierarchical indexing (c1-c5).
 * Fix: Replaced 'any' types with strict interfaces for payload and ingest lists.
 */

interface IngestStats {
  bookTitle: string;
  totalVerses: number;
  currentProgress: number;
  status: "idle" | "ingesting" | "completed" | "error";
}

interface IngestPayload {
  book: string;
  heBook?: string;
  division: string;
  structure?: string;
  chapters: string[][];
}

interface VerseIngest {
  book_id: string;
  ref: string;
  path: string;
  hebrew_text: string;
  english_text: string;
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
}

export default function IngestPage() {
  const supabase = createClient();
  const [jsonInput, setJsonInput] = useState("");
  const [stats, setStats] = useState<IngestStats>({
    bookTitle: "",
    totalVerses: 0,
    currentProgress: 0,
    status: "idle",
  });
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) =>
    setLog((prev) =>
      [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10)
    );

  const runIngest = async () => {
    try {
      const data = JSON.parse(jsonInput) as IngestPayload;
      const { book, division, chapters } = data;

      // Expected schema depth: 2D Array [[v1, v2], [v1, v2]]
      setStats({
        bookTitle: book,
        totalVerses: chapters.flat().length,
        currentProgress: 0,
        status: "ingesting",
      });
      addLog(`Initializing manuscript: ${book}`);

      // 1. Create or Get Book Metadata
      const { data: bookRecord, error: bookError } = await supabase
        .schema("library")
        .from("books")
        .upsert(
          {
            slug: book.replace(/\s+/g, ""),
            en_title: book,
            he_title: data.heBook || book,
            category_path: division,
            structure_type: data.structure || "CHAPTER_VERSE",
          },
          { onConflict: "slug" }
        )
        .select()
        .single();

      if (bookError) throw bookError;
      addLog(`Book ID linked: ${bookRecord.id}`);

      // 2. Process Hierarchical Segments
      const batchSize = 50;
      let verseList: VerseIngest[] = [];
      let processedCount = 0;

      for (let cIdx = 0; cIdx < chapters.length; cIdx++) {
        const c1 = cIdx + 1; // Primary Level (e.g. Chapter)
        const verses = chapters[cIdx];

        for (let vIdx = 0; vIdx < verses.length; vIdx++) {
          const c2 = vIdx + 1; // Secondary Level (e.g. Verse)
          const ref = `${book}.${c1}.${c2}`;

          // GENERATE LTREE PATH: Division.Book.c1.c2
          const ltreePath = `${division}.${book}.${c1}.${c2}`.replace(
            /\s+/g,
            "_"
          );

          verseList.push({
            book_id: bookRecord.id,
            ref,
            path: ltreePath,
            hebrew_text: verses[vIdx],
            english_text: "",
            // 5-LEVEL INDEXING (Aligned with Schema Document)
            c1: c1,
            c2: c2,
            c3: 0, // Slot for Word-level or sub-segment
            c4: 0, // Slot for Variant or Tag
            c5: 0, // Reserved for Semantic Grouping
          });

          // 3. Batch Insert to the Library Schema
          if (
            verseList.length >= batchSize ||
            (cIdx === chapters.length - 1 && vIdx === verses.length - 1)
          ) {
            const { error: ingestError } = await supabase
              .schema("library")
              .from("verses")
              .insert(verseList);

            if (ingestError) throw ingestError;

            processedCount += verseList.length;
            setStats((prev) => ({ ...prev, currentProgress: processedCount }));
            addLog(`Ingested batch: ${processedCount} segments`);
            verseList = [];
          }
        }
      }

      setStats((prev) => ({ ...prev, status: "completed" }));
      addLog("Scriptorium fully populated with 5-layer logic.");
    } catch (err: unknown) {
      console.error(err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred during ingestion.";
      setStats((prev) => ({ ...prev, status: "error" }));
      addLog(`FATAL: ${errorMessage}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-12 space-y-10">
      <header className="space-y-2">
        <div className="flex items-center gap-3 text-amber-500">
          <Database size={24} />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">
            Internal Ingest Engine
          </span>
        </div>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">
          Manuscript Ingestion
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Input Area */}
        <div className="md:col-span-2 space-y-6">
          <DrashCard className="min-h-[400px] flex flex-col">
            <DrashCardHeader showDivider>
              <div className="flex items-center gap-3">
                <Layers size={16} className="text-zinc-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  JSON Payload
                </span>
              </div>
            </DrashCardHeader>
            <DrashCardContent className="flex-1 p-0">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{ "book": "Genesis", "division": "Torah", "chapters": [["Verse 1...", "Verse 2..."]] }'
                className="w-full h-full min-h-[300px] p-8 font-mono text-xs bg-zinc-50/50 border-none focus:ring-0 resize-none outline-none"
              />
            </DrashCardContent>
          </DrashCard>

          <DrashButton
            className="w-full"
            onClick={runIngest}
            disabled={!jsonInput || stats.status === "ingesting"}
            isLoading={stats.status === "ingesting"}
          >
            Initiate Ingestion Loop
          </DrashButton>
        </div>

        {/* Progress Sidebar */}
        <aside className="space-y-6">
          <DrashCard
            variant={stats.status === "completed" ? "chaver" : "default"}
          >
            <DrashCardContent className="p-8 space-y-6">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  Target
                </p>
                <p className="text-xl font-black text-zinc-900">
                  {stats.bookTitle || "No Active Target"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400">
                  <span>Progress</span>
                  <span>
                    {Math.round(
                      (stats.currentProgress / (stats.totalVerses || 1)) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-950 transition-all duration-500"
                    style={{
                      width: `${
                        (stats.currentProgress / (stats.totalVerses || 1)) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {stats.status === "completed" && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Ingestion Success
                  </span>
                </div>
              )}
            </DrashCardContent>
          </DrashCard>

          <div className="p-6 bg-zinc-900 rounded-[2rem] text-white space-y-4 shadow-xl">
            <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <ChevronRight size={12} /> System Log
            </h4>
            <div className="space-y-2">
              {log.map((entry, i) => (
                <p
                  key={i}
                  className="text-[10px] font-mono text-zinc-400 leading-relaxed truncate"
                >
                  {entry}
                </p>
              ))}
              {log.length === 0 && (
                <p className="text-[10px] italic text-zinc-600">
                  Awaiting registers...
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
