"use client";

import React from "react";
import { 
  Type, 
  Library, 
  UserCircle, 
  Settings, 
  ChevronDown, 
  Plus, 
  User, 
  LogOut, 
  AlignJustify, 
  Columns, 
  Search, 
  Check 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useTextSettings } from "@/components/text-settings-context";
import { DailyStudyMenu } from "./DailyStudyMenu";

interface ReaderHeaderProps {
  activeBook: string;
  activeChapter: number;
  onOpenNav: () => void;
}

export function ReaderHeader({ activeBook, activeChapter, onOpenNav }: ReaderHeaderProps) {
  const { 
    language, 
    layout, 
    fontSize, 
    showFootnotes,
    setLanguage, 
    setLayout, 
    setFontSize,
    setShowFootnotes 
  } = useTextSettings();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/[0.05] dark:border-white/[0.1] px-4 md:px-6 py-2 flex items-center justify-between shadow-sm">
      {/* LEFT GROUP: DAILY STUDY & LIBRARY */}
      <div className="flex items-center gap-1">
        {/* 4) Jump to Today / Daily Studies */}
        <DailyStudyMenu />

        {/* Library Browser Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 rounded-full px-3 gap-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]">
              <Library className="h-5 w-5 opacity-70" />
              <span className="hidden sm:inline text-sm font-medium opacity-70">Library</span>
              <ChevronDown className="h-3 w-3 opacity-30" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 p-2 rounded-2xl shadow-xl border-muted bg-background/95 backdrop-blur-md">
            <div className="p-2">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-40 pointer-events-none" />
                <input 
                  type="text" 
                  placeholder="Browse the library..." 
                  className="w-full bg-muted/50 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider font-bold opacity-50 px-3 py-1">Recent Collections</DropdownMenuLabel>
            {["Tanakh", "Mishnah", "Talmud", "Kabbalah", "Chasidut"].map((cat) => (
              <DropdownMenuItem key={cat} className="rounded-xl py-2.5 px-3 cursor-pointer flex items-center justify-between group">
                <span className="text-sm font-medium">{cat}</span>
                <ChevronDown className="h-3.5 w-3.5 -rotate-90 opacity-0 group-hover:opacity-20 transition-all" />
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="rounded-xl py-2 px-3 cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-primary/70 hover:text-primary transition-colors">
              Open Library Browser
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* CENTER: NAVIGATION TRIGGER */}
      <button 
        onClick={onOpenNav} 
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all active:scale-95 bg-black/[0.02] dark:bg-white/[0.02] border border-transparent hover:border-black/[0.05] dark:hover:border-white/[0.1]"
      >
         <span className="font-bold text-sm md:text-base text-black dark:text-white tracking-tight">{activeBook}</span>
         <span className="text-black/20 dark:text-white/20 text-xs font-light">/</span>
         <span className="text-sm md:text-base text-black/60 dark:text-white/60 tabular-nums">{activeChapter}</span>
      </button>

      {/* RIGHT: TEXT CONFIG & ACCOUNT */}
      <div className="flex items-center gap-1">
        {/* Text Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-black/[0.03] dark:hover:bg-white/[0.05]">
              <Type className="h-5 w-5 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-4 rounded-2xl shadow-2xl border-muted bg-background/95 backdrop-blur-md space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-bold opacity-50 px-1">Layout</p>
              <div className="grid grid-cols-2 gap-2 bg-muted/50 rounded-xl p-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLayout("side-by-side")} 
                  className={cn("h-9 rounded-lg text-xs gap-2 transition-all", layout === "side-by-side" && "bg-background shadow-sm")}
                >
                  <Columns className="h-3.5 w-3.5" /> Side-by-Side
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLayout("stacked")} 
                  className={cn("h-9 rounded-lg text-xs gap-2 transition-all", layout === "stacked" && "bg-background shadow-sm")}
                >
                  <AlignJustify className="h-3.5 w-3.5" /> Stacked
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-bold opacity-50 px-1">Language</p>
              <div className="flex bg-muted/50 rounded-xl p-1">
                <Button variant="ghost" size="sm" onClick={() => setLanguage("he")} className={cn("flex-1 h-9 rounded-lg text-xs", language === "he" && "bg-background shadow-sm")}>Hebrew</Button>
                <Button variant="ghost" size="sm" onClick={() => setLanguage("both")} className={cn("flex-1 h-9 rounded-lg text-xs", language === "both" && "bg-background shadow-sm")}>Both</Button>
                <Button variant="ghost" size="sm" onClick={() => setLanguage("en")} className={cn("flex-1 h-9 rounded-lg text-xs", language === "en" && "bg-background shadow-sm")}>English</Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end px-1">
                <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">Text Size</p>
                <span className="text-[10px] font-bold opacity-50 tabular-nums">{fontSize}pt</span>
              </div>
              <div className="relative flex items-center bg-muted/50 rounded-xl p-3 h-12">
                <span className="text-[10px] font-medium mr-2 opacity-30 select-none">A</span>
                <input
                  type="range"
                  min="14"
                  max="28"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="flex-1 h-1 bg-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-black dark:accent-white"
                />
                <span className="text-lg font-medium ml-2 opacity-30 select-none leading-none">A</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-bold opacity-50 px-1">Footnotes</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFootnotes(!showFootnotes)} 
                className={cn(
                  "w-full h-10 rounded-xl text-xs flex items-center justify-between px-3 bg-muted/30 transition-all hover:bg-muted/50",
                  showFootnotes && "bg-muted/60"
                )}
              >
                <span className="font-medium">Show inline footnotes</span>
                {showFootnotes && <Check className="h-3.5 w-3.5 text-primary" />}
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-bold opacity-50 px-1">Translation Manager</p>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-xl py-2.5 px-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-medium">JPS 1985 (Default)</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-64 p-2 rounded-xl shadow-lg border-muted">
                    <DropdownMenuItem className="rounded-lg py-2">Koren Jerusalem</DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg py-2 font-semibold bg-muted/40">JPS 1985</DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg py-2">The Commentators&apos; Bible</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-lg py-2 flex items-center gap-2 text-primary font-medium">
                      <Settings className="h-3.5 w-3.5" /> Manage Translations
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Account Management Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-black/[0.03] dark:hover:bg-white/[0.05]">
              <UserCircle className="h-5 w-5 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-muted bg-background/95 backdrop-blur-md">
            <div className="px-3 py-3 border-b border-muted/50 mb-2">
              <p className="text-sm font-semibold">Guest Reader</p>
              <p className="text-[10px] opacity-40 leading-tight">Sign in to sync your history and daily learning cycles.</p>
            </div>
            <DropdownMenuItem className="rounded-xl py-2.5 px-3 cursor-pointer flex items-center gap-3">
              <User className="h-4 w-4 opacity-70" />
              <span className="text-sm font-medium">Profile & Progress</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl py-2.5 px-3 cursor-pointer flex items-center gap-3">
              <Settings className="h-4 w-4 opacity-70" />
              <span className="text-sm font-medium">Global Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="rounded-xl py-2.5 px-3 cursor-pointer flex items-center gap-3 text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
              <Plus className="h-4 w-4" />
              <span className="text-sm font-semibold">Login or Register</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl py-2.5 px-3 cursor-pointer flex items-center gap-3 text-red-500/60 hover:text-red-500 transition-colors">
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}