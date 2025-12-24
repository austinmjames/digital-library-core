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
 * components/reader/header/ReaderHeader.tsx
 * The primary navigation and settings bar.
 * Implements iOS-style glassmorphism and specialized Sovereignty triggers.
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
      {/* Left: Library & Navigation */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={onOpenNav}
          className="h-9 px-3 text-ink hover:bg-black/5 dark:hover:bg-white/10 gap-2 font-serif text-lg active:scale-95 transition-all"
        >
          <Library className="w-4 h-4 text-gold" />
          <span className="font-bold">{activeBook}</span>
          <span className="text-pencil text-base font-sans font-medium">
            {activeChapter}
          </span>
          <ChevronDown className="w-3 h-3 text-pencil/50 ml-1" />
        </Button>
      </div>

      {/* Right: Tools & Settings */}
      <div className="flex items-center gap-1">
        {/* Daily Sanctuary Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleToday}
          className={cn(
            "w-10 h-10 rounded-full text-pencil hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90",
            isTodayActive && "bg-gold/10 text-gold shadow-inner"
          )}
          title="Daily Study"
        >
          <Calendar className="w-5 h-5" />
        </Button>

        {/* Translation Layer Trigger (Sovereignty) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenTranslations}
          className="w-10 h-10 rounded-full text-ink hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90"
          title="Translation Layers"
        >
          <Globe className="w-5 h-5 text-pencil" />
        </Button>

        {/* Appearance & Global Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full text-ink hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90"
            >
              <Settings2 className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 p-3 rounded-[2.2rem] border-pencil/10 shadow-2xl bg-paper/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            {/* 2x2 Layout Grid */}
            <DisplayModeGrid />

            <DropdownMenuSeparator className="bg-pencil/10 mb-4 mx-1" />

            {/* Translation Selection Sub-menu */}
            <TranslationSelector
              onOpenAdvanced={onOpenTranslations}
              activeVersionId={activeVersionId}
              onSelectVersion={onSelectVersion}
            />

            <DropdownMenuSeparator className="bg-pencil/10 mb-4 mx-1" />

            {/* Dark Mode & Font Size Slider */}
            <AppearanceSettings />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Auth State: Profile for users, Login for guests */}
        {!authLoading &&
          (user ? (
            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full border border-pencil/10 bg-white/50 hover:bg-white transition-all active:scale-90 ml-1 shadow-sm"
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
                className="h-9 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest text-pencil hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 ml-1"
              >
                Login
              </Button>
            </Link>
          ))}
      </div>
    </header>
  );
}
