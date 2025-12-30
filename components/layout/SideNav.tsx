"use client";

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
  Users,
} from "lucide-react";
import Image from "next/image"; // Import Next.js Image component
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

/**
 * DrashX Side Navigation (Robust v2.2)
 * Role: Primary Nav with integrated Zmanim Engine and Admin Mission Control.
 * Theme: Inverse (zinc-950)
 * Update: Replaced <img> with <Image /> for LCP optimization.
 */

interface SideNavProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  user?: {
    id: string;
    is_admin: boolean;
    contribution_score?: number;
    avatar_url?: string;
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
  link?: string;
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
  user,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { effectiveDate, loading: zmanimLoading, isAfterSunset } = useZmanim();

  const [portions, setPortions] = useState<StudyPortion[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (zmanimLoading) return;
      setScheduleLoading(true);
      const dateStr = formatEffectiveDate(effectiveDate);

      try {
        console.debug(`[ZmanimEngine] Syncing schedule for: ${dateStr}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockData: HebcalItem[] = [
          { category: "dafyomi", title: "Bava Batra 14" },
          {
            category: "parashat",
            title: "Parashat Noach",
            memo: "Genesis.6.9",
          },
        ];
        setPortions(parseHebcalItems(mockData));
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
    (pathname?.startsWith("/community")
      ? "community"
      : pathname?.startsWith("/notebooks")
      ? "notebooks"
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
      case "notebooks":
        router.push("/notebooks");
        break;
      case "admin":
        router.push("/admin/ingestion");
        break;
      case "settings":
        router.push("/settings");
        break;
      case "profile":
        router.push("/profile");
        break;
    }
  };

  const navItems = [
    { id: "library", icon: BookOpen, label: "Library" },
    { id: "community", icon: Share2, label: "Community" },
    { id: "notebooks", icon: Bookmark, label: "Notebooks" },
  ];

  return (
    <nav className="hidden md:flex flex-col w-20 h-screen bg-zinc-950 items-center py-6 border-r border-zinc-900 z-50 flex-shrink-0 sticky top-0 shadow-2xl">
      {/* Brand Logo */}
      <div
        className="mb-8 p-3 bg-zinc-900 rounded-xl text-white shadow-lg cursor-pointer hover:bg-zinc-800 transition-all border border-zinc-800 hover:scale-105"
        onClick={() => router.push("/library")}
      >
        <BookOpen size={24} />
      </div>

      {/* Main Links */}
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
            <span className="absolute left-16 bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-zinc-700 z-[60] whitespace-nowrap">
              {item.label}
            </span>
          </button>
        ))}

        {/* --- Admin Control (Conditional Render) --- */}
        {user?.is_admin && (
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
            <span className="absolute left-16 bg-zinc-900 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-emerald-900/30 z-[60] whitespace-nowrap">
              Admin Control
            </span>
          </button>
        )}

        {/* --- Temporal Study Trigger --- */}
        <div className="relative pt-4 border-t border-zinc-800 w-full flex justify-center mt-2">
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

            <div className="absolute left-16 top-[-50px] w-64 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl z-[70]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Today&rsquo;s Study
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
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600 transition-all cursor-pointer pointer-events-auto"
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
                  <p className="text-[10px] text-zinc-600 italic">
                    No study portions found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Utilities & Profile */}
      <div className="mt-auto flex flex-col items-center gap-6 pb-6">
        <div className="text-center group cursor-help flex flex-col items-center gap-1">
          <Flame className="text-orange-500 animate-pulse-slow" size={20} />
          <span className="text-[10px] font-bold text-orange-500 tracking-wider">
            {user?.contribution_score
              ? `${(user.contribution_score / 1000).toFixed(1)}k`
              : "0.0k"}
          </span>
          <span className="absolute left-16 mb-2 bg-zinc-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-zinc-700 pointer-events-none">
            Contribution Score: {user?.contribution_score || 0}
          </span>
        </div>

        <button
          onClick={() => handleNav("settings")}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <Settings size={22} />
        </button>

        {/* Updated Avatar Container with Relative Positioning for next/image */}
        <div
          className="relative w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 overflow-hidden hover:border-zinc-500 transition-all cursor-pointer"
          onClick={() => handleNav("profile")}
        >
          {user?.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt="Profile"
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <Users size={20} />
          )}
        </div>
      </div>
    </nav>
  );
};
