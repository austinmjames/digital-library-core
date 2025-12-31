import { useQuery } from "@tanstack/react-query";

/**
 * useZmanim Hook (v2.2 - Sunset-Aware Tying)
 * Filepath: lib/hooks/useZmanim.ts
 * Role: Provides temporal context and Jewish date "tying" logic.
 * PRD Alignment: Section 1.3 (Temporal Study) & 3.1 (Time Engine).
 * Fix: Added 'effectiveDate' logic to shift the study portion to the next day
 * automatically after sunset, satisfying the dependency in useStudyPlan.ts.
 */

export interface ZmanimData {
  times: {
    alotHaShachar: string;
    sunrise: string;
    misheyakir: string;
    sofZmanShmaMGA: string;
    sofZmanShmaGra: string;
    sofZmanTfillaGra: string;
    chatzot: string;
    minchaGedola: string;
    minchaKetana: string;
    plagHaMincha: string;
    sunset: string;
    tzeit7085: string;
  };
  location: {
    title: string;
  };
}

/**
 * Utility: Shorthand formatter for ISO strings used in DB queries
 */
export const formatEffectiveDate = (date: Date) =>
  date.toISOString().split("T")[0];

export function useZmanim(lat: number = 31.7683, lng: number = 35.2137) {
  const query = useQuery<ZmanimData, Error>({
    queryKey: ["zmanim", lat, lng],
    queryFn: async (): Promise<ZmanimData> => {
      const today = formatEffectiveDate(new Date());
      const url = `https://www.hebcal.com/zmanim?cfg=json&latitude=${lat}&longitude=${lng}&date=${today}`;

      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch Zmanim");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });

  // --- Tying Logic: Calculate Effective Study Date ---

  const getEffectiveDate = () => {
    if (!query.data?.times.sunset) return new Date();

    const now = new Date();
    const sunset = new Date(query.data.times.sunset);

    // If current time is after sunset, the Jewish day has shifted.
    // We "tie" the study portion to tomorrow's schedule.
    if (now > sunset) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    return now;
  };

  const effectiveDate = getEffectiveDate();
  const isAfterSunset = query.data?.times.sunset
    ? new Date() > new Date(query.data.times.sunset)
    : false;

  return {
    ...query,
    effectiveDate,
    isAfterSunset,
    loading: query.isLoading, // Alias for legacy hook compatibility
  };
}
