import axios from "axios";

/**
 * lib/hebcal.ts
 * Interfaces and fetchers for Jewish Calendar data.
 */

export interface StudyItem {
  name: string;
  ref: string; // The text reference (e.g., "Berakhot 2")
  url?: string;
}

export interface DailySchedule {
  date: string;
  dafyomi?: StudyItem;
  mishnayomi?: StudyItem;
  parasha?: StudyItem;
  haftarah?: StudyItem;
  tanya?: StudyItem; // Placeholder for now
}

export interface CalendarEvent {
  title: string;
  date: string; // ISO date string
  category:
    | "candles"
    | "havdalah"
    | "holiday"
    | "roshchodesh"
    | "fast"
    | "zmanim"
    | "other";
  subcat?: string;
  memo?: string;
  yomtov?: boolean; // True if work is prohibited
}

export interface UpcomingInfo {
  shabbat: {
    start?: string; // Candle lighting
    end?: string; // Havdalah
    parasha?: string;
  };
  events: CalendarEvent[];
}

// Helper types for the raw API response to satisfy TypeScript
interface HebcalLearningItem {
  name: string;
  ref?: string;
  url?: string;
}

interface HebcalLearningResponse {
  date: string;
  dafyomi?: HebcalLearningItem;
  mishnayomi?: HebcalLearningItem;
  [key: string]: unknown; // Allow other properties
}

interface HebcalCalendarItem {
  title: string;
  date: string;
  category: string;
  subcat?: string;
  memo?: string;
  yomtov?: boolean;
  [key: string]: unknown;
}

interface HebcalCalendarResponse {
  items: HebcalCalendarItem[];
}

/**
 * Fetches daily learning schedules (Daf Yomi, etc.)
 */
export async function fetchDailyLearning(): Promise<DailySchedule> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await axios.get<HebcalLearningResponse>(
      `https://www.hebcal.com/learning?cfg=json&a=on&date=${today}`
    );
    const data = response.data;

    // Helper to format Sefaria-compatible refs from Hebcal data
    const formatRef = (item: HebcalLearningItem) => ({
      name: item.name, // e.g., "Berakhot 2"
      ref: item.ref || item.name,
      url: item.url,
    });

    return {
      date: data.date,
      dafyomi: data.dafyomi ? formatRef(data.dafyomi) : undefined,
      mishnayomi: data.mishnayomi ? formatRef(data.mishnayomi) : undefined,
      // Note: Parasha in the 'learning' API is often just the name
      // We might populate Parasha/Haftarah more reliably from the Calendar API below
    };
  } catch (error) {
    console.error("Failed to fetch daily learning:", error);
    return { date: new Date().toISOString() };
  }
}

/**
 * Fetches upcoming calendar events (Shabbat, Holidays)
 */
export async function fetchUpcomingEvents(): Promise<UpcomingInfo> {
  try {
    // Fetch generic calendar for holidays + Shabbat times via GeoIP
    const response = await axios.get<HebcalCalendarResponse>(
      "https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&year=now&ss=on&mf=on&c=on&geo=geoip&s=on"
    );

    const items = response.data.items || [];
    const now = new Date();

    // Filter for future events
    const futureEvents = items.filter((item) => new Date(item.date) >= now);

    // 1. Find upcoming Shabbat times
    const nextCandles = futureEvents.find((i) => i.category === "candles");
    const nextHavdalah = futureEvents.find((i) => i.category === "havdalah");
    const thisWeekParasha = futureEvents.find((i) => i.category === "parashat");

    // 2. Find next 3 distinct holidays/fasts (excluding individual candle times for them if possible)
    const holidays = futureEvents
      .filter((i) => ["holiday", "fast", "roshchodesh"].includes(i.category))
      .slice(0, 3)
      .map((i) => ({
        title: i.title,
        date: i.date,
        category: i.category as CalendarEvent["category"],
        subcat: i.subcat,
        memo: i.memo,
        yomtov: i.yomtov || false,
      }));

    return {
      shabbat: {
        start: nextCandles?.date,
        end: nextHavdalah?.date,
        parasha: thisWeekParasha?.title,
      },
      events: holidays,
    };
  } catch (error) {
    console.error("Failed to fetch calendar:", error);
    return { shabbat: {}, events: [] };
  }
}
