"use client";

import React from "react";
import {
  ChevronDown,
  Layout,
  Check,
  Languages,
  Rows,
  Columns,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  useTextSettings,
  DisplayMode,
} from "@/components/context/text-settings-context";
import { cn } from "@/lib/utils";

interface ReaderHeaderProps {
  activeBook: string;
  activeChapter: number;
  onOpenNav: () => void;
}

/**
 * components/reader/header/ReaderHeader.tsx
 * Updated: Book/Chapter button now has consistent rounded styling on desktop.
 */
export default function ReaderHeader({
  activeBook,
  activeChapter,
  onOpenNav,
}: ReaderHeaderProps) {
  const router = useRouter();
  const { displayMode, setDisplayMode, fontSize, setFontSize } =
    useTextSettings();

  const layoutOptions: {
    id: DisplayMode;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: "hebrew", label: "Hebrew Only", icon: Languages },
    { id: "english", label: "English Only", icon: Type },
    { id: "bilingual-stacked", label: "Stacked", icon: Rows },
    { id: "bilingual-parallel", label: "Side-by-Side", icon: Columns },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-paper/80 backdrop-blur-xl border-b border-pencil/10 px-6 h-16 flex items-center justify-between transition-colors duration-500">
      {/* LEFT: Branding */}
      <div className="flex items-center z-10">
        <button
          onClick={() => router.push("/library")}
          className="group outline-none focus-visible:ring-2 ring-accent/20 rounded-lg transition-all"
          aria-label="Return to Library"
        >
          <Logo type="responsive" size="sm" className="origin-left scale-90" />
        </button>
      </div>

      {/* CENTER: Book / Chapter Navigation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <Button
            variant="ghost"
            onClick={onOpenNav}
            // Removed 'md:rounded-none' and 'md:shadow-none' to enforce consistent rounded look
            className="h-10 px-4 text-ink hover:bg-black/5 dark:hover:bg-white/10 gap-1.5 font-sans text-lg active:scale-95 transition-all shadow-sm bg-white md:bg-white/50 border border-pencil/10 rounded-full"
          >
            <span className="font-semibold tracking-[0.05em]">
              {activeBook}
            </span>
            <span className="text-pencil text-base font-medium ml-0.5 tracking-[0.05em]">
              {activeChapter}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-pencil/50 ml-0.5 transition-transform duration-300 group-active:rotate-180" />
          </Button>
        </div>
      </div>

      {/* RIGHT: Layout & Settings Controls */}
      <div className="flex items-center gap-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="imprinted"
              size="icon"
              className="w-9 h-9 rounded-xl"
              title="Layout Settings"
            >
              <Layout className="w-4.5 h-4.5 text-charcoal" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 p-2 rounded-2xl border-pencil/10 shadow-2xl bg-paper/95 backdrop-blur-xl"
          >
            <DropdownMenuLabel className="text-[10px] font-black text-pencil/40 uppercase tracking-[0.2em] px-2 py-1.5">
              Display Mode
            </DropdownMenuLabel>
            {layoutOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => setDisplayMode(opt.id)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer",
                  displayMode === opt.id
                    ? "bg-accent/10 text-accent"
                    : "text-charcoal hover:bg-pencil/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <opt.icon
                    className={cn(
                      "w-4 h-4",
                      displayMode === opt.id ? "text-accent" : "text-pencil/40"
                    )}
                  />
                  {opt.label}
                </div>
                {displayMode === opt.id && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator className="bg-pencil/5 my-2" />

            <div className="px-3 py-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-pencil/40 uppercase tracking-widest">
                  Text Size
                </span>
                <span className="text-[10px] font-mono font-bold text-accent">
                  {fontSize}pt
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="26"
                step="1"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-1 bg-pencil/10 rounded-full accent-accent cursor-pointer appearance-none"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
