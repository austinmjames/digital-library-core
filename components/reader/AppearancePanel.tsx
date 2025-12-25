"use client";

import React from "react";
import { X, Settings2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusFooter } from "@/components/ui/status-footer";
import { DisplayModeGrid } from "./header/DisplayModeGrid";
import { AppearanceSettings } from "./header/AppearanceSettings";
import { TranslationSelector } from "./header/TranslationSelector";

interface AppearancePanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeVersionId: string;
  onSelectVersion: (id: string) => void;
  onOpenTranslations: () => void;
}

/**
 * components/reader/AppearancePanel.tsx
 * Updated: Now houses the TranslationSelector, making it the central hub for reading preferences.
 */
export function AppearancePanel({
  isOpen,
  onClose,
  activeVersionId,
  onSelectVersion,
  onOpenTranslations,
}: AppearancePanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-ink/5 z-[55] animate-in fade-in duration-500 md:hidden"
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-[400px] lg:w-[450px] bg-paper border-l border-pencil/10 z-[60] shadow-2xl flex flex-col transition-transform duration-500 ease-spring",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="h-20 border-b border-pencil/10 flex items-center justify-between px-8 bg-paper/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center imprint-sm">
              <Settings2 className="w-5 h-5 text-accent-foreground" />
            </div>
            <h2 className="text-2xl text-ink font-bold tracking-tight">
              Display
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-pencil/5 transition-all group active:scale-90"
          >
            <X className="w-6 h-6 text-pencil group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-12">
          {/* 1. Rendering Mode */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-pencil/40 uppercase tracking-[0.25em] px-1">
              Rendering Mode
            </h3>
            <DisplayModeGrid />
          </section>

          {/* 2. Primary Translation Selection */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-pencil/40 uppercase tracking-[0.25em] px-1">
              Active Translation
            </h3>
            <div className="bg-white border border-pencil/10 rounded-[2rem] p-4 shadow-sm">
              <TranslationSelector
                activeVersionId={activeVersionId}
                onSelectVersion={onSelectVersion}
                onOpenAdvanced={onOpenTranslations}
              />
            </div>
          </section>

          {/* 3. Typography & Theme */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-pencil/40 uppercase tracking-[0.25em] px-1">
              Visual Environment
            </h3>
            <div className="p-6 bg-white border border-pencil/10 rounded-[2rem] shadow-sm">
              <AppearanceSettings />
            </div>
          </section>
        </div>

        <StatusFooter>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-gold" />
            <span>Settings persist across all your devices.</span>
          </div>
        </StatusFooter>
      </aside>
    </>
  );
}
