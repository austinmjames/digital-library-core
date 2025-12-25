"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useRouter } from "next/navigation";

interface ReaderHeaderProps {
  activeBook: string;
  activeChapter: number;
  onOpenNav: () => void;
}

/**
 * components/reader/header/ReaderHeader.tsx
 * Updated: Replaced Link with router.push to ensure single-tab navigation on mobile.
 * Updated: Simplified to focus purely on context and branding.
 */
export default function ReaderHeader({
  activeBook,
  activeChapter,
  onOpenNav,
}: ReaderHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full bg-paper/80 backdrop-blur-xl border-b border-pencil/10 px-6 h-20 flex items-center justify-between transition-colors duration-500">
      {/* LEFT: DrashX Branding - Programmatic navigation to prevent "New Tab" bugs */}
      <div className="flex items-center z-10">
        <button
          onClick={() => router.push("/library")}
          className="group outline-none focus-visible:ring-2 ring-accent/20 rounded-lg transition-all"
          aria-label="Return to Library"
        >
          <Logo type="responsive" size="md" className="origin-left" />
        </button>
      </div>

      {/* CENTER: Book / Chapter - Dead Centered context for the passage */}
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

      {/* RIGHT: Layout Buffer */}
      <div className="w-[180px] hidden md:block z-10" aria-hidden="true" />
    </header>
  );
}
