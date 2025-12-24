/**
 * lib/hebcal.ts
 * Resolved: Replaced all 'any' types with strict interfaces for API responses
 * and explicitly typed filter/map callback parameters.
 */

import {
  DailySchedule,
  UpcomingInfo,
  HebcalApiItem,
  HOLIDAY_ENRICHMENT,
  CalendarEvent,
  StudyItem,
} from "./hebcal-constants";

// Re-export types
export type {
  DailySchedule,
  UpcomingInfo,
  HebcalApiItem,
  CalendarEvent,
  StudyItem,
};

/**
 * HebcalLearningResponse
 * Interface for the Hebcal learning API JSON structure.
 */
interface HebcalLearningResponse {
  date: string;
  dafyomi?: { name: string; ref: string };
  mishnayomi?: { name: string; ref: string };
  nachyomi?: { name: string; ref: string };
  tanya?: { name: string; ref: string };
  rambam?: { name: string; ref: string };
}

/**
 * robustFetch
 * Utility to handle fetch requests with retries.
 */
async function robustFetch<T>(
  url: string,
  retries = 5,
  backoff = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return (await response.json()) as T;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((resolve) =>
        setTimeout(resolve, backoff * Math.pow(2, i))
      );
    }
  }
  throw new Error("Fetch failed after retries");
}

/**
 * fetchDailyLearning
 */
export async function fetchDailyLearning(): Promise<DailySchedule> {
  const today = new Date().toISOString().split("T")[0];
  try {
    const [learnData, calData] = await Promise.all([
      robustFetch<HebcalLearningResponse>(
        `https://www.hebcal.com/learning?cfg=json&a=on&date=${today}`
      ),
      robustFetch<{ items: HebcalApiItem[] }>(
        `https://www.hebcal.com/hebcal?v=1&cfg=json&s=on&year=now&month=now`
      ),
    ]);

    const calItems = calData.items || [];
    const parashaItem = calItems.find(
      (i: HebcalApiItem) => i.category === "parashat"
    );

    return {
      date: learnData.date,
      dafyomi: learnData.dafyomi
        ? {
            name: learnData.dafyomi.name,
            ref: learnData.dafyomi.ref || learnData.dafyomi.name,
          }
        : undefined,
      mishnayomi: learnData.mishnayomi
        ? {
            name: learnData.mishnayomi.name,
            ref: learnData.mishnayomi.ref || learnData.mishnayomi.name,
          }
        : undefined,
      nachyomi: learnData.nachyomi
        ? {
            name: learnData.nachyomi.name,
            ref: learnData.nachyomi.ref || learnData.nachyomi.name,
          }
        : undefined,
      parasha: parashaItem
        ? {
            name: parashaItem.title,
            ref: parashaItem.title,
          }
        : undefined,
      haftarah: parashaItem?.memo
        ? {
            name: "Haftarah",
            ref: parashaItem.memo,
          }
        : undefined,
      tanya: learnData.tanya
        ? {
            name: learnData.tanya.name,
            ref: learnData.tanya.ref || learnData.tanya.name,
          }
        : undefined,
      rambam: learnData.rambam
        ? {
            name: learnData.rambam.name,
            ref: learnData.rambam.ref || learnData.rambam.name,
          }
        : undefined,
    };
  } catch (error) {
    console.error("fetchDailyLearning Error:", error);
    return { date: today };
  }
}

/**
 * fetchUpcomingEvents
 */
export async function fetchUpcomingEvents(zip?: string): Promise<UpcomingInfo> {
  try {
    const locationQuery = zip ? `zip=${zip}` : `geo=geoip`;
    const data = await robustFetch<{ items: HebcalApiItem[] }>(
      `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&year=now&ss=on&mf=on&c=on&s=on&${locationQuery}`
    );

    const items = data.items || [];
    const now = new Date();

    const futureItems = items.filter(
      (item: HebcalApiItem) => new Date(item.date) >= now
    );
    const nextCandles = futureItems.find(
      (i: HebcalApiItem) => i.category === "candles"
    );
    const nextHavdalah = futureItems.find(
      (i: HebcalApiItem) => i.category === "havdalah"
    );
    const parasha = items.find((i: HebcalApiItem) => i.category === "parashat");

    return {
      shabbat: {
        start: nextCandles?.date,
        end: nextHavdalah?.date,
        parasha: parasha?.title,
        haftarah: parasha?.memo,
      },
      events: futureItems
        .filter((i: HebcalApiItem) =>
          ["holiday", "fast", "roshchodesh"].includes(i.category)
        )
        .filter(
          (v: HebcalApiItem, i: number, a: HebcalApiItem[]) =>
            a.findIndex((t: HebcalApiItem) => t.title === v.title) === i
        )
        .slice(0, 4)
        .map((i: HebcalApiItem) => {
          const title = i.title.replace(/ (I|II)$/, "");
          const meta = HOLIDAY_ENRICHMENT[title] || HOLIDAY_ENRICHMENT[i.title];

          return {
            title: i.title,
            date: i.date,
            category: i.category as CalendarEvent["category"],
            yomtov: i.yomtov || false,
            description: meta?.desc,
            status:
              meta?.status ||
              (i.category === "roshchodesh"
                ? "Minor Holiday"
                : i.yomtov
                ? "Yom Tov"
                : "Work Permitted"),
          };
        }),
    };
  } catch (error) {
    console.error("fetchUpcomingEvents Error:", error);
    return { shabbat: {}, events: [] };
  }
}
