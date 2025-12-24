"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Calendar, Loader2, Library, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchDailyLearning,
  fetchUpcomingEvents,
  DailySchedule,
  UpcomingInfo,
} from "@/lib/hebcal";
import {
  getParashaRedirect,
  resolveStudyRef,
  getUserProfile,
  updateUserLocation,
} from "@/app/actions";

// Segmented Sub-Components
import ScheduleManager from "./today/ScheduleManager";
import { LocationHeader } from "./today/LocationHeader";
import { ZmanimCard } from "./today/ZmanimCard";
import { LearningCycles } from "./today/LearningCycles";
import { HolidayEvents } from "./today/HolidayEvents";

interface TodayMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

type MenuTab = "TODAY" | "SCHEDULES";

/**
 * TodayMenu
 * Main orchestrator for the Daily Sanctuary sidebar.
 * Refactored into specialized sub-components for maintainability.
 */
export function TodayMenu({ isOpen, onClose, onOpen }: TodayMenuProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MenuTab>("TODAY");
  const [learning, setLearning] = useState<DailySchedule | null>(null);
  const [calendar, setCalendar] = useState<UpcomingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Location State
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationName, setLocationName] = useState("Detected Location");
  const [zipInput, setZipInput] = useState("");

  /**
   * initData
   * Wrapped in useCallback to stabilize the reference for useEffect.
   */
  const initData = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getUserProfile();
      const zip = profile?.location_zip;
      if (zip) {
        setLocationName(profile.location_name || "Saved Location");
      }

      const [learnData, calData] = await Promise.all([
        fetchDailyLearning(),
        fetchUpcomingEvents(zip),
      ]);
      setLearning(learnData);
      setCalendar(calData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      onOpen?.();
      initData();
    }
  }, [isOpen, onOpen, initData]);

  async function handleSaveLocation() {
    if (!zipInput || zipInput.length < 5) return;
    setIsEditingLocation(false);
    setLoading(true);
    try {
      const mockCity = `Zip: ${zipInput}`;
      await updateUserLocation(zipInput, mockCity);
      setLocationName(mockCity);
      const calData = await fetchUpcomingEvents(zipInput);
      setCalendar(calData);
    } finally {
      setLoading(false);
    }
  }

  const handleStudyClick = async (type: string, name: string, ref: string) => {
    onClose();
    if (type === "parasha") {
      const redirect = await getParashaRedirect(name);
      if (redirect) {
        router.push(`/library/tanakh/${redirect.book}/${redirect.chapter}`);
        return;
      }
    }
    const path = await resolveStudyRef(ref);
    if (path) router.push(path);
  };

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-[400px] lg:w-[450px] bg-paper border-l border-pencil/10 z-50 transition-transform duration-300 ease-spring shadow-2xl flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-14 border-b border-pencil/10 flex items-center justify-between px-4 bg-paper/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pencil" />
            <h2 className="font-serif font-bold text-ink text-lg">
              Daily Sanctuary
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5 text-pencil" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1.5 gap-1 bg-pencil/5 mx-4 mt-4 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("TODAY")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
              activeTab === "TODAY"
                ? "bg-white text-ink shadow-sm"
                : "text-pencil/60"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            Today
          </button>
          <button
            onClick={() => setActiveTab("SCHEDULES")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
              activeTab === "SCHEDULES"
                ? "bg-white text-ink shadow-sm"
                : "text-pencil/60"
            )}
          >
            <Library className="w-3.5 h-3.5" />
            Schedules
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === "TODAY" ? (
            loading && !calendar ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4 text-pencil/30">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Gathering Wisdom...
                </p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                <LocationHeader
                  isEditing={isEditingLocation}
                  locationName={locationName}
                  zipInput={zipInput}
                  onZipChange={setZipInput}
                  onSave={handleSaveLocation}
                  onEditToggle={setIsEditingLocation}
                />

                <ZmanimCard calendar={calendar} />

                <LearningCycles
                  learning={learning}
                  onStudyClick={handleStudyClick}
                />

                <HolidayEvents events={calendar?.events || []} />
              </div>
            )
          ) : (
            <ScheduleManager />
          )}
        </div>

        <div className="p-4 border-t border-pencil/10 bg-pencil/5 text-center">
          <p className="text-[9px] text-pencil uppercase font-bold tracking-widest leading-loose">
            {todayDate} • Jerusalem:{" "}
            {new Date().toLocaleTimeString("he-IL", {
              timeZone: "Asia/Jerusalem",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </aside>
    </>
  );
}
