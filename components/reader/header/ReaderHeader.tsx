"use client";

import {
  Library,
  ChevronDown,
  Settings2,
  Globe,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DisplayModeGrid } from "./DisplayModeGrid";
import { TranslationSelector } from "./TranslationSelector";
import { AppearanceSettings } from "./AppearanceSettings";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/context/auth-context";
import Link from "next/link";

interface ReaderHeaderProps {
  activeBook: string;
  activeChapter: number;
  onOpenNav: () => void;
  onOpenTranslations: () => void;
  onToggleToday: () => void;
  isTodayActive?: boolean;
  activeVersionId: string;
  onSelectVersion: (id: string) => void;
}

/**
 * ReaderHeader
 * Main navigation and settings bar for the reading experience.
 * Updated to toggle between User Profile and Login based on authentication state.
 */
export function ReaderHeader({
  activeBook,
  activeChapter,
  onOpenNav,
  onOpenTranslations,
  onToggleToday,
  isTodayActive,
  activeVersionId,
  onSelectVersion,
}: ReaderHeaderProps) {
  const { user, isLoading: authLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-paper/80 backdrop-blur-xl border-b border-pencil/10 px-4 h-14 flex items-center justify-between transition-colors duration-500">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={onOpenNav}
          className="h-9 px-3 text-ink hover:bg-black/5 dark:hover:bg-white/10 gap-2 font-serif text-lg"
        >
          <Library className="w-4 h-4 text-pencil" />
          <span className="font-bold">{activeBook}</span>
          <span className="text-pencil text-base font-sans">
            {activeChapter}
          </span>
          <ChevronDown className="w-3 h-3 text-pencil/50 ml-1" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        {/* Daily Study / Calendar Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleToday}
          className={cn(
            "w-10 h-10 rounded-full text-pencil hover:bg-black/5 dark:hover:bg-white/10 transition-transform active:scale-95",
            isTodayActive && "bg-pencil/10 shadow-inner"
          )}
          title="Daily Study"
        >
          <Calendar className="w-5 h-5" />
        </Button>

        {/* Translation Layer Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenTranslations}
          className="w-10 h-10 rounded-full text-ink hover:bg-black/5 dark:hover:bg-white/10 transition-transform active:scale-95"
        >
          <Globe className="w-5 h-5 text-pencil" />
        </Button>

        {/* Settings / Appearance Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full text-ink hover:bg-black/5 dark:hover:bg-white/10 transition-transform active:scale-95"
            >
              <Settings2 className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 p-3 rounded-[2.2rem] border-pencil/10 shadow-2xl bg-paper/90 backdrop-blur-2xl"
          >
            <DisplayModeGrid />
            <DropdownMenuSeparator className="bg-pencil/10 mb-4 mx-1" />
            <TranslationSelector
              onOpenAdvanced={onOpenTranslations}
              activeVersionId={activeVersionId}
              onSelectVersion={onSelectVersion}
            />
            <DropdownMenuSeparator className="bg-pencil/10 mb-4 mx-1" />
            <AppearanceSettings />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Auth Trigger: Profile for logged in users, Login for guests */}
        {!authLoading &&
          (user ? (
            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full border border-pencil/10 bg-white/50 hover:bg-white transition-all active:scale-95 ml-1"
                title="Profile"
              >
                <User className="w-5 h-5 text-pencil" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-4 rounded-full text-xs font-bold uppercase tracking-wider text-pencil hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 ml-1"
              >
                Login
              </Button>
            </Link>
          ))}
      </div>
    </header>
  );
}
