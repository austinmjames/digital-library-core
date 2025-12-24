"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Library, Clock, Sparkles } from "lucide-react";
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

// Sub-components
import ScheduleManager from "./today/ScheduleManager";
import { LocationHeader } from "./today/LocationHeader";
import { ZmanimCard } from "./today/ZmanimCard";
import { LearningCycles } from "./today/LearningCycles";
import { HolidayEvents } from "./today/HolidayEvents";

interface TodayMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

type MenuTab = "TODAY" | "SCHEDULES";

/**
 * components/reader/TodayMenu.tsx
 * The "Daily Sanctuary" sidebar.
 * Provides a high-end portal into daily study, timing, and personal schedules.
 */
export function TodayMenu({ isOpen, onClose }: TodayMenuProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MenuTab>("TODAY");
  const [learning, setLearning] = useState<DailySchedule | null>(null);
  const [calendar, setCalendar] = useState<UpcomingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationName, setLocationName] = useState("Jerusalem");
  const [zipInput, setZipInput] = useState("");

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
    if (isOpen) initData();
  }, [isOpen, initData]);

  const handleSaveLocation = async () => {
    if (!zipInput || zipInput.length < 5) return;
    setIsEditingLocation(false);
    setLoading(true);
    try {
      await updateUserLocation(zipInput, `Zip: ${zipInput}`);
      await initData();
    } finally {
      setLoading(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[45] animate-in fade-in duration-500"
        onClick={onClose}
      />

      <aside className="fixed top-0 right-0 h-full w-full md:w-[400px] lg:w-[450px] bg-paper border-l border-pencil/10 z-50 transition-transform duration-500 ease-spring shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-8">
        {/* Header */}
        <div className="h-20 border-b border-pencil/5 flex items-center justify-between px-8 bg-paper/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-ink tracking-tight">
              Daily Sanctuary
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-pencil/5 transition-all active:scale-75 group"
          >
            <X className="w-6 h-6 text-pencil group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Premium Segmented Control */}
        <div className="px-8 py-6 bg-paper border-b border-pencil/[0.03]">
          <div className="flex p-1.5 gap-1.5 bg-pencil/5 rounded-2xl relative">
            <div
              className={cn(
                "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-[0.8rem] bg-white shadow-xl shadow-black/5 transition-all duration-300 ease-spring",
                activeTab === "SCHEDULES" ? "translate-x-full" : "translate-x-0"
              )}
            />
            <button
              onClick={() => setActiveTab("TODAY")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-black uppercase tracking-widest z-10 transition-colors duration-300",
                activeTab === "TODAY"
                  ? "text-ink"
                  : "text-pencil/50 hover:text-pencil"
              )}
            >
              <Clock className="w-4 h-4" />
              Portal
            </button>
            <button
              onClick={() => setActiveTab("SCHEDULES")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-black uppercase tracking-widest z-10 transition-colors duration-300",
                activeTab === "SCHEDULES"
                  ? "text-ink"
                  : "text-pencil/50 hover:text-pencil"
              )}
            >
              <Library className="w-4 h-4" />
              Schedules
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-10 pb-32">
          {activeTab === "TODAY" ? (
            loading && !calendar ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-6 text-pencil/20">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">
                  Gathering Wisdom...
                </p>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

        {/* Sticky Utility Footer */}
        <footer className="absolute bottom-0 left-0 right-0 p-6 border-t border-pencil/5 bg-paper/90 backdrop-blur-xl z-20 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-pencil/50 uppercase font-black tracking-widest">
              {todayDate}
            </p>
            <p className="text-[9px] text-gold font-bold uppercase tracking-tighter italic">
              Sanctuary in Time
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-ink font-mono font-bold">
              Jerusalem:{" "}
              {new Date().toLocaleTimeString("he-IL", {
                timeZone: "Asia/Jerusalem",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </footer>
      </aside>
    </>
  );
}
