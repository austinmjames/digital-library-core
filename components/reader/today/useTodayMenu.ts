"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchDailyLearning,
  fetchUpcomingEvents,
  DailySchedule,
  UpcomingInfo,
} from "@/lib/hebcal";
import { getUserProfile, updateUserLocation } from "@/app/actions";

export interface ExtendedUpcomingInfo extends UpcomingInfo {
  zmanim?: {
    sunrise: string;
    sunset: string;
  };
}

/**
 * GeocodeComponent
 * Explicit interface for Google Geocoding response components.
 */
interface GeocodeComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

/**
 * useTodayMenu
 * Logic engine for the Daily Sanctuary.
 * Resolved: Fixed 'any' usage in geocoding and handled null profile cases.
 */
export function useTodayMenu(isOpen: boolean) {
  const [learning, setLearning] = useState<DailySchedule | null>(null);
  const [calendar, setCalendar] = useState<ExtendedUpcomingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("Jerusalem");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [zipInput, setZipInput] = useState("");

  const reverseGeocode = async (
    lat: number,
    lng: number
  ): Promise<string | null> => {
    const GOOGLE_MAPS_API_KEY = "";
    if (!GOOGLE_MAPS_API_KEY) return null;

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();
      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];
        // Fixed: Explicit type for address component
        const city = result.address_components.find((c: GeocodeComponent) =>
          c.types.includes("locality")
        )?.long_name;
        const state = result.address_components.find((c: GeocodeComponent) =>
          c.types.includes("administrative_area_level_1")
        )?.short_name;
        return city && state ? `${city}, ${state}` : result.formatted_address;
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
    return null;
  };

  const initData = useCallback(async (locationKey?: string) => {
    setLoading(true);
    try {
      const profile = await getUserProfile();
      const zip = locationKey || profile?.location_zip;

      if (zip && !locationKey) {
        // Fixed: Profile null handling with optional chaining and fallback
        setLocationName(profile?.location_name || "Saved Location");
        setZipInput(zip);
      }

      const [learnData, calData] = await Promise.all([
        fetchDailyLearning(),
        fetchUpcomingEvents(zip),
      ]);
      setLearning(learnData);
      setCalendar(calData as ExtendedUpcomingInfo);
    } catch (error) {
      console.error("Sanctuary hydration error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) initData();
  }, [initData, isOpen]);

  const handleSaveLocation = async () => {
    if (!zipInput) return;
    setIsEditingLocation(false);
    setLoading(true);
    try {
      await updateUserLocation(
        zipInput,
        zipInput.includes(",") ? "Detected Location" : locationName
      );
      await initData();
    } catch (err) {
      console.error("Location update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = useCallback(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coordsKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
        setIsEditingLocation(false);
        setLoading(true);

        const readableName = await reverseGeocode(latitude, longitude);
        const displayName = readableName || "Detected Location";

        setLocationName(displayName);
        await updateUserLocation(coordsKey, displayName);
        await initData(coordsKey);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLoading(false);
      }
    );
  }, [initData]);

  return {
    state: {
      learning,
      calendar,
      loading,
      locationName,
      isEditingLocation,
      zipInput,
    },
    actions: {
      setIsEditingLocation,
      setZipInput,
      handleSaveLocation,
      handleDetectLocation,
      refresh: initData,
    },
  };
}
