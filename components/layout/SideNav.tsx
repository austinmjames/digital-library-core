"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { formatEffectiveDate, useZmanim } from "@/lib/hooks/useZmanim";
import { cn } from "@/lib/utils/utils";
import {
  Bookmark,
  BookOpen,
  Calendar,
  ChevronRight,
  Database,
  Flame,
  Loader2,
  Settings,
  Share2,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

/**
 * DrashX Side Navigation (Robust v2.6 - Session Optimized)
 * Filepath: components/layout/SideNav.tsx
 * Role: Primary Nav with integrated Zmanim Engine and Auth-Aware routing.
 * Fixes:
 * - Replaced 'any' with Record<string, unknown> for type safety.
 * - Optimized study schedule to refresh once per session using useRef.
 * - Refined hover logic for the Study Briefing popover.
 */

interface SideNavProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  // Strictly typed to match lib/data/user.ts return structure
  user?: {
    id: string;
    email?: string;
    tier: "free" | "pro";
    onboarding_complete: boolean;
    avatar_config: Record<string, unknown>; // Fixed 'any' type error
    display_name: string;
    avatar_url: string | null;
    is_admin: boolean;
    contribution_score: number;
  };
}

interface StudyPortion {
  title: string;
  ref: string;
  category: "Daf Yomi" | "Parashah";
}

interface HebcalItem {
  category: string;
  title: string;
  memo?: string;
}

const parseHebcalItems = (items: HebcalItem[]): StudyPortion[] => {
  return items
    .map((item) => {
      let category: "Daf Yomi" | "Parashah" = "Parashah";
      let ref = "";

      if (item.category === "dafyomi") {
        category = "Daf Yomi";
        const parts = item.title.split(" ");
        if (parts.length >= 2) {
          ref = `${parts[0]}.${parts[1]}a`;
        }
      } else if (item.category === "parashat") {
        category = "Parashah";
        ref = item.memo || "";
      }

      return { title: item.title, ref, category };
    })
    .filter((p) => p.ref !== "");
};

export const SideNav: React.FC<SideNavProps> = ({
  activeTab: propsActiveTab,
  setActiveTab: propsSetActiveTab,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // Real-time client-side auth state
  const {
    profile,
    user: authUser,
    isLoading: authLoading,
    isAuthenticated,
  } = useAuth();
  const { effectiveDate, loading: zmanimLoading, isAfterSunset } = useZmanim();

  const [portions, setPortions] = useState<StudyPortion[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  // PRD Fix: Track if we've already synced the schedule for this session
  const hasSyncedSession = useRef(false);

  const isAdmin = profile?.tier === "pro";

  useEffect(() => {
    const fetchSchedule = async () => {
      // Logic: Only refresh at the start of the session (when effectiveDate is first available)
      if (zmanimLoading || hasSyncedSession.current) return;

      setScheduleLoading(true);
      const dateStr = formatEffectiveDate(effectiveDate);

      try {
        console.debug(
          `[ZmanimEngine] Initializing session schedule for: ${dateStr}`
        );

        // Mock data logic - in production this connects to useStudyPlan query
        const mockData: HebcalItem[] = [
          { category: "dafyomi", title: "Bava Batra 14" },
          {
            category: "parashat",
            title: "Parashat Noach",
            memo: "Genesis.6.9",
          },
        ];

        setPortions(parseHebcalItems(mockData));
        hasSyncedSession.current = true; // Mark as initialized for this session
      } catch (err) {
        console.error("Failed to fetch study schedule", err);
      } finally {
        setScheduleLoading(false);
      }
    };

    fetchSchedule();
  }, [effectiveDate, zmanimLoading]);

  const activeTab =
    propsActiveTab ||
    (pathname?.startsWith("/library") && !pathname.includes("tab=community")
      ? "library"
      : pathname?.includes("tab=community")
      ? "community"
      : pathname?.startsWith("/editor")
      ? "studio"
      : pathname?.startsWith("/admin")
      ? "admin"
      : "library");

  const handleNav = (id: string) => {
    if (propsSetActiveTab) {
      propsSetActiveTab(id);
      return;
    }

    switch (id) {
      case "library":
        router.push("/library");
        break;
      case "community":
        router.push("/library?tab=community");
        break;
      case "studio":
        router.push("/editor");
        break;
      case "admin":
        router.push("/admin/ingest");
        break;
      case "settings":
        if (!isAuthenticated) {
          router.push("/login");
        } else {
          router.push("/settings");
        }
        break;
      case "profile":
        if (!isAuthenticated) {
          router.push("/login");
        } else if (profile?.username) {
          router.push(`/u/${profile.username}`);
        } else {
          router.push("/settings");
        }
        break;
    }
  };

  const navItems = [
    { id: "library", icon: BookOpen, label: "Library" },
    { id: "community", icon: Share2, label: "Community" },
    { id: "studio", icon: Bookmark, label: "Studio" },
  ];

  return (
    <nav className="hidden md:flex flex-col w-20 h-screen bg-zinc-950 items-center py-6 border-r border-zinc-900 z-50 flex-shrink-0 sticky top-0 shadow-2xl">
      <div
        className="mb-8 p-3 bg-zinc-900 rounded-xl text-white shadow-lg cursor-pointer hover:bg-zinc-800 transition-all border border-zinc-800 hover:scale-105"
        onClick={() => router.push("/library")}
      >
        <BookOpen size={24} />
      </div>

      <div className="flex flex-col gap-6 w-full px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={cn(
              "p-3 rounded-xl transition-all flex justify-center group relative",
              activeTab === item.id
                ? "bg-zinc-800 text-white shadow-inner"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
            )}
          >
            <item.icon size={22} />
            <span className="absolute left-16 bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-zinc-700 z-[60] whitespace-nowrap">
              {item.label}
            </span>
          </button>
        ))}

        {isAdmin && (
          <button
            onClick={() => handleNav("admin")}
            className={cn(
              "p-3 rounded-xl transition-all flex justify-center group relative mt-2 pt-4 border-t border-zinc-900",
              activeTab === "admin"
                ? "bg-emerald-900/20 text-emerald-400 shadow-inner"
                : "text-zinc-500 hover:text-emerald-400 hover:bg-zinc-900"
            )}
          >
            <Database size={22} />
            <span className="absolute left-16 bg-zinc-900 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-emerald-900/30 z-[60] whitespace-nowrap">
              Admin Ingest
            </span>
          </button>
        )}

        {/* --- Temporal Study Trigger --- */}
        <div className="relative pt-4 border-t border-zinc-800 w-full flex justify-center mt-2">
          {/* group-hover controls visibility of popover */}
          <div className="group relative flex justify-center p-3 rounded-xl text-zinc-500 hover:text-orange-400 hover:bg-zinc-900 transition-all cursor-pointer">
            {scheduleLoading ? (
              <Loader2 size={22} className="animate-spin text-zinc-700" />
            ) : (
              <Calendar
                size={22}
                className={cn(
                  "transition-colors",
                  isAfterSunset && "text-orange-500"
                )}
              />
            )}

            {/* Popover Logic: Hidden by default (opacity-0), visible on group-hover */}
            <div className="absolute left-16 top-[-50px] w-64 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 shadow-2xl z-[70] transform scale-95 group-hover:scale-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Study Briefing
                </span>
                {isAfterSunset && (
                  <span className="text-[9px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded border border-orange-500/20 uppercase font-bold">
                    Post-Sunset
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {portions.length > 0 ? (
                  portions.map((portion) => (
                    <div
                      key={portion.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/read/${portion.ref}`);
                      }}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600 transition-all cursor-pointer"
                    >
                      <div className="text-left">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase">
                          {portion.category}
                        </p>
                        <p className="text-xs font-medium text-zinc-200">
                          {portion.title}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-zinc-600" />
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-zinc-600 italic text-center">
                    The daily scroll is silent.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center gap-6 pb-6">
        <div className="text-center group cursor-help flex flex-col items-center gap-1">
          <Flame className="text-orange-500" size={20} />
          <span className="text-[10px] font-black text-orange-500 tracking-wider">
            XP
          </span>
          <span className="absolute left-16 mb-2 bg-zinc-800 text-white text-[10px] font-black uppercase px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-zinc-700 pointer-events-none">
            Scholar progression tracked in Dashboard
          </span>
        </div>

        <button
          onClick={() => handleNav("settings")}
          className="text-zinc-500 hover:text-white transition-colors"
          title="Account Settings"
        >
          <Settings size={22} />
        </button>

        <div
          className="relative w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 overflow-hidden hover:border-zinc-500 transition-all cursor-pointer group/avatar"
          onClick={() => handleNav("profile")}
        >
          {authLoading ? (
            <Loader2 size={16} className="animate-spin opacity-20" />
          ) : authUser?.user_metadata?.avatar_url ? (
            <Image
              src={authUser.user_metadata.avatar_url}
              alt="Scholar Profile"
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <div className="text-[14px] font-black uppercase text-zinc-600 group-hover/avatar:text-white">
              {profile?.display_name?.[0] || "?"}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
