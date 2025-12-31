import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

/**
 * useZmanim Hook (v2.1)
 * Filepath: lib/hooks/useZmanim.ts
 * Role: Logic Core Pillar - Temporal Synchronization.
 * Purpose: Fetches local halakhic times and determines the "Effective Torah Date".
 * PRD Reference: Section 1.3 (Time-Aware Study) & Section 4 (Geolocation).
 * Fix: Standardized to TanStack Query and removed unused useCallback import.
 */

interface ZmanimTimes {
  sunset: string;
  sunrise: string;
  [key: string]: string;
}

interface HebcalResponse {
  date: string;
  times: ZmanimTimes;
}

export const useZmanim = () => {
  const supabase = createClient();
  const { user } = useAuth();

  /**
   * 1. Resolve Location (Identity-First)
   * Fetches lat/lng from user_settings or defaults to a scholarly standard (Jerusalem).
   */
  const { data: location } = useQuery({
    queryKey: ["user-location", user?.id],
    queryFn: async () => {
      if (!user) return { lat: 31.7683, lng: 35.2137 }; // Default: Jerusalem

      const { data } = await supabase
        .from("user_settings")
        .select("latitude, longitude")
        .eq("user_id", user.id)
        .single();

      if (data?.latitude && data?.longitude) {
        return { lat: data.latitude, lng: data.longitude };
      }

      // Fallback: Browser Geolocation (One-time permission)
      return new Promise<{ lat: number; lng: number }>((resolve) => {
        if (typeof window === "undefined" || !navigator.geolocation) {
          return resolve({ lat: 31.7683, lng: 35.2137 });
        }
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve({ lat: 31.7683, lng: 35.2137 })
        );
      });
    },
    staleTime: Infinity,
  });

  /**
   * 2. Fetch Zmanim (The Temporal Pulse)
   */
  const zmanimQuery = useQuery({
    queryKey: ["zmanim", location?.lat, location?.lng],
    enabled: !!location,
    queryFn: async (): Promise<HebcalResponse> => {
      const resp = await fetch(
        `https://www.hebcal.com/zmanim?cfg=json&latitude=${location?.lat}&longitude=${location?.lng}&date=now`
      );
      if (!resp.ok) throw new Error("Hebcal archives unreachable.");
      return resp.json();
    },
    staleTime: 1000 * 60 * 30, // 30-minute temporal cache
  });

  /**
   * 3. Logic Layer: Effective Date Calculation
   * PRD 1.3: The Jewish day begins at sunset.
   */
  const temporalContext = useMemo(() => {
    const now = new Date();
    if (!zmanimQuery.data) return { isAfterSunset: false, effectiveDate: now };

    const sunset = new Date(zmanimQuery.data.times.sunset);
    const isAfterSunset = now > sunset;
    const effectiveDate = new Date(now);

    if (isAfterSunset) {
      effectiveDate.setDate(effectiveDate.getDate() + 1);
    }

    return {
      isAfterSunset,
      effectiveDate,
      sunset,
      sunrise: new Date(zmanimQuery.data.times.sunrise),
    };
  }, [zmanimQuery.data]);

  return {
    ...temporalContext,
    loading: zmanimQuery.isLoading,
    error: zmanimQuery.error,
    location,
  };
};

/**
 * formatEffectiveDate
 * Role: Maps Date objects to the standard YYYY-MM-DD format for database keys.
 */
export const formatEffectiveDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};
