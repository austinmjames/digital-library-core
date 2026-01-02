"use client";

import {
  Bookmark,
  BookOpen,
  Calendar,
  Database,
  LayoutDashboard,
  Loader2,
  LogIn,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import {
  Avatar,
  AvatarConfig as ComponentAvatarConfig,
} from "@/components/ui/Avatar";
import { useAuth } from "@/lib/hooks/useAuth";
import { useDailyPortions } from "@/lib/hooks/useDailyPortions";
import { useZmanim } from "@/lib/hooks/useZmanim";
import { cn } from "@/lib/utils/utils";
import { UserProfile } from "@/types/user";

/**
 * SideNav Component (v7.0 - Scholarly Design System Integration)
 * Filepath: components/layout/SideNav.tsx
 * Role: Primary navigation using unified global CSS tokens.
 * Design: High-density iconography with physical "indented" states for active links.
 */

interface SideNavProps {
  user?: UserProfile;
}

export const SideNav: React.FC<SideNavProps> = ({ user: initialUser }) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    profile: clientProfile,
    isLoading: authLoading,
    isAuthenticated,
  } = useAuth();

  const profile = (clientProfile as UserProfile) || initialUser;

  const { isAfterSunset } = useZmanim();
  const { data: portions, isLoading: portionsLoading } = useDailyPortions();
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const briefingRef = useRef<HTMLDivElement>(null);

  const currentAvatarConfig: ComponentAvatarConfig | undefined =
    profile?.avatar_config
      ? {
          type: profile.avatar_config.type === "image" ? "image" : "icon",
          value:
            profile.avatar_config.type === "image"
              ? profile.avatar_config.url || ""
              : profile.avatar_config.icon || "book",
          color: "text-white",
          bg: profile.avatar_config.color
            ? profile.avatar_config.color.startsWith("bg-")
              ? profile.avatar_config.color
              : `bg-${profile.avatar_config.color}`
            : "bg-zinc-500",
        }
      : undefined;

  const profilePath = isAuthenticated
    ? profile?.username
      ? `/u/${profile.username}`
      : "/settings"
    : "/login";
  const isAdmin = profile?.tier === "pro";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        briefingRef.current &&
        !briefingRef.current.contains(e.target as Node)
      )
        setIsBriefingOpen(false);
    };
    if (isBriefingOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isBriefingOpen]);

  // --- Sub-Render: Today's Studies (Scholarly Panel) ---
  const TodayStudies = () => (
    <div
      ref={briefingRef}
      className="absolute z-[120] scholarly-panel p-6 w-80 left-[calc(100%+1.5rem)] top-1/2 -translate-y-1/2 shadow-2xl animate-in fade-in zoom-in-95"
    >
      <div className="flex items-center justify-between mb-5">
        <span className="scholarly-label">Today&rsquo;s Studies</span>
        <button
          onClick={() => setIsBriefingOpen(false)}
          className="text-zinc-300 hover:text-zinc-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="space-y-2">
        {portionsLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-zinc-200" size={24} />
          </div>
        ) : (
          portions?.map((p) => (
            <button
              key={p.id}
              onClick={() => router.push(`/read/${p.ref}`)}
              className="w-full p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/40 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-zinc-100 dark:border-zinc-800 group shadow-sm"
            >
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1.5">
                {p.label}
              </p>
              <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-[var(--accent-primary)] transition-colors">
                {p.en_title}
              </p>
            </button>
          ))
        )}
      </div>
      {isAfterSunset && (
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-pulse shadow-sm" />
          <span className="text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-widest">
            Temporal shift active
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP SIDE NAV */}
      <nav className="hidden md:flex flex-col w-24 h-screen bg-white dark:bg-zinc-950 items-center py-8 border-r border-zinc-200/60 dark:border-zinc-900 z-[100] sticky top-0 shadow-sm transition-colors duration-400">
        {/* Logo Section */}
        <div
          className="mb-14 p-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
          onClick={() => router.push("/")}
        >
          <Image
            src="/logo-sm.png"
            alt="DX"
            width={44}
            height={44}
            className="object-contain grayscale opacity-60"
            priority
          />
        </div>

        {/* Navigation Actions */}
        <div className="flex flex-col gap-8 w-full items-center">
          {/* Library Access */}
          <button
            onClick={() => router.push("/library")}
            className={cn(
              "icon-status",
              pathname === "/library"
                ? "icon-status-primary"
                : "icon-status-disabled hover:text-zinc-900 dark:hover:text-zinc-300"
            )}
          >
            <BookOpen size={18} />
          </button>

          {/* Bookmarks / Editor */}
          <button
            onClick={() => router.push("/editor")}
            className={cn(
              "icon-status",
              pathname === "/editor"
                ? "icon-status-primary"
                : "icon-status-disabled hover:text-zinc-900"
            )}
          >
            <Bookmark size={18} />
          </button>

          {/* Admin Ingest (Conditional) */}
          {isAdmin ? (
            <button
              onClick={() => router.push("/admin/ingest")}
              className={cn(
                "icon-status",
                pathname.startsWith("/admin")
                  ? "icon-status-secondary"
                  : "icon-status-disabled hover:text-[var(--accent-secondary)]"
              )}
            >
              <Database size={18} />
            </button>
          ) : (
            <div className="icon-status icon-status-disabled opacity-20 cursor-not-allowed">
              <Database size={18} />
            </div>
          )}

          {/* Temporal Briefing Trigger */}
          <div className="relative w-full flex justify-center border-t border-zinc-100 dark:border-zinc-900 pt-8">
            <button
              onClick={() => setIsBriefingOpen(!isBriefingOpen)}
              className={cn(
                "icon-status",
                isBriefingOpen
                  ? "icon-status-primary"
                  : "icon-status-disabled hover:text-[var(--accent-primary)]"
              )}
            >
              <Calendar size={18} />
              {isAfterSunset && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-[var(--accent-primary)] rounded-full border-2 border-white dark:border-zinc-950 animate-pulse" />
              )}
            </button>
            {isBriefingOpen && <TodayStudies />}
          </div>
        </div>

        {/* User Identity Access */}
        <div className="mt-auto pb-4">
          <button
            onClick={() => router.push(profilePath)}
            className={cn(
              "relative w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border transition-all overflow-hidden flex items-center justify-center shadow-sm hover:scale-105 active:scale-95",
              pathname.startsWith("/u/")
                ? "border-[var(--accent-primary)] shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)]"
                : "border-zinc-200/60 dark:border-zinc-800"
            )}
          >
            {authLoading ? (
              <Loader2 size={16} className="animate-spin opacity-20" />
            ) : isAuthenticated && profile ? (
              <Avatar
                config={currentAvatarConfig}
                initials={profile.display_name}
                size="sm"
                className="rounded-none h-full w-full"
              />
            ) : (
              <LogIn size={20} className="text-zinc-300" />
            )}
          </button>
        </div>
      </nav>

      {/* 2. MOBILE HUD: Refined scholarly glass */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl h-20 z-[100] flex items-center justify-between px-10 border-t border-zinc-200/60 dark:border-zinc-900">
        <button
          onClick={() => router.push("/library")}
          className="text-zinc-300 hover:text-zinc-950 transition-colors"
        >
          <BookOpen size={20} />
        </button>

        <button
          onClick={() => router.push("/")}
          className="p-4 -mt-10 bg-zinc-950 rounded-[1.75rem] text-white shadow-2xl relative border-[6px] border-[var(--paper)] active:scale-95 transition-transform"
        >
          <LayoutDashboard size={24} />
          {isAfterSunset && (
            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--accent-primary)] rounded-full border-2 border-zinc-950 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => router.push(profilePath)}
          className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 overflow-hidden shadow-sm"
        >
          {isAuthenticated && profile && (
            <Avatar
              config={currentAvatarConfig}
              initials={profile.display_name}
              size="sm"
              className="h-full w-full"
            />
          )}
        </button>
      </nav>
    </>
  );
};
