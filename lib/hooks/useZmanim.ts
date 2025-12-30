// Filepath: src/lib/hooks/useZmanim.ts

import { useCallback, useEffect, useState } from "react";

/**
 * useZmanim Hook
 * Role: Logic Core Pillar - Temporal Synchronization.
 * Purpose: Fetches local halakhic times and determines the "Effective Torah Date".
 * Logic: If the current time is past sunset, the effectiveDate is incremented to tomorrow
 * to align with the start of the Jewish day.
 * PRD Reference: Section 1.3 (Time-Aware Study) & Core Systems Section 4 (Geolocation)
 */

const LOCATION_STORAGE_KEY = "drashx_user_location";

interface ZmanimData {
  sunset: Date | null;
  sunrise: Date | null;
  effectiveDate: Date;
  isAfterSunset: boolean;
  location: { lat: number; lng: number } | null;
  loading: boolean;
  error: string | null;
}

interface HebcalZmanimResponse {
  date: string;
  times: {
    sunset: string;
    sunrise: string;
    [key: string]: string;
  };
}

export const useZmanim = () => {
  const [data, setData] = useState<ZmanimData>({
    sunset: null,
    sunrise: null,
    effectiveDate: new Date(),
    isAfterSunset: false,
    location: null,
    loading: true,
    error: null,
  });

  // Helper: Calculate effective date based on a given sunset time
  const calculateEffectiveDate = useCallback((sunsetDate: Date) => {
    const now = new Date();
    const isAfter = now > sunsetDate;
    const effective = new Date(now);

    if (isAfter) {
      effective.setDate(effective.getDate() + 1);
    }

    return { isAfter, effective };
  }, []);

  // 1. Core Fetch Logic
  const fetchZmanim = useCallback(
    async (lat: number, lng: number) => {
      try {
        const response = await fetch(
          `https://www.hebcal.com/zmanim?cfg=json&latitude=${lat}&longitude=${lng}&date=now`
        );

        if (!response.ok) throw new Error("Failed to fetch zmanim");

        const zmanimJson: HebcalZmanimResponse = await response.json();

        // Parse ISO strings
        const sunset = new Date(zmanimJson.times.sunset);
        const sunrise = new Date(zmanimJson.times.sunrise);

        // Determine initial effective date
        const { isAfter, effective } = calculateEffectiveDate(sunset);

        setData({
          sunset,
          sunrise,
          effectiveDate: effective,
          isAfterSunset: isAfter,
          location: { lat, lng },
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error(
          "[ZmanimEngine] Fetch error:",
          err instanceof Error ? err.message : err
        );
        setData((prev) => ({
          ...prev,
          loading: false,
          error: "Error fetching Torah times from Hebcal",
        }));
      }
    },
    [calculateEffectiveDate]
  );

  // 2. Initialization Effect (Cache First -> Geo API Second)
  useEffect(() => {
    const initLocation = async () => {
      // A. Check LocalStorage
      const cachedLoc = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (cachedLoc) {
        try {
          const { lat, lng } = JSON.parse(cachedLoc);
          await fetchZmanim(lat, lng);
          return;
        } catch (e) {
          console.warn("[ZmanimEngine] Failed to parse cached location", e);
          localStorage.removeItem(LOCATION_STORAGE_KEY);
        }
      }

      // B. Fallback to Browser Geolocation
      if (!navigator.geolocation) {
        setData((prev) => ({
          ...prev,
          loading: false,
          error: "Geolocation not supported",
        }));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Cache for future visits
          localStorage.setItem(
            LOCATION_STORAGE_KEY,
            JSON.stringify({ lat: latitude, lng: longitude })
          );
          fetchZmanim(latitude, longitude);
        },
        (err) => {
          console.warn("[ZmanimEngine] Geolocation error:", err.message);
          setData((prev) => ({
            ...prev,
            loading: false,
            error: "Location permission denied. Using system time.",
          }));
        }
      );
    };

    initLocation();
  }, [fetchZmanim]);

  // 3. Live Watcher: Re-check "After Sunset" status every minute
  // This ensures the UI updates to "Night Mode" or "Next Day" if the user leaves the tab open.
  useEffect(() => {
    if (!data.sunset) return;

    const intervalId = setInterval(() => {
      const { isAfter, effective } = calculateEffectiveDate(data.sunset!);

      // Only update state if something changed to prevent re-renders
      if (
        isAfter !== data.isAfterSunset ||
        effective.getDate() !== data.effectiveDate.getDate()
      ) {
        setData((prev) => ({
          ...prev,
          isAfterSunset: isAfter,
          effectiveDate: effective,
        }));
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [
    data.sunset,
    data.isAfterSunset,
    data.effectiveDate,
    calculateEffectiveDate,
  ]);

  return data;
};

/**
 * Helper: formatEffectiveDate
 * Formats a Date object to YYYY-MM-DD for compatibility with Hebcal and
 * Supabase query parameters.
 */
export const formatEffectiveDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};
