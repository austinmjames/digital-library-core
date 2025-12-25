"use client";

import React from "react";
import {
  ChevronDown,
  Settings2,
  Globe,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/context/auth-context";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

interface ReaderHeaderProps {
  activeBook: string;
  activeChapter: number;
  onOpenNav: () => void;
  onOpenTranslations: () => void;
  onOpenMarketplace: () => void;
  onOpenProfile: () => void;
  onOpenAppearance: () => void;
  onToggleToday: () => void;
  isTodayActive?: boolean;
}

/**
 * components/reader/header/ReaderHeader.tsx
 * Updated: Increased Header height to h-20 to accommodate the larger DrashX branding.
 * Branding: Switched to responsive PNG-based Logo component.
 * Centered Navigation: Enhanced size and weighting for Segoe UI.
 */
export default function ReaderHeader({
  activeBook,
  activeChapter,
  onOpenNav,
  onOpenTranslations,
  onOpenMarketplace,
  onOpenProfile,
  onOpenAppearance,
  onToggleToday,
  isTodayActive,
}: ReaderHeaderProps) {
  const { user, isLoading: authLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-paper/80 backdrop-blur-xl border-b border-pencil/10 px-6 h-20 flex items-center justify-between transition-colors duration-500">
      {/* LEFT: DrashX Branding - Larger responsive scale */}
      <div className="flex items-center z-10">
        <Link href="/library" className="group">
          <Logo type="responsive" size="sm" className="origin-left" />
        </Link>
      </div>

      {/* CENTER: Book / Chapter - Dead Centered with larger typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <Button
            variant="ghost"
            onClick={onOpenNav}
            className="h-12 px-6 text-ink hover:bg-black/5 dark:hover:bg-white/10 gap-2 font-sans text-xl active:scale-95 transition-all shadow-sm md:shadow-none bg-white md:bg-transparent rounded-full md:rounded-none"
          >
            <span className="font-semibold tracking-[0.05em]">
              {activeBook}
            </span>
            <span className="text-pencil text-lg font-medium ml-1 tracking-[0.05em]">
              {activeChapter}
            </span>
            <ChevronDown className="w-4 h-4 text-pencil/50 ml-0.5" />
          </Button>
        </div>
      </div>

      {/* RIGHT: Tools & User Context */}
      <div className="flex items-center gap-1 md:gap-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMarketplace}
          className="w-11 h-11 rounded-full text-accent hover:bg-accent/5 transition-all active:scale-90"
          title="Marketplace"
        >
          <ShoppingBag className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleToday}
          className={cn(
            "w-11 h-11 rounded-full text-pencil hover:bg-black/5 transition-all active:scale-90",
            isTodayActive && "bg-accent/10 text-accent shadow-inner"
          )}
          title="Sanctuary"
        >
          <Calendar className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenTranslations}
          className="w-11 h-11 rounded-full text-ink hover:bg-black/5 transition-all active:scale-90"
          title="My Layers"
        >
          <Globe className="w-6 h-6 text-pencil" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenAppearance}
          className="w-11 h-11 rounded-full text-ink hover:bg-black/5 transition-all active:scale-90"
          title="Display Settings"
        >
          <Settings2 className="w-6 h-6 text-pencil" />
        </Button>

        {!authLoading &&
          (user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenProfile}
              className="w-11 h-11 rounded-full border border-pencil/10 bg-white/50 ml-1 shadow-sm transition-transform active:scale-90 flex items-center justify-center overflow-hidden"
              title="My Profile"
            >
              <Logo
                type="icon"
                size="sm"
                className="border-none shadow-none bg-transparent scale-60"
              />
            </Button>
          ) : (
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-5 rounded-full text-[11px] font-black uppercase tracking-widest text-pencil"
              >
                Login
              </Button>
            </Link>
          ))}
      </div>
    </header>
  );
}
