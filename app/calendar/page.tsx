"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useZmanim } from "@/lib/hooks/useZmanim";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  AlertCircle,
  Briefcase,
  Check,
  ChevronDown,
  Droplet,
  DropletOff,
  Flame,
  Info,
  Loader2,
  LogIn,
  Lollipop,
  MapPin,
  Moon,
  MoonStar,
  Plus,
  Settings2,
  Sun,
  WineOff,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * Calendar Orchestrator (v2.1 - Complete Registry & Secure Gate)
 * Filepath: app/calendar/page.tsx
 * Role: Master Events Overview & Unified Temporal Registry.
 * Features: Configurable Zmanim Slots, Detailed Fasting/Work Status, Location Sync.
 * Fixes: Restored all missing logic from provided reference; Replaced unauth splash with login gate.
 */

// --- Extended Interfaces ---

interface HebcalEvent {
  title: string;
  date: string;
  category: string;
  memo?: string;
  description?: string;
}

interface ShabbatItem {
  category: string;
  date: string;
  title: string;
  memo?: string;
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
          className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 flex items-center justify-center border border-purple-100 dark:border-purple-800 shadow-sm"
        >
          <MoonStar size={16} />
        </div>
      )}
      {isYomTov && (
        <div
          title="Yom Tov"
          className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-600 flex items-center justify-center border border-orange-100 dark:border-orange-800 shadow-sm"
        >
          <Flame size={16} fill="currentColor" />
        </div>
      )}
      {isNoWork && (
        <div
          title="No Work Allowed"
          className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 flex items-center justify-center border border-red-100 dark:border-red-800 shadow-sm"
        >
          <Briefcase size={16} />
        </div>
      )}

      {(isMinorFast || isMajorFast || isGeneralFast) && (
        <div className="flex gap-1 items-center bg-[var(--surface-hover)] p-1 rounded-lg border border-[var(--border-subtle)]">
          <div title="No Drinking" className="flex items-center">
            <WineOff size={16} className="text-rose-500" />
          </div>
          <div className="relative" title="No Eating">
            <Lollipop size={16} className="text-rose-500 opacity-40" />
            <X
              size={10}
              className="absolute inset-0 m-auto text-rose-500"
              strokeWidth={4}
            />
          </div>

          {isMinorFast && (
            <>
              <div title="Washing Permitted" className="flex items-center">
                <Droplet size={16} className="text-emerald-500" />
              </div>
              <div title="Sunrise to Sunset" className="flex items-center">
                <Sun size={16} className="text-amber-500" />
              </div>
            </>
          )}

          {isMajorFast && (
            <>
              <div title="No Washing" className="flex items-center">
                <DropletOff size={16} className="text-rose-500" />
              </div>
              <div title="Full Registry Fast" className="flex items-center">
                <Sun size={16} className="text-amber-500" />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// --- Main Page Orchestrator ---

export default function CalendarPage() {
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
    if (!isAuthenticated) return;
    async function loadTemporalData() {
      setIsDataLoading(true);
      const lat = activeLocation.lat;
      const lng = activeLocation.lng;
      const zip = activeLocation.zip;
      const dStr = effectiveDate.toISOString().split("T")[0];

      try {
        // 1. Shabbat Benchmarks via Hebcal
        const shRes = await fetch(
          `https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lng}&m=50`
        );
        const shJson = (await shRes.json()) as { items: ShabbatItem[] };

        const start = shJson.items.find(
          (i: ShabbatItem) => i.category === "candles"
        )?.date;
        const end = shJson.items.find(
          (i: ShabbatItem) => i.category === "havdalah"
        )?.date;
        if (start && end)
          setShTimes({ start: new Date(start), end: new Date(end) });

        // 2. 60-Day Roadmap
        const eRes = await fetch(
          `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&ss=on&mf=on&start=${dStr}&end=${
            new Date(effectiveDate.getTime() + 60 * 86400000)
              .toISOString()
              .split("T")[0]
          }`
        );
        const eJson = (await eRes.json()) as { items: HebcalEvent[] };
        setUpcoming(eJson.items || []);

        // 3. Detailed Zmanim
        const zmanRes = await fetch(
          `https://www.hebcal.com/zmanim?cfg=json&zip=${zip || "75201"}&v=1`
        );
        const zmanJson = (await zmanRes.json()) as {
          times: Record<string, string>;
        };
        if (zmanJson?.times) setLiveZmanimData(zmanJson.times);
      } catch (err) {
        console.error("Registry Sync Failed", err);
      } finally {
        setIsDataLoading(false);
      }
    }
    loadTemporalData();
  }, [activeLocation, effectiveDate, isAuthenticated]);

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
          size={48}
          strokeWidth={2}
        />
        <p className="text-[12px] font-black uppercase tracking-[1.5em] text-[var(--ink-muted)] animate-pulse pl-6">
          SYNCING REGISTRY
        </p>
      </div>
    );
  }

  // --- Restricted Access Gate ---
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full bg-[var(--paper)] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
        <div className="relative z-10 space-y-10 max-w-sm animate-in fade-in zoom-in-95 duration-1000">
          <div className="flex justify-center">
            <div className="p-6 bg-white dark:bg-zinc-900 border-2 border-[var(--border-subtle)] rounded-3xl shadow-xl group">
              <Flame size={40} className="text-blue-600 animate-pulse" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-black uppercase tracking-tight text-[var(--ink)] dark:text-white leading-none">
              Registry Restricted
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)] opacity-60">
              Authentication is required to access the temporal benchmarks.
            </p>
          </div>
          <Link
            href="/login"
            className="btn-primary w-full py-4 text-[12px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <LogIn size={16} /> Enter Portal
          </Link>
          <div className="pt-8 opacity-20">
            <p className="text-[8px] font-black uppercase tracking-[1em]">
              Protocol v2.1
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Authenticated Temporal Registry ---
  return (
    <div className="min-h-screen bg-[var(--paper)] relative overflow-x-hidden p-10 lg:p-16 transition-all selection:bg-blue-100">
      <main className="max-w-7xl mx-auto space-y-24">
        {/* Row 1: Configurable Temporal Registry */}
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 relative">
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
                    <MapPin size={16} className="text-blue-600" />
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
                        ? "bg-white dark:bg-zinc-900 border-[var(--border-subtle)] hover:border-blue-600 shadow-sm"
                        : "bg-[var(--surface-hover)] border-dashed border-zinc-200 dark:border-zinc-800 hover:border-blue-600"
                    )}
                  >
                    {selection ? (
                      <>
                        <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest mb-3 group-hover:text-blue-600 transition-colors">
                          {opt?.label}
                        </p>
                        <p className="text-2xl font-normal tracking-tighter text-[var(--ink)] dark:text-white">
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
                    <div className="absolute top-full left-0 mt-4 z-[300] w-72 bg-white dark:bg-zinc-900 border-2 border-[var(--ink)] p-8 rounded-[2rem] shadow-3xl animate-in zoom-in-95">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest">
                          Temporal Config
                        </h4>
                        <button
                          onClick={() => setConfigSlotIdx(null)}
                          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
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
                          className="w-full text-left p-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all mb-2"
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
                                ? "opacity-30 cursor-not-allowed bg-zinc-50 dark:bg-zinc-800"
                                : "hover:bg-[var(--surface-hover)] bg-white dark:bg-zinc-900 border border-[var(--border-subtle)]"
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
            <div className="paper-card p-8 text-center bg-white dark:bg-zinc-900 border-amber-100 dark:border-amber-900/30 border-2 shadow-sm min-h-[140px] flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">
                  Lighting
                </p>
                <p className="text-2xl font-normal tracking-tighter text-[var(--ink)] dark:text-white">
                  {fmt(shTimes?.start)}
                </p>
              </div>
              <div className="mt-2 flex justify-center text-amber-500 opacity-20">
                <CandleIcon active />
              </div>
            </div>
            <div className="paper-card p-8 text-center bg-white dark:bg-zinc-900 border-indigo-100 dark:border-indigo-900/30 border-2 shadow-sm min-h-[140px] flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">
                  Havdalah
                </p>
                <p className="text-2xl font-normal tracking-tighter text-[var(--ink)] dark:text-white">
                  {fmt(shTimes?.end)}
                </p>
              </div>
              <div className="mt-2 flex justify-center text-indigo-500 opacity-20">
                <Moon size={18} />
              </div>
            </div>
          </div>
        </section>

        {/* Row 2: Registry Roadmap */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 pb-40">
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
                      ? "border-blue-600 shadow-3xl ring-2 ring-blue-600/5"
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
                        <h4 className="text-2xl font-normal text-[var(--ink)] dark:text-white uppercase truncate italic tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
                          {ev.title}
                        </h4>
                      </div>
                      <EventStatus event={ev} />
                    </div>
                    <div className="flex items-center gap-10 text-right shrink-0 border-l border-[var(--border-subtle)] pl-10">
                      <div className="flex flex-col justify-center min-w-[100px]">
                        <p className="text-4xl font-normal tracking-tighter text-[var(--ink)] dark:text-white leading-none">
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
                            "rotate-180 bg-blue-600 text-white shadow-lg"
                        )}
                      >
                        <ChevronDown size={20} strokeWidth={3} />
                      </div>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-8 pb-10 animate-in slide-in-from-top-6 duration-700">
                      <div className="p-10 bg-[var(--surface-hover)] rounded-[3rem] border border-[var(--border-subtle)] shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-20" />
                        <div className="flex items-center gap-4 text-blue-600 mb-8">
                          <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
                            <Info size={18} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-[0.3em]">
                            {ev.category}
                          </span>
                        </div>
                        <div className="prose prose-md max-w-none">
                          <p className="text-xl leading-relaxed text-[var(--ink-muted)] dark:text-zinc-300 font-serif italic">
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
                            className="btn-ghost px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest border border-[var(--border-subtle)] bg-white/50 dark:bg-zinc-800/50"
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
          Digital Beit Midrash Protocol v2.1
        </span>
      </div>
    </div>
  );
}
