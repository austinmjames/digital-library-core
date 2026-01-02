"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useZmanim } from "@/lib/hooks/useZmanim";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  AlertCircle,
  ArrowRight,
  Book,
  BookOpen,
  Briefcase,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  ChevronRight,
  Droplet,
  DropletOff,
  Flame,
  HelpCircle,
  Info,
  Loader2,
  Lollipop,
  MapPin,
  Moon,
  MoonStar,
  Plus,
  Scroll,
  Settings2,
  Sparkles,
  Sun,
  WineOff,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * Gateway Orchestrator (v21.2 - Scholarly Inquiry Edition)
 * Filepath: app/page.tsx
 * Role: Master Events Overview & Unified Temporal Registry.
 * Architecture: Row 1 features a consolidated Portion anchor with deep-links, a Description panel, and a random Question panel.
 */

// --- Extended Interfaces ---

interface HebcalEvent {
  title: string;
  date: string;
  category: string;
  memo?: string;
  description?: string;
}

interface ExtendedLocation {
  lat: number;
  lng: number;
  city?: string;
  zip?: string;
}

type ZmanKey =
  | "alosHaShachar"
  | "misheyakir"
  | "sunrise"
  | "sofZmanShma"
  | "sofZmanTfilla"
  | "chatzos"
  | "minchaGedola"
  | "minchaKetana"
  | "plagHaMincha"
  | "sunset"
  | "tzeitHakochavim"
  | "shaaZmanitGra";

interface ZmanOption {
  key: ZmanKey;
  label: string;
}

const ZMANIM_OPTIONS: ZmanOption[] = [
  { key: "alosHaShachar", label: "Dawn (Alos)" },
  { key: "misheyakir", label: "Earliest Tallit" },
  { key: "sunrise", label: "Sunrise" },
  { key: "sofZmanShma", label: "Latest Shema" },
  { key: "sofZmanTfilla", label: "Latest Shacharit" },
  { key: "chatzos", label: "Midday (Chatzos)" },
  { key: "minchaGedola", label: "Earliest Mincha" },
  { key: "minchaKetana", label: "Mincha Ketanah" },
  { key: "plagHaMincha", label: "Plag Hamincha" },
  { key: "sunset", label: "Sunset" },
  { key: "tzeitHakochavim", label: "Nightfall" },
  { key: "shaaZmanitGra", label: "Shaah Zmanit" },
];

// --- Internal UI Atoms ---

const CandleIcon = ({
  active,
  className,
}: {
  className?: string;
  active?: boolean;
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path
      d="M12 2c1.33 0 2 1.6 2 3.5s-.67 3.5-2 5.5c-1.33-2-2-3.6-2-5.5S10.67 2 12 2z"
      fill={active ? "currentColor" : "none"}
    />
    <rect x="9" y="11" width="6" height="11" rx="1.5" />
    <path d="M12 11v-1" />
  </svg>
);

const EventStatus = ({ event }: { event: HebcalEvent }) => {
  const cat = (event.category || "").toLowerCase();
  const title = (event.title || "").toLowerCase();

  const isRoshChodesh = cat === "roshchodesh" || title.includes("rosh chodesh");
  const isYomTov =
    cat === "yomtoy" ||
    title.includes("pesach") ||
    title.includes("sukkot") ||
    title.includes("shavuot");
  const isNoWork =
    (cat === "yomtoy" ||
      cat === "shabbat" ||
      title.includes("shabbat") ||
      title.includes("yom kippur")) &&
    !title.includes("chol hamoed") &&
    !title.includes("erev");

  const isMinorFast =
    title.includes("gedaliah") ||
    title.includes("10 tevet") ||
    title.includes("esther") ||
    title.includes("17 tammuz");
  const isMajorFast =
    title.includes("yom kippur") || title.includes("tisha b'av");
  const isGeneralFast = cat === "fast" || title.includes("tzom");

  return (
    <div className="flex flex-wrap gap-2">
      {isRoshChodesh && (
        <div
          title="Rosh Chodesh"
          className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-sm"
        >
          <MoonStar size={16} />
        </div>
      )}
      {isYomTov && (
        <div
          title="Yom Tov"
          className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-sm"
        >
          <Flame size={16} fill="currentColor" />
        </div>
      )}
      {isNoWork && (
        <div
          title="No Work Allowed"
          className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-sm"
        >
          <Briefcase size={16} />
        </div>
      )}

      {(isMinorFast || isMajorFast || isGeneralFast) && (
        <div className="flex gap-1 items-center bg-[var(--surface-hover)] p-1 rounded-lg border border-[var(--border-subtle)]">
          <div title="No Drinking" className="flex items-center">
            <WineOff size={16} className="text-[var(--accent-danger)]" />
          </div>
          <div className="relative" title="No Eating">
            <Lollipop
              size={16}
              className="text-[var(--accent-danger)] opacity-40"
            />
            <X
              size={10}
              className="absolute inset-0 m-auto text-[var(--accent-danger)]"
              strokeWidth={4}
            />
          </div>

          {isMinorFast && (
            <>
              <div title="Washing Permitted" className="flex items-center">
                <Droplet size={16} className="text-[var(--accent-success)]" />
              </div>
              <div title="Sunrise to Sunset" className="flex items-center">
                <Sun size={16} className="text-[var(--accent-warning)]" />
              </div>
            </>
          )}

          {isMajorFast && (
            <>
              <div title="No Washing" className="flex items-center">
                <DropletOff size={16} className="text-[var(--accent-danger)]" />
              </div>
              <div title="Full Registry Fast" className="flex items-center">
                <Sun size={16} className="text-[var(--accent-warning)]" />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// --- Main Page Orchestrator ---

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { location: rawLocation, refresh } = useZmanim();
  const location = rawLocation as ExtendedLocation | null;
  const supabase = createClient();

  // --- State: Location Sync ---
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isSyncingLocation, setIsSyncingLocation] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);

  // --- State: Events & Registry ---
  const [shTimes, setShTimes] = useState<{ start: Date; end: Date } | null>(
    null
  );
  const [parasha, setParasha] = useState<{
    title: string;
    torah: string;
    torahStartRef: string;
    haftarah: string;
    haftarahStartRef: string;
    desc: string;
  } | null>(null);
  const [portionQuestion, setPortionQuestion] = useState<{
    text: string;
    scholar: string;
  } | null>(null);
  const [upcoming, setUpcoming] = useState<HebcalEvent[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // --- State: Zmanim Detailed Registry ---
  const [configSlotIdx, setConfigSlotIdx] = useState<number | null>(null);
  const [userZmanim, setUserZmanim] = useState<(ZmanKey | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [liveZmanimData, setLiveZmanimData] = useState<Record<string, string>>(
    {}
  );

  const effectiveDate = useMemo(() => new Date(), []);

  const activeLocation = useMemo(() => {
    if (location?.lat) return location;
    return { lat: 32.7767, lng: -96.797, city: "Dallas", zip: "75201" };
  }, [location]);

  useEffect(() => {
    async function loadTemporalData() {
      setIsDataLoading(true);
      const lat = activeLocation.lat;
      const lng = activeLocation.lng;
      const zip = activeLocation.zip;
      const dStr = effectiveDate.toISOString().split("T")[0];

      try {
        // 1. Resolve Portion Name via Hebcal
        const shRes = await fetch(
          `https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lng}&m=50`
        );
        const shJson = await shRes.json();
        const pItem = shJson.items.find((i: any) => i.category === "parashat");

        if (pItem) {
          const rawName = pItem.title.replace("Parashat ", "");

          // 2. Query Blueprint and Random Question
          const { data: blueprint } = await supabase
            .from("portion_library")
            .select("*")
            .eq("name", rawName)
            .single();

          const { data: questions } = await supabase
            .from("portion_questions")
            .select("question_text, scholar_name")
            .eq("portion_name", rawName);

          if (blueprint) {
            setParasha({
              title: blueprint.name,
              torah: `${blueprint.start_ref}-${blueprint.end_ref
                .split(".")
                .pop()}`,
              torahStartRef: blueprint.start_ref.replace(/\./g, "/"),
              haftarah: blueprint.secondary_ref
                ? `${blueprint.secondary_ref}-${blueprint.secondary_end_ref
                    .split(".")
                    .pop()}`
                : "Prophetic Reflection",
              haftarahStartRef: blueprint.secondary_ref
                ? blueprint.secondary_ref.replace(/\./g, "/")
                : "Isaiah/1/1",
              desc: blueprint.summary || "Canonical registry portion.",
            });
          } else {
            setParasha({
              title: rawName,
              torah: "Genesis 1:1",
              torahStartRef: "Genesis/1/1",
              haftarah: "Isaiah 1:1",
              haftarahStartRef: "Isaiah/1/1",
              desc: "Blueprint pending synchronization.",
            });
          }

          if (questions && questions.length > 0) {
            const randomQ =
              questions[Math.floor(Math.random() * questions.length)];
            setPortionQuestion({
              text: randomQ.question_text,
              scholar: randomQ.scholar_name,
            });
          } else {
            setPortionQuestion({
              text: "Contemplating the ethical logic within this week's manuscript. What lesson is primary for the individual today?",
              scholar: "DrashX Scholars",
            });
          }
        }

        // 3. Shabbat Benchmarks
        const start = shJson.items.find(
          (i: any) => i.category === "candles"
        )?.date;
        const end = shJson.items.find(
          (i: any) => i.category === "havdalah"
        )?.date;
        if (start && end)
          setShTimes({ start: new Date(start), end: new Date(end) });

        // 4. Roadmap
        const eRes = await fetch(
          `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&ss=on&mf=on&start=${dStr}&end=${
            new Date(effectiveDate.getTime() + 60 * 86400000)
              .toISOString()
              .split("T")[0]
          }`
        );
        const eJson = await eRes.json();
        setUpcoming(eJson.items || []);

        // 5. Zmanim Detailed
        const zmanRes = await fetch(
          `https://www.hebcal.com/zmanim?cfg=json&zip=${zip || "75201"}&v=1`
        );
        const zmanJson = await zmanRes.json();
        if (zmanJson?.times) setLiveZmanimData(zmanJson.times);
      } catch {
        /* Silent */
      } finally {
        setIsDataLoading(false);
      }
    }
    loadTemporalData();
  }, [activeLocation, effectiveDate, supabase]);

  const handleUpdateLocation = async () => {
    const trimmedZip = zipInput.trim();
    if (!trimmedZip || trimmedZip.length < 5) {
      setLocationError("Invalid Format");
      return;
    }
    setIsSyncingLocation(true);
    setLocationError(null);
    try {
      const res = await fetch(
        `https://www.hebcal.com/zips?zip=${trimmedZip}&cfg=json`
      );
      const data = await res.json();
      if (data?.latitude) {
        if (user) {
          await supabase.from("user_settings").upsert(
            {
              user_id: user.id,
              zip_code: trimmedZip,
              lat: data.latitude,
              lng: data.longitude,
              city_name: data.city || trimmedZip,
            },
            { onConflict: "user_id" }
          );
        }
        await refresh();
        setIsEditingLocation(false);
        setZipInput("");
      } else {
        setLocationError("Not Found");
      }
    } catch {
      setLocationError("Registry Offline");
    } finally {
      setIsSyncingLocation(false);
    }
  };

  const fmt = (d?: Date) =>
    d
      ? new Intl.DateTimeFormat(undefined, {
          hour: "numeric",
          minute: "2-digit",
        })
          .format(d)
          .toLowerCase()
      : "--:--";

  const getDaysLeft = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const diff = eventDate.getTime() - effectiveDate.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getZmanValueString = (key: ZmanKey) => {
    const val = liveZmanimData[key];
    if (!val) return "--:--";
    return new Date(val)
      .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      .toLowerCase();
  };

  if (authLoading || (isAuthenticated && isDataLoading)) {
    return (
      <div className="h-screen bg-[var(--paper)] flex flex-col items-center justify-center gap-10">
        <Loader2
          className="animate-spin text-[var(--accent-primary)]"
          size={64}
          strokeWidth={2}
        />
        <p className="text-[14px] font-black uppercase tracking-[1.5em] text-[var(--ink-muted)] animate-pulse pl-6">
          DRASHX
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--paper)] relative overflow-x-hidden p-10 lg:p-16 transition-all selection:bg-blue-100">
        <main className="max-w-7xl mx-auto space-y-24">
          {/* Row 1: Scholarly Inquiry Spread (Refined v21.2) */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8 border-b border-[var(--border-subtle)] pb-4">
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--ink-muted)]">
                Portion Insights
              </h2>
              <div className="flex items-center gap-2 text-[var(--accent-primary)]">
                <CalendarIcon size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {effectiveDate.toDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Panel 1: Name and Reading Buttons */}
              <div className="paper-card p-10 flex flex-col justify-between bg-white hover:shadow-xl transition-all duration-500 group border-2">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-blue-600">
                    <BookOpen size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Canonical Portion
                    </span>
                  </div>
                  <h3 className="text-5xl font-normal tracking-tighter text-[var(--ink)] uppercase leading-none">
                    {parasha?.title || "Genesis"}
                  </h3>
                </div>

                <div className="space-y-3 mt-8 pt-6 border-t border-[var(--border-subtle)]">
                  <Link
                    href={`/read/${parasha?.torahStartRef || "Genesis"}`}
                    className="w-full flex items-center justify-between p-4 bg-zinc-50 rounded-2xl hover:bg-blue-50 transition-colors group/btn"
                  >
                    <div className="flex items-center gap-3">
                      <Book size={14} className="text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--ink)]">
                        {parasha?.torah}
                      </span>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-zinc-300 group-hover/btn:translate-x-1 transition-transform"
                    />
                  </Link>

                  <Link
                    href={`/read/${parasha?.haftarahStartRef || "Isaiah"}`}
                    className="w-full flex items-center justify-between p-4 bg-zinc-50 rounded-2xl hover:bg-purple-50 transition-colors group/btn"
                  >
                    <div className="flex items-center gap-3">
                      <Scroll size={14} className="text-purple-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--ink)]">
                        {parasha?.haftarah}
                      </span>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-zinc-300 group-hover/btn:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </div>

              {/* Panel 2: Description */}
              <div className="paper-card p-10 flex flex-col justify-between bg-white border-2 hover:shadow-xl transition-all duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-emerald-600">
                    <Info size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Registry Summary
                    </span>
                  </div>
                  <p className="text-[15px] leading-relaxed text-[var(--ink-muted)] font-serif italic selection:bg-blue-100">
                    {parasha?.desc}
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 opacity-20">
                  <div className="h-px flex-1 bg-[var(--ink)]" />
                  <BookOpen size={14} />
                  <div className="h-px flex-1 bg-[var(--ink)]" />
                </div>
              </div>

              {/* Panel 3: Torah Inquiry (Questions) */}
              <div className="paper-card p-10 flex flex-col justify-between bg-[var(--surface-hover)] border-dashed border-2 transition-all">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-[var(--accent-primary)]">
                    <HelpCircle size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Torah Inquiry
                    </span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[15px] leading-relaxed text-[var(--ink)] font-bold tracking-tight">
                      {portionQuestion?.text}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] opacity-60">
                      — {portionQuestion?.scholar}
                    </p>
                  </div>
                </div>
                <button className="mt-10 btn-secondary w-full py-5 rounded-[var(--radius-lg)] text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 group active:scale-95 transition-all shadow-sm">
                  View Inquiry Notes
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Row 2: Configurable Temporal Registry */}
          <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 relative">
            <div className="flex items-center justify-between mb-8 border-b border-[var(--border-subtle)] pb-4">
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--ink-muted)]">
                Temporal Benchmarks
              </h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {isEditingLocation ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center bg-[var(--paper)] border border-[var(--accent-primary)] rounded-full pl-5 pr-1.5 py-1.5 shadow-lg animate-in zoom-in-95">
                        <input
                          autoFocus
                          disabled={isSyncingLocation}
                          className="bg-transparent text-xs font-bold outline-none w-24 tracking-widest"
                          placeholder="ZIP"
                          value={zipInput}
                          onChange={(e) => setZipInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleUpdateLocation()
                          }
                        />
                        <button
                          onClick={handleUpdateLocation}
                          disabled={isSyncingLocation}
                          className="btn-primary p-2 rounded-full"
                        >
                          {isSyncingLocation ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} strokeWidth={3} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingLocation(false);
                            setLocationError(null);
                          }}
                          className="p-2 text-zinc-300 hover:text-zinc-900"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {locationError && (
                        <div className="absolute top-full left-0 mt-2 px-4 py-1.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-rose-600 animate-in slide-in-from-top-1 z-[100]">
                          <AlertCircle size={12} />
                          <span className="text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">
                            {locationError}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingLocation(true)}
                      className="btn-secondary px-6 py-2.5 flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
                    >
                      <MapPin
                        size={16}
                        className="text-[var(--accent-primary)]"
                      />
                      <span className="text-[11px] font-bold tracking-widest uppercase">
                        {activeLocation.city}
                      </span>
                    </button>
                  )}
                </div>
                <Settings2
                  size={18}
                  className="text-[var(--ink-muted)] opacity-30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[0, 1, 2, 3].map((i) => {
                const selection = userZmanim[i];
                const opt = ZMANIM_OPTIONS.find((o) => o.key === selection);
                const isCurrentSlot = configSlotIdx === i;
                return (
                  <div key={i} className="relative h-full group">
                    <button
                      onClick={() => setConfigSlotIdx(isCurrentSlot ? null : i)}
                      className={cn(
                        "w-full h-full min-h-[140px] paper-card p-8 text-center transition-all duration-300 border-2",
                        selection
                          ? "bg-white border-[var(--border-subtle)] hover:border-[var(--accent-primary)] shadow-sm"
                          : "bg-[var(--surface-hover)] border-dashed border-zinc-200 hover:border-[var(--ink)]"
                      )}
                    >
                      {selection ? (
                        <>
                          <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest mb-3 group-hover:text-[var(--accent-primary)] transition-colors">
                            {opt?.label}
                          </p>
                          <p className="text-2xl font-normal tracking-tighter text-[var(--ink)]">
                            {getZmanValueString(selection)}
                          </p>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                          <Plus size={20} />
                          <span className="text-[9px] font-black uppercase tracking-tighter">
                            Assign Slot
                          </span>
                        </div>
                      )}
                    </button>
                    {isCurrentSlot && (
                      <div className="absolute top-full left-0 mt-4 z-[300] w-72 bg-white border-2 border-[var(--ink)] p-8 rounded-[2rem] shadow-3xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-[10px] font-black uppercase tracking-widest">
                            Temporal Config
                          </h4>
                          <button
                            onClick={() => setConfigSlotIdx(null)}
                            className="p-1 hover:bg-zinc-100 rounded-lg"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-3">
                          <button
                            onClick={() => {
                              const ns = [...userZmanim];
                              ns[i] = null;
                              setUserZmanim(ns);
                              setConfigSlotIdx(null);
                            }}
                            className="w-full text-left p-4 bg-zinc-50 hover:bg-rose-50 hover:text-rose-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all mb-2"
                          >
                            Clear Slot
                          </button>
                          {ZMANIM_OPTIONS.map((opt) => (
                            <button
                              key={opt.key}
                              onClick={() => {
                                const ns = [...userZmanim];
                                ns[i] = opt.key;
                                setUserZmanim(ns);
                                setConfigSlotIdx(null);
                              }}
                              className={cn(
                                "w-full text-left p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                userZmanim.includes(opt.key)
                                  ? "opacity-30 cursor-not-allowed bg-zinc-50"
                                  : "hover:bg-[var(--surface-hover)] bg-white border border-[var(--border-subtle)]"
                              )}
                              disabled={userZmanim.includes(opt.key)}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="paper-card p-8 text-center bg-white border-[var(--border-subtle)] border-2 shadow-sm min-h-[140px] flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">
                    Lighting
                  </p>
                  <p className="text-2xl font-normal tracking-tighter text-[var(--ink)]">
                    {fmt(shTimes?.start)}
                  </p>
                </div>
                <div className="mt-2 flex justify-center text-amber-500 opacity-20">
                  <CandleIcon active />
                </div>
              </div>
              <div className="paper-card p-8 text-center bg-white border-[var(--border-subtle)] border-2 shadow-sm min-h-[140px] flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">
                    Havdalah
                  </p>
                  <p className="text-2xl font-normal tracking-tighter text-[var(--ink)]">
                    {fmt(shTimes?.end)}
                  </p>
                </div>
                <div className="mt-2 flex justify-center text-indigo-500 opacity-20">
                  <Moon size={18} />
                </div>
              </div>
            </div>
          </section>

          {/* Row 3: Registry Roadmap */}
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 pb-20">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--ink-muted)] mb-8 border-b border-[var(--border-subtle)] pb-4">
              Roadmap Registry (60 Days)
            </h2>
            <div className="space-y-6">
              {upcoming.map((ev, i) => {
                const isExpanded = expandedEventId === `${ev.title}-${ev.date}`;
                return (
                  <div
                    key={i}
                    className={cn(
                      "paper-card overflow-hidden transition-all duration-700 border-2",
                      isExpanded
                        ? "border-[var(--ink)] shadow-3xl ring-2 ring-[var(--ink)]/5"
                        : "paper-card-hover border-[var(--border-subtle)]"
                    )}
                  >
                    <button
                      onClick={() =>
                        setExpandedEventId(
                          isExpanded ? null : `${ev.title}-${ev.date}`
                        )
                      }
                      className="w-full flex items-center justify-between p-8 text-left group"
                    >
                      <div className="flex-1 min-w-0 pr-10 space-y-4">
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest opacity-60">
                            {new Date(ev.date).toLocaleDateString(undefined, {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <h4 className="text-2xl font-normal text-[var(--ink)] uppercase truncate italic tracking-tighter leading-tight group-hover:text-[var(--accent-primary)] transition-colors">
                            {ev.title}
                          </h4>
                        </div>
                        <EventStatus event={ev} />
                      </div>
                      <div className="flex items-center gap-10 text-right shrink-0 border-l border-[var(--border-subtle)] pl-10">
                        <div className="flex flex-col justify-center min-w-[100px]">
                          <p className="text-4xl font-normal tracking-tighter text-[var(--ink)] leading-none">
                            {getDaysLeft(ev.date) === 0
                              ? "Today"
                              : `${getDaysLeft(ev.date)}d`}
                          </p>
                          <p className="text-[10px] font-bold uppercase text-[var(--ink-muted)] tracking-widest opacity-40 mt-1">
                            Registry Target
                          </p>
                        </div>
                        <div
                          className={cn(
                            "p-3 rounded-full bg-[var(--surface-hover)] transition-transform duration-700",
                            isExpanded &&
                              "rotate-180 bg-[var(--ink)] text-[var(--paper)]"
                          )}
                        >
                          <ChevronDown size={20} strokeWidth={3} />
                        </div>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-8 pb-10 animate-in slide-in-from-top-6 duration-700">
                        <div className="p-10 bg-[var(--surface-hover)] rounded-[3rem] border border-[var(--border-subtle)] shadow-inner relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-2 h-full bg-[var(--accent-primary)] opacity-20" />
                          <div className="flex items-center gap-4 text-[var(--accent-primary)] mb-8">
                            <div className="p-2 bg-blue-50 rounded-xl">
                              <Info size={18} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">
                              {ev.category}
                            </span>
                          </div>
                          <div className="prose prose-md max-w-none">
                            <p className="text-xl leading-relaxed text-[var(--ink-muted)] font-serif italic">
                              {ev.memo ||
                                ev.description ||
                                "Temporal scholarly anchor. No historical commentary has been attached to this entry."}
                            </p>
                          </div>
                          <div className="mt-12 flex gap-5">
                            <Link
                              href="/library"
                              className="btn-primary px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl"
                            >
                              Scholarly Deep Dive
                            </Link>
                            <button
                              onClick={() => setExpandedEventId(null)}
                              className="btn-ghost px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest border border-[var(--border-subtle)] bg-white/50"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
        <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none opacity-5">
          <span className="text-[11px] font-bold uppercase tracking-[2.5em]">
            Digital Beit Midrash Protocol v21.9
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--paper)] flex flex-col items-center justify-center p-12 text-center overflow-hidden">
      <div className="relative z-10 space-y-20 max-w-6xl animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex justify-center">
          <div className="p-16 bg-[var(--paper)] border-2 border-[var(--border-subtle)] rounded-[5rem] shadow-3xl">
            <Sparkles
              size={80}
              className="text-[var(--accent-primary)] animate-pulse"
            />
          </div>
        </div>
        <div className="space-y-12">
          <h1 className="text-9xl md:text-[16rem] font-normal tracking-tighter uppercase leading-[0.7] text-[var(--ink)]">
            Eternal <br /> Logic.
          </h1>
          <p className="text-3xl md:text-5xl font-bold text-[var(--ink-muted)] leading-relaxed max-w-5xl mx-auto uppercase tracking-widest opacity-80">
            Unified Registry & Midrash.
          </p>
        </div>
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-12">
          <Link
            href="/signup"
            className="btn-primary px-32 py-10 text-[16px] font-bold uppercase tracking-[0.5em] rounded-full shadow-3xl"
          >
            Commence
          </Link>
          <Link
            href="/library"
            className="btn-ghost px-12 py-10 flex items-center gap-6 group"
          >
            <span className="text-xl font-bold uppercase tracking-[0.4em]">
              Catalog
            </span>
            <ChevronRight
              size={36}
              className="group-hover:translate-x-3 transition-transform text-[var(--accent-primary)]"
              strokeWidth={5}
            />
          </Link>
        </div>
      </div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.08] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      <div className="fixed -bottom-80 -right-80 w-[60rem] h-[60rem] bg-[var(--accent-primary)] opacity-5 blur-[250px] rounded-full" />
    </div>
  );
}
