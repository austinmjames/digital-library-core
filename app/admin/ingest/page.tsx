"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  createClient as createSupabaseClient,
  SupabaseClient,
} from "@supabase/supabase-js";
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  Folder,
  Home,
  Layers,
  Loader2,
  Lock as LockIcon,
  PlayCircle,
  Search,
  Settings2,
  Terminal,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

// ETL Data Imports
import sefariaDirectoryData from "@/lib/etl/sefaria_full_directory.json";

/**
 * Ingestion Orchestrator (v21.9 - Clean & Type-Safe)
 * Filepath: app/admin/ingest/page.tsx
 * Role: Master ETL Controller for DrashX Library.
 * PRD Alignment: Ingestion Strategy (Section 3).
 * Fixes: Resolved all linting errors (unused variables, type mismatches, missing LogTypes).
 */

// --- Configuration ---
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || "";
const GITHUB_HEADERS: Record<string, string> = GITHUB_TOKEN
  ? { Authorization: `token ${GITHUB_TOKEN}` }
  : {};

const PRIMARY_VERSION_PATTERNS = [
  "merged",
  "JPS 1917",
  "Community Translation",
  "Masorah",
];
const CHUNK_SIZE = 50;
const DB_TIMEOUT_MS = 60000;

// --- Interfaces ---
type LogType =
  | "info"
  | "success"
  | "error"
  | "loading"
  | "database"
  | "network"
  | "warning";
type RegistryLanguage = "all" | "English" | "Hebrew";

interface LogEntry {
  type: LogType;
  message: string;
  timestamp: string;
}

interface IngestStats {
  bookTitle: string;
  totalItems: number;
  currentProgress: number;
  status:
    | "idle"
    | "fetching"
    | "ingesting"
    | "completed"
    | "error"
    | "stalled"
    | "batching"
    | "testing";
  activeVersions: { id: string; title: string; status: string }[];
  throughput: number;
  startTime?: number;
  batchTotal?: number;
  batchCompleted?: number;
}

interface Manuscript {
  book: string;
  slug: string;
  language: string;
  version: string;
  categories: string[];
  githubPath: string;
  rawUrl: string;
}

type SefariaContent =
  | string
  | SefariaContent[]
  | { [key: string]: SefariaContent };

interface GitHubContentItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: "file" | "dir";
}

interface SefariaDirectory {
  completed_dirs: string[];
  last_sync: string;
}

interface IngestedVerseRef {
  id: string;
  ref: string;
  c2: number;
}

interface VersionRecord {
  id: string;
  version_title: string;
}

interface VersePayload {
  book_id: string;
  root_category: string;
  ref: string;
  hebrew_text: string;
  c1: number;
  c2: number;
}

interface SatellitePayload {
  verse_id: string;
  version_id: string;
  root_category: string;
  text_content: string;
}

interface DrashDatabase {
  library: {
    Tables: Record<
      string,
      {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      }
    >;
  };
  public: {
    Tables: Record<
      string,
      {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      }
    >;
  };
}

// --- Utilities ---
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const safeDecode = (str: string) => {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
};

const stringifySefariaSegment = (seg: SefariaContent): string => {
  if (typeof seg === "string") return seg;
  if (Array.isArray(seg)) {
    return seg
      .map((item) => stringifySefariaSegment(item))
      .filter((s) => s.length > 0)
      .join(" ");
  }
  return "";
};

const sanitizeRefLabel = (str: string) => {
  return str
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^(\d)/, "v_$1");
};

export default function AdminIngestPage() {
  const { profile, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const logEndRef = useRef<HTMLDivElement>(null);

  // --- State: Infrastructure ---
  const [useServiceRole, setUseServiceRole] = useState(false);
  const [customServiceKey, setCustomServiceKey] = useState("");
  const [targetSchema, setTargetSchema] = useState<"library" | "public">(
    "library"
  );
  const [skipMetadata, setSkipMetadata] = useState(false);

  // --- State: Navigation & Discovery ---
  const [searchQuery, setSearchQuery] = useState("");
  const [pathSegments, setPathSegments] = useState<string[]>([]);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [hebrewVersion, setHebrewVersion] = useState<Manuscript | null>(null);
  const [englishVersions, setEnglishVersions] = useState<Manuscript[]>([]);

  // --- State: Orchestration ---
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isBatching, setIsBatching] = useState(false);
  const [filterLang, setFilterLang] = useState<RegistryLanguage>("all");

  const [stats, setStats] = useState<IngestStats>({
    bookTitle: "",
    totalItems: 0,
    currentProgress: 0,
    status: "idle",
    activeVersions: [],
    throughput: 0,
  });

  const cachedClient = useRef<SupabaseClient<
    DrashDatabase,
    "library" | "public"
  > | null>(null);

  const getActiveClient = (): SupabaseClient<
    DrashDatabase,
    "library" | "public"
  > => {
    if (useServiceRole && customServiceKey) {
      if (cachedClient.current) return cachedClient.current;
      const newClient = createSupabaseClient<
        DrashDatabase,
        "library" | "public"
      >(process.env.NEXT_PUBLIC_SUPABASE_URL!, customServiceKey, {
        db: { schema: targetSchema },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      cachedClient.current = newClient;
      return newClient;
    }
    return createClient() as unknown as SupabaseClient<
      DrashDatabase,
      "library" | "public"
    >;
  };

  useEffect(() => {
    cachedClient.current = null;
  }, [customServiceKey, targetSchema, useServiceRole]);

  const addLog = (message: string, type: LogType = "info") => {
    setLogs((prev) =>
      [
        {
          message,
          type,
          timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        },
        ...prev,
      ].slice(0, 100)
    );
  };

  const dbCall = async <T,>(
    promise: PromiseLike<T>,
    label: string
  ): Promise<T> => {
    const timeout = new Promise<T>((_, reject) =>
      setTimeout(() => {
        setStats((prev) => ({ ...prev, status: "stalled" }));
        reject(new Error(`DB Timeout [${label}] - 60s limit reached.`));
      }, DB_TIMEOUT_MS)
    );
    try {
      const result = await Promise.race([promise as Promise<T>, timeout]);
      const potentialError = (result as { error?: unknown }).error;
      if (potentialError) throw potentialError;
      return result;
    } catch (err: unknown) {
      throw new Error((err as Error).message || String(err));
    }
  };

  const testConnection = async () => {
    setStats((prev) => ({ ...prev, status: "testing" }));
    addLog(
      `δ Infrastructure: Verifying access for ${targetSchema}...`,
      "database"
    );
    const client = getActiveClient();
    try {
      const response = await client
        .schema(targetSchema)
        .from("categories")
        .select("count", { count: "exact", head: true });
      if (response.error) throw response.error;
      addLog(`δ Success: ${targetSchema} schema verified.`, "success");
      setStats((prev) => ({ ...prev, status: "idle" }));
    } catch (err: unknown) {
      addLog(
        `δ Critical: ${targetSchema} unreachable. ${(err as Error).message}`,
        "error"
      );
      setStats((prev) => ({ ...prev, status: "stalled" }));
    }
  };

  const directoryItems = useMemo(() => {
    const dir = sefariaDirectoryData as unknown as SefariaDirectory;
    const navPaths = dir.completed_dirs.map((p: string) =>
      safeDecode(p)
        .replace(/^json\//, "")
        .replace(/\/$/, "")
        .split("/")
        .filter(Boolean)
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const seen = new Set<string>();
      return navPaths
        .filter((p: string[]) => {
          const k = p.join("/");
          if (seen.has(k)) return false;
          seen.add(k);
          return k.toLowerCase().includes(q);
        })
        .map((p: string[]) => ({ path: p, isMatch: true }));
    }

    const children = new Set<string>();
    const depth = pathSegments.length;
    navPaths.forEach((p: string[]) => {
      if (pathSegments.every((s, i) => p[i] === s) && p.length > depth) {
        children.add(p[depth]);
      }
    });

    return Array.from(children).map((name: string) => ({
      path: [...pathSegments, name],
      isMatch: false,
    }));
  }, [searchQuery, pathSegments]);

  const performIngestion = async (
    heb: Manuscript,
    engs: Manuscript[],
    currentPath: string[]
  ) => {
    const client = getActiveClient();
    const rootCat = currentPath[0] || "Other";
    const startTime = Date.now();
    const safeBookRefPart = sanitizeRefLabel(heb.book);

    addLog(`δ ETL: Synchronizing ${heb.book}...`, "loading");

    let bookId = "";

    if (!skipMetadata) {
      try {
        for (let i = 1; i <= currentPath.length; i++) {
          const subSegments = currentPath.slice(0, i);
          const subPath = subSegments.map((s) => sanitizeRefLabel(s)).join(".");
          await dbCall(
            client
              .schema(targetSchema)
              .from("categories")
              .upsert(
                {
                  path: subPath,
                  slug: subPath.toLowerCase().replace(/\./g, "-"),
                  en_title: subSegments[subSegments.length - 1],
                  he_title: subSegments[subSegments.length - 1],
                },
                { onConflict: "path" }
              ),
            `Category [${subPath}]`
          );
        }
      } catch (err: unknown) {
        throw new Error(`Spine Sync Error: ${(err as Error).message}`);
      }

      const bookResponse = await dbCall(
        client
          .schema(targetSchema)
          .from("books")
          .upsert(
            {
              slug: heb.slug,
              category_path: currentPath
                .map((s) => sanitizeRefLabel(s))
                .join("."),
              en_title: heb.book,
              he_title: heb.book,
              structure_type: currentPath.includes("Talmud")
                ? "DAF_LINE"
                : "CHAPTER_VERSE",
              text_depth: currentPath.includes("Commentary") ? 3 : 2,
            },
            { onConflict: "slug" }
          )
          .select("id")
          .single(),
        "Book Identity"
      );

      bookId = (bookResponse.data as { id: string }).id;

      const versionMap = new Map<
        string,
        { book_id: string; language: string; version_title: string }
      >();
      versionMap.set(heb.version, {
        book_id: bookId,
        language: "he",
        version_title: heb.version,
      });
      engs.forEach((v) => {
        versionMap.set(v.version, {
          book_id: bookId,
          language: "en",
          version_title: v.version,
        });
      });
      await dbCall(
        client
          .schema(targetSchema)
          .from("versions")
          .upsert(Array.from(versionMap.values()), {
            onConflict: "book_id, version_title",
          }),
        "Version Mapping"
      );
    } else {
      const existing = await client
        .schema(targetSchema)
        .from("books")
        .select("id")
        .eq("slug", heb.slug)
        .single();
      if (!existing.data)
        throw new Error(`Book lookup failed for '${heb.slug}'.`);
      bookId = (existing.data as { id: string }).id;
    }

    const json = await (await fetch(heb.rawUrl)).json();
    const rawHeb = json.he || json.text;

    const engStreams = await Promise.all(
      engs.map(async (v) => {
        const r = await fetch(v.rawUrl);
        if (!r.ok) return { title: v.version, data: [] as SefariaContent[] };
        const j = await r.json();
        const content = j.text || j.he || [];
        return {
          title: v.version,
          data: (Array.isArray(content)
            ? content
            : [content]) as SefariaContent[],
        };
      })
    );

    const vMapResponse = await client
      .schema(targetSchema)
      .from("versions")
      .select("id, version_title")
      .eq("book_id", bookId);
    const versionRecords = (vMapResponse.data || []) as VersionRecord[];

    const hebData = (
      Array.isArray(rawHeb) ? rawHeb : [rawHeb]
    ) as SefariaContent[];
    setStats((prev) => ({
      ...prev,
      status: "ingesting",
      totalItems: hebData.length,
      bookTitle: heb.book,
      startTime: Date.now(),
    }));

    for (let cIdx = 0; cIdx < hebData.length; cIdx++) {
      const chNum = cIdx + 1;
      const verses = (
        Array.isArray(hebData[cIdx]) ? hebData[cIdx] : [hebData[cIdx]]
      ) as SefariaContent[];

      const payload: VersePayload[] = verses
        .map((v: SefariaContent, vIdx: number) => ({
          book_id: bookId,
          root_category: rootCat,
          ref: `${safeBookRefPart}.${chNum}.${vIdx + 1}`,
          hebrew_text: stringifySefariaSegment(v),
          c1: chNum,
          c2: vIdx + 1,
        }))
        .filter((v) => v.hebrew_text.trim());

      if (payload.length > 0) {
        for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
          const chunk = payload.slice(i, i + CHUNK_SIZE);
          const insertedResponse = await dbCall(
            client
              .schema(targetSchema)
              .from("verses")
              .upsert(chunk, { onConflict: "book_id, ref, root_category" })
              .select("id, ref, c2"),
            `Write Ch ${chNum}`
          );

          const satellitePayload: SatellitePayload[] = [];
          (insertedResponse.data as IngestedVerseRef[]).forEach(
            (iv: IngestedVerseRef) => {
              engStreams.forEach((stream) => {
                const versionId = versionRecords.find(
                  (vr) => vr.version_title === stream.title
                )?.id;
                const chapterData = stream.data[cIdx];
                const verseData = Array.isArray(chapterData)
                  ? chapterData[iv.c2 - 1]
                  : null;
                if (versionId && verseData) {
                  satellitePayload.push({
                    verse_id: iv.id,
                    version_id: versionId,
                    root_category: rootCat,
                    text_content: stringifySefariaSegment(verseData),
                  });
                }
              });
            }
          );

          if (satellitePayload.length > 0) {
            await client
              .schema(targetSchema)
              .from("verse_contents")
              .upsert(satellitePayload, {
                onConflict: "verse_id, version_id, root_category",
              });
          }
        }
        const currentBatchTime =
          (Date.now() - (startTime || Date.now())) / 1000;
        setStats((prev) => ({
          ...prev,
          currentProgress: cIdx + 1,
          throughput:
            currentBatchTime > 0
              ? Math.round((cIdx + 1) / currentBatchTime)
              : 0,
        }));
        await sleep(30);
      }
    }
    addLog(`δ Success: ${heb.book} synchronized.`, "success");
  };

  const discoverBooksLocally = async (path: string[]): Promise<string[][]> => {
    addLog(`ν Discovery: Mapping nodes for ${path.join(".")}...`, "info");
    const dir = sefariaDirectoryData as unknown as SefariaDirectory;
    const targetSegments = ["json", ...path.map((s) => s.toLowerCase())];
    const bookPathsMap = new Map<string, string[]>();

    dir.completed_dirs.forEach((d) => {
      const decoded = safeDecode(d);
      const entrySegments = decoded.split("/").filter(Boolean);
      const entrySegmentsLower = entrySegments.map((s) => s.toLowerCase());
      if (targetSegments.every((seg, i) => entrySegmentsLower[i] === seg)) {
        const hebIdx = entrySegmentsLower.indexOf("hebrew");
        const engIdx = entrySegmentsLower.indexOf("english");
        const terminalIdx = hebIdx !== -1 ? hebIdx : engIdx;
        if (terminalIdx !== -1) {
          const bookParts = entrySegments.slice(1, terminalIdx);
          bookPathsMap.set(bookParts.join("/"), bookParts);
        }
      }
    });
    return Array.from(bookPathsMap.values());
  };

  const fetchManuscriptsForBook = async (
    path: string[]
  ): Promise<Manuscript[]> => {
    const gitPath = ["json", ...path].map(encodeURIComponent).join("/");
    const url = `https://api.github.com/repos/Sefaria/Sefaria-Export/contents/${gitPath}`;
    const res = await fetch(url, { headers: GITHUB_HEADERS });
    if (!res.ok) return [];
    const items = await res.json();
    if (!Array.isArray(items)) return [];

    const bookName = path[path.length - 1];
    const variants: Manuscript[] = [];

    for (const lang of ["Hebrew", "English"]) {
      const dirNode = items.find(
        (i: GitHubContentItem) => i.name.toLowerCase() === lang.toLowerCase()
      );
      if (dirNode) {
        const files = await (
          await fetch(dirNode.url, { headers: GITHUB_HEADERS })
        ).json();
        if (Array.isArray(files)) {
          files
            .filter((f: GitHubContentItem) => f.name.endsWith(".json"))
            .forEach((f: GitHubContentItem) => {
              variants.push({
                book: bookName,
                slug: bookName.toLowerCase().replace(/\s+/g, ""),
                language: lang,
                version: f.name.replace(".json", ""),
                categories: path,
                githubPath: f.path,
                rawUrl: f.download_url,
              });
            });
        }
      }
    }
    return variants;
  };

  const executeBatchIngest = async () => {
    if (pathSegments.length === 0)
      return addLog("Validation: No path selected.", "warning");
    setIsBatching(true);
    setStats((prev) => ({ ...prev, status: "batching" }));
    addLog(
      `δ Batch: Initializing sequence for ${pathSegments.join(".")}...`,
      "info"
    );

    try {
      const bookQueue = await discoverBooksLocally(pathSegments);
      if (bookQueue.length === 0) {
        addLog("δ Batch: Branch empty.", "warning");
        setStats((prev) => ({ ...prev, status: "idle" }));
        return;
      }

      setStats((prev) => ({
        ...prev,
        batchTotal: bookQueue.length,
        batchCompleted: 0,
      }));

      for (let i = 0; i < bookQueue.length; i++) {
        const bookPath = bookQueue[i];
        const variants = await fetchManuscriptsForBook(bookPath);
        const heb =
          variants.find(
            (m) =>
              m.language === "Hebrew" &&
              PRIMARY_VERSION_PATTERNS.some((p) => m.version.includes(p))
          ) || variants.find((m) => m.language === "Hebrew");
        const engs = variants.filter(
          (m) =>
            m.language === "English" &&
            PRIMARY_VERSION_PATTERNS.some((p) => m.version.includes(p))
        );

        if (heb) {
          await performIngestion(heb, engs, bookPath);
        }
        setStats((prev) => ({
          ...prev,
          batchCompleted: i + 1,
          status: "batching",
        }));
        await sleep(1000);
      }
      setStats((prev) => ({ ...prev, status: "completed" }));
    } catch (err: unknown) {
      addLog(`Batch Failed: ${(err as Error).message}`, "error");
      setStats((prev) => ({ ...prev, status: "error" }));
    } finally {
      setIsBatching(false);
    }
  };

  const executeIngest = async () => {
    if (!hebrewVersion)
      return addLog("Validation: No Hebrew variant.", "warning");
    setStats((prev) => ({
      ...prev,
      status: "fetching",
      bookTitle: hebrewVersion.book,
      currentProgress: 0,
    }));
    try {
      await performIngestion(hebrewVersion, englishVersions, pathSegments);
      setStats((prev) => ({ ...prev, status: "completed" }));
    } catch (err: unknown) {
      addLog(`Sync Aborted: ${(err as Error).message}`, "error");
      setStats((prev) => ({ ...prev, status: "error" }));
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    addLog(
      `ν Mapping: Scanning variants for ${pathSegments.join(".")}...`,
      "network"
    );
    try {
      const bookPaths = await discoverBooksLocally(pathSegments);
      const exactMatch = bookPaths.find(
        (p) => p.join("/") === pathSegments.join("/")
      );
      if (exactMatch) {
        const variants = await fetchManuscriptsForBook(exactMatch);
        setManuscripts(variants);
        addLog(
          `ν Success: Identified ${variants.length} manuscripts.`,
          "success"
        );
      } else {
        addLog(
          `ν Note: Node contains ${bookPaths.length} nested works. Use Batch Mode.`,
          "info"
        );
      }
    } catch (err: unknown) {
      addLog(`Scan Error: ${(err as Error).message}`, "error");
    } finally {
      setIsScanning(false);
    }
  };

  if (!authLoading && (!isAuthenticated || profile?.tier !== "pro")) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-white font-black uppercase tracking-[0.5em] text-[10px]">
        Architect Access Required
      </div>
    );
  }

  const filteredManuscripts = manuscripts.filter(
    (m) => filterLang === "all" || m.language === filterLang
  );

  return (
    <div className="flex flex-col h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      {/* 1. Global Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 text-white rounded-xl shadow-lg transition-transform active:scale-95">
            <Database size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight leading-none">
              Admin Mission Control
            </h1>
            <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">
              Registry Ingestion v21.9
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-zinc-50 p-1 rounded-xl border border-zinc-100">
          <button
            onClick={() => router.push("/admin/ingest")}
            className="px-6 py-2 rounded-lg bg-white shadow-sm text-[10px] font-black uppercase tracking-widest"
          >
            Pipeline
          </button>
          <button
            onClick={() => router.push("/library")}
            className="px-6 py-2 rounded-lg text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-zinc-950"
          >
            Library
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Database Health
            </span>
            <span className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />{" "}
              Schema: {targetSchema}
            </span>
          </div>
          <button
            onClick={executeBatchIngest}
            disabled={isBatching || pathSegments.length === 0}
            className={cn(
              "flex items-center gap-3 px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-[0.2em] transition-all",
              isBatching
                ? "bg-zinc-100 text-zinc-400"
                : "bg-zinc-950 text-white hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            )}
          >
            {isBatching ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <PlayCircle size={16} />
            )}
            {isBatching ? "Processing Batch" : `Batch Synchronize`}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 2. Side Navigation: Registry Explorer */}
        <aside className="w-80 flex flex-col bg-white border-r border-zinc-200">
          <div className="p-6 border-b border-zinc-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                Infrastructure
              </h2>
              <Settings2 size={14} className="text-zinc-300" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="flex items-center gap-3">
                  <LockIcon
                    size={14}
                    className={
                      useServiceRole ? "text-emerald-500" : "text-zinc-300"
                    }
                  />
                  <span className="text-[10px] font-bold uppercase text-zinc-600">
                    Elevated Auth
                  </span>
                </div>
                <button
                  onClick={() => setUseServiceRole(!useServiceRole)}
                  className={cn(
                    "w-8 h-4 rounded-full relative transition-all",
                    useServiceRole ? "bg-emerald-500" : "bg-zinc-200"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                      useServiceRole ? "right-0.5" : "left-0.5"
                    )}
                  />
                </button>
              </div>

              {useServiceRole && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <input
                    type="password"
                    placeholder="Service Key..."
                    value={customServiceKey}
                    onChange={(e) => setCustomServiceKey(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-[10px] font-mono focus:ring-1 focus:ring-zinc-900 outline-none"
                  />
                  <button
                    onClick={testConnection}
                    className="w-full py-2 bg-zinc-950 text-white text-[9px] font-black uppercase tracking-widest rounded-lg"
                  >
                    Test Link
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-100">
                <p className="text-[9px] font-black text-zinc-400 uppercase mb-2 tracking-widest">
                  Database Schema
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTargetSchema("library")}
                    className={cn(
                      "py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      targetSchema === "library"
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "bg-zinc-50 text-zinc-400"
                    )}
                  >
                    library
                  </button>
                  <button
                    onClick={() => setTargetSchema("public")}
                    className={cn(
                      "py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      targetSchema === "public"
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "bg-zinc-50 text-zinc-400"
                    )}
                  >
                    public
                  </button>
                </div>
              </div>

              <label className="flex items-center justify-between group cursor-pointer py-2 border-t border-zinc-100">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  Skip Metadata
                </span>
                <input
                  type="checkbox"
                  checked={skipMetadata}
                  onChange={(e) => setSkipMetadata(e.target.checked)}
                  className="w-3 h-3 rounded border-zinc-200 text-zinc-900 focus:ring-0"
                />
              </label>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col overflow-hidden">
            <div className="relative mb-4">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300"
                size={14}
              />
              <input
                type="text"
                placeholder="Filter canon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border-none rounded-xl text-[11px] focus:ring-1 focus:ring-zinc-900 outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3">
              <button
                onClick={() => setPathSegments([])}
                className="p-2 hover:bg-zinc-100 rounded-lg shrink-0 transition-all"
              >
                <Home size={12} className="text-zinc-400" />
              </button>
              {pathSegments.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setPathSegments(pathSegments.slice(0, i + 1))}
                  className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 shrink-0 flex items-center gap-1"
                >
                  / {s}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5">
              {directoryItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPathSegments(item.path);
                    setSearchQuery("");
                    setManuscripts([]);
                  }}
                  className="w-full text-left p-3 hover:bg-zinc-50 rounded-xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Folder
                      size={14}
                      className="text-amber-400 opacity-60 fill-amber-400"
                    />
                    <span className="text-[11px] font-bold text-zinc-600 truncate">
                      {item.isMatch
                        ? item.path.join(" › ")
                        : item.path[item.path.length - 1]}
                    </span>
                  </div>
                  <ChevronRight
                    size={12}
                    className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-all"
                  />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 3. Main Stage: Variant Matrix */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-12">
            {pathSegments.length > 0 && manuscripts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in">
                <div className="p-8 bg-zinc-50 rounded-[3rem]">
                  <Layers size={48} className="text-zinc-200" strokeWidth={1} />
                </div>
                <div className="max-w-md space-y-3">
                  <h3 className="text-2xl font-black uppercase tracking-tight italic">
                    Node Selected
                  </h3>
                  <p className="text-sm text-zinc-400 font-medium leading-relaxed uppercase tracking-tighter">
                    Path:{" "}
                    <span className="text-zinc-900 font-black">
                      {pathSegments.join(" / ")}
                    </span>
                  </p>
                  <div className="pt-6 flex justify-center gap-4">
                    <button
                      onClick={handleScan}
                      disabled={isScanning || isBatching}
                      className="btn-primary px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                      {isScanning ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Scan Variants"
                      )}
                    </button>
                    <button
                      onClick={executeBatchIngest}
                      className="btn-secondary px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] border border-zinc-200"
                    >
                      Auto Batch
                    </button>
                  </div>
                </div>
              </div>
            ) : manuscripts.length > 0 ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                {/* Variant Header & Filter */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">
                      {pathSegments[pathSegments.length - 1]}
                    </h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
                      Identified {manuscripts.length} sources for
                      synchronization
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-50 p-1 rounded-xl border border-zinc-100">
                    {["all", "Hebrew", "English"].map((l) => (
                      <button
                        key={l}
                        onClick={() => setFilterLang(l as RegistryLanguage)}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                          filterLang === l
                            ? "bg-white text-zinc-950 shadow-sm"
                            : "text-zinc-400 hover:text-zinc-600"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Hebrew Column (Skeleton) */}
                  <section className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-400 rounded-full" />{" "}
                      Canonical Skeletons
                    </h4>
                    <div className="space-y-3">
                      {filteredManuscripts
                        .filter((m) => m.language === "Hebrew")
                        .map((m) => (
                          <div
                            key={m.version}
                            onClick={() => setHebrewVersion(m)}
                            className={cn(
                              "p-6 border rounded-[2rem] text-left transition-all cursor-pointer relative group overflow-hidden",
                              hebrewVersion?.version === m.version
                                ? "border-zinc-900 bg-zinc-50 ring-2 ring-zinc-900 ring-offset-4"
                                : "border-zinc-100 hover:border-zinc-300"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black uppercase italic truncate pr-8">
                                {m.version}
                              </span>
                              {hebrewVersion?.version === m.version && (
                                <CheckCircle2
                                  size={18}
                                  className="text-zinc-950 shrink-0"
                                />
                              )}
                            </div>
                            <p className="text-[9px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">
                              Primary Row Identity
                            </p>
                          </div>
                        ))}
                    </div>
                  </section>

                  {/* English Column (Satellite) */}
                  <section className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />{" "}
                      Translation Streams
                    </h4>
                    <div className="space-y-3">
                      {filteredManuscripts
                        .filter((m) => m.language === "English")
                        .map((m) => {
                          const isSel = englishVersions.some(
                            (v) => v.version === m.version
                          );
                          return (
                            <div
                              key={m.version}
                              onClick={() =>
                                setEnglishVersions((prev) =>
                                  isSel
                                    ? prev.filter(
                                        (v) => v.version !== m.version
                                      )
                                    : [...prev, m]
                                )
                              }
                              className={cn(
                                "p-6 border rounded-[2rem] text-left transition-all cursor-pointer relative group",
                                isSel
                                  ? "border-blue-500 bg-blue-50/30 shadow-sm"
                                  : "border-zinc-100 hover:border-zinc-300"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-black uppercase italic truncate pr-8">
                                  {m.version}
                                </span>
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                                    isSel
                                      ? "bg-blue-500 border-blue-500"
                                      : "border-zinc-200"
                                  )}
                                >
                                  {isSel && (
                                    <CheckCircle2
                                      size={12}
                                      className="text-white"
                                    />
                                  )}
                                </div>
                              </div>
                              <p className="text-[9px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">
                                Secondary Data Layer
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </section>
                </div>

                {/* Single Ingest Action */}
                <div className="pt-12 border-t border-zinc-100 flex justify-center">
                  <button
                    onClick={executeIngest}
                    disabled={!hebrewVersion || stats.status === "ingesting"}
                    className="btn-primary px-16 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  >
                    Initiate Source Sync
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-zinc-300">
                <Cpu size={64} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">
                  Orchestrator Standby
                </p>
              </div>
            )}
          </div>

          {/* Progress Footer */}
          {(stats.status === "ingesting" || isBatching) && (
            <div className="p-8 bg-zinc-950 text-white border-t border-zinc-800 animate-in slide-in-from-bottom-full duration-500">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-3">
                    <Activity
                      size={14}
                      className="text-emerald-500 animate-pulse"
                    />
                    Current Operation:{" "}
                    <span className="text-white italic">{stats.bookTitle}</span>
                  </span>
                  <span className="text-zinc-500">
                    {isBatching
                      ? `Batch: ${stats.batchCompleted} / ${stats.batchTotal}`
                      : `Segments: ${stats.currentProgress} / ${stats.totalItems}`}
                  </span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                    style={{
                      width: `${
                        (stats.currentProgress / (stats.totalItems || 1)) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 4. Live Ingestion Buffer */}
        <aside className="w-96 bg-zinc-950 text-zinc-300 border-l border-zinc-800 flex flex-col z-10 shadow-2xl">
          <header className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal size={18} className="text-emerald-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em]">
                Diagnostic Buffer
              </h2>
            </div>
            <button
              onClick={() => setLogs([])}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Trash2 size={16} className="text-zinc-500" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 font-mono text-[10px] leading-relaxed flex flex-col gap-2 custom-scrollbar">
            {logs.map((log, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-xl border-l-2 bg-zinc-900/50 animate-in slide-in-from-right-4",
                  log.type === "success"
                    ? "border-emerald-500 text-emerald-400"
                    : log.type === "loading"
                    ? "border-amber-500 text-amber-400"
                    : log.type === "error"
                    ? "border-rose-500 text-rose-400"
                    : log.type === "warning"
                    ? "border-orange-500 text-orange-400"
                    : "border-zinc-700 text-zinc-500"
                )}
              >
                <div className="flex justify-between items-center mb-1 opacity-50">
                  <span className="font-black uppercase text-[8px] tracking-widest">
                    {log.type}
                  </span>
                  <span>{log.timestamp}</span>
                </div>
                <p className="break-all">{log.message}</p>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                Buffer Empty
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        </aside>
      </div>
    </div>
  );
}
