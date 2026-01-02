"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";

/**
 * useZmanim Hook (v3.1 - Utility Export)
 * Filepath: lib/hooks/useZmanim.ts
 * Role: Provides location-aware temporal data for DrashX.
 * logic: Database Override > Browser Geolocation > Dallas Default.
 */

interface LocationState {
  lat: number;
  lng: number;
  city?: string;
  zip?: string;
  source: "database" | "browser" | "default";
}

/**
 * formatEffectiveDate
 * Utility to standardize date strings for API consumption (Hebcal/Sefaria).
 */
export const formatEffectiveDate = (date: Date) => {
  return date.toISOString().split("T")[0];
};

export function useZmanim() {
  const { user } = useAuth();
  const supabase = createClient();

  const [location, setLocation] = useState<LocationState>({
    lat: 32.7767,
    lng: -96.797,
    city: "Dallas",
    source: "default",
  });

  const [effectiveDate, setEffectiveDate] = useState(new Date());
  const [isAfterSunset, setIsAfterSunset] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Resolve Location (Waterfall Logic)
  const resolveLocation = useCallback(async () => {
    setLoading(true);

    // Step A: Check Database for User Override
    if (user) {
      const { data } = await supabase
        .from("user_settings")
        .select("lat, lng, city_name, zip_code")
        .eq("user_id", user.id)
        .single();

      if (data?.lat && data?.lng) {
        setLocation({
          lat: Number(data.lat),
          lng: Number(data.lng),
          city: data.city_name || undefined,
          zip: data.zip_code || undefined,
          source: "database",
        });
        setLoading(false);
        return;
      }
    }

    // Step B: Fallback to Browser Geolocation
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            source: "browser",
          });
          setLoading(false);
        },
        () => {
          // Final Fallback: Dallas (already set in state)
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    resolveLocation();
  }, [resolveLocation]);

  // 2. Temporal Logic (Check for Sunset)
  useEffect(() => {
    async function checkTemporalShift() {
      try {
        const res = await fetch(
          `https://api.sunrise-sunset.org/json?lat=${location.lat}&lng=${location.lng}&formatted=0`
        );
        const json = await res.json();
        if (json.status === "OK") {
          const sunsetTime = new Date(json.results.sunset);
          const now = new Date();
          const shifted = now > sunsetTime;
          setIsAfterSunset(shifted);

          if (shifted) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setEffectiveDate(tomorrow);
          } else {
            setEffectiveDate(now);
          }
        }
      } catch (err) {
        console.error("Temporal shift check failed", err);
      }
    }
    checkTemporalShift();
  }, [location]);

  return {
    location,
    effectiveDate,
    isAfterSunset,
    loading,
    sunrise: new Date(), // Placeholder for full implementation
    sunset: new Date(), // Placeholder for full implementation
    refresh: resolveLocation,
  };
}
