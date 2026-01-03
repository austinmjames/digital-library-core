"use client";

import { Avatar, AvatarConfig } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils/utils";
import { UserProfile } from "@/types/user";
import {
  Bookmark,
  BookOpen,
  Calendar,
  Database,
  Loader2,
  LogIn,
  Settings,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

/**
 * SideNav Component (v9.2 - Hook-Safe Identity Rail)
 * Filepath: components/layout/SideNav.tsx
 * Role: Primary navigation rail and bottom-hud for the DrashX registry.
 * Fixes: Corrected Hook order to prevent conditional useMemo calls.
 */

interface SideNavProps {
  user?: UserProfile;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  adminOnly?: boolean;
}

// Internal interface to map the database shape safely
interface SideNavRegistryAvatar {
  type: string;
  icon?: string;
  initials?: string;
  url?: string;
  color?: string;
  bg?: string;
}

// Desktop Main Stack (Top)
const PRIMARY_NAV: NavItem[] = [
  { label: "Library", icon: BookOpen, path: "/library" },
  { label: "Calendar", icon: Calendar, path: "/calendar" },
  { label: "Editor", icon: Bookmark, path: "/editor" },
];

export function SideNav({ user: initialUser }: SideNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    profile: clientProfile,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const profile = (clientProfile as UserProfile) || initialUser;

  // Type-Safe Avatar Mapping
  // Moved ABOVE the early return to comply with the Rules of Hooks.
  const avatarConfig: AvatarConfig | undefined = React.useMemo(() => {
    if (!profile?.avatar_config) return undefined;

    const raw = profile.avatar_config as SideNavRegistryAvatar;
    const typeMapping: Record<string, "image" | "text" | "icon"> = {
      image: "image",
      text: "text",
      icon: "icon",
      generated: "icon", // Handle legacy/variant naming
    };

    const uiType = typeMapping[raw.type] || "icon";

    return {
      type: uiType,
      value:
        uiType === "image"
          ? raw.url ?? ""
          : uiType === "icon"
          ? raw.icon ?? "user"
          : raw.initials ?? "",
      color: raw.color ?? "text-white",
      bg: raw.bg ?? "bg-zinc-500",
    };
  }, [profile]);

  // Guard: SideNav should not appear on the splash/homepage
  // Positioned AFTER all Hook calls.
  if (pathname === "/") return null;

  const isAdmin = profile?.tier === "pro";

  /**
   * Shared Nav Button Component (M3 Standard)
   */
  const NavButton = ({
    item,
    isMobile = false,
  }: {
    item: NavItem;
    isMobile?: boolean;
  }) => {
    const isActive = pathname.startsWith(item.path);
    return (
      <button
        onClick={() => router.push(item.path)}
        className={cn(
          "flex flex-col items-center gap-1 group transition-all relative",
          isMobile ? "flex-1 py-2" : "w-full py-4"
        )}
      >
        <div
          className={cn(
            "relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300",
            isActive
              ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
              : "text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
          )}
        >
          <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span
          className={cn(
            "text-[10px] font-bold tracking-tight uppercase transition-colors",
            isActive
              ? "text-[var(--ink)]"
              : "text-[var(--ink-muted)] opacity-60"
          )}
        >
          {item.label}
        </span>
      </button>
    );
  };

  /**
   * Mobile HUD Logic
   */
  const MobileNav = () => {
    const isActive = (path: string) => pathname.startsWith(path);

    return (
      <nav
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 bg-[var(--paper)]/95 backdrop-blur-xl h-20 pb-safe z-[100] grid items-center px-2 border-t border-[var(--border-subtle)] shadow-2xl transition-all",
          isAdmin ? "grid-cols-6" : "grid-cols-5"
        )}
      >
        <NavButton
          item={{ label: "Calendar", icon: Calendar, path: "/calendar" }}
          isMobile
        />
        <NavButton
          item={{ label: "Editor", icon: Bookmark, path: "/editor" }}
          isMobile
        />

        {/* Library (Center Weighted) */}
        <button
          onClick={() => router.push("/library")}
          className="flex flex-col items-center gap-1 -mt-6"
        >
          <div
            className={cn(
              "w-16 h-16 flex items-center justify-center rounded-[2rem] transition-all shadow-xl",
              isActive("/library")
                ? "bg-[var(--accent-primary)] text-white scale-110 shadow-[var(--accent-primary)]/20"
                : "bg-white border-2 border-[var(--border-subtle)] text-[var(--ink-muted)]"
            )}
          >
            <BookOpen size={28} strokeWidth={2.5} />
          </div>
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-widest mt-1",
              isActive("/library")
                ? "text-[var(--accent-primary)]"
                : "text-[var(--ink-muted)]"
            )}
          >
            Library
          </span>
        </button>

        <NavButton
          item={{ label: "Settings", icon: Settings, path: "/settings" }}
          isMobile
        />

        {isAdmin && (
          <NavButton
            item={{ label: "Admin", icon: Database, path: "/admin" }}
            isMobile
          />
        )}

        <button
          onClick={() =>
            router.push(
              isAuthenticated || initialUser
                ? `/u/${profile?.username || "profile"}`
                : "/login"
            )
          }
          className="flex flex-col items-center gap-1 flex-1 py-2"
        >
          <div
            className={cn(
              "w-14 h-8 flex items-center justify-center rounded-full transition-all",
              pathname.startsWith("/u/") ? "bg-[var(--accent-primary)]/10" : ""
            )}
          >
            {(isAuthenticated || initialUser) && profile ? (
              <div className="w-6 h-6 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <Avatar
                  config={avatarConfig}
                  initials={profile?.display_name ?? ""}
                  size="sm"
                  className="h-full w-full"
                />
              </div>
            ) : (
              <User size={20} className="text-[var(--ink-muted)]" />
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tighter opacity-60">
            Account
          </span>
        </button>
      </nav>
    );
  };

  return (
    <>
      {/* 1. DESKTOP NAVIGATION RAIL (M3 Standard) */}
      <nav className="hidden md:flex flex-col w-20 h-screen bg-[var(--paper)] items-center py-6 border-r border-[var(--border-subtle)] z-[100] sticky top-0 transition-colors">
        {/* Navigation Content Stack (Top) */}
        <div className="flex flex-col gap-2 w-full items-center">
          {PRIMARY_NAV.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
        </div>

        {/* Identity & Utility Cluster (Bottom) */}
        <div className="mt-auto flex flex-col gap-2 w-full items-center pb-6">
          {isAdmin && (
            <NavButton
              item={{ label: "Admin", icon: Database, path: "/admin" }}
            />
          )}

          {/* Profile Identity Anchor (Now Primary HUD Item) */}
          <button
            onClick={() =>
              router.push(
                isAuthenticated || initialUser
                  ? `/u/${profile?.username || "profile"}`
                  : "/login"
              )
            }
            className={cn(
              "relative w-12 h-12 rounded-full border transition-all overflow-hidden flex items-center justify-center hover:scale-105 active:scale-95",
              pathname.startsWith("/u/")
                ? "border-[var(--accent-primary)] shadow-md"
                : "border-[var(--border-subtle)]"
            )}
            title="Registry Profile"
          >
            {authLoading && !initialUser ? (
              <Loader2 size={16} className="animate-spin opacity-20" />
            ) : (isAuthenticated || initialUser) && profile ? (
              <Avatar
                config={avatarConfig}
                initials={profile.display_name ?? ""}
                size="sm"
                className="h-full w-full rounded-none"
              />
            ) : (
              <div className="p-2 text-[var(--ink-muted)]">
                <LogIn size={20} />
              </div>
            )}
          </button>

          {/* Settings Icon (Positioned UNDER Profile) */}
          <NavButton
            item={{ label: "Settings", icon: Settings, path: "/settings" }}
          />
        </div>
      </nav>

      {/* 2. MOBILE BOTTOM HUD */}
      <MobileNav />
    </>
  );
}
