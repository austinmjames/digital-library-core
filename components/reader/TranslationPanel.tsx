"use client";

import React from "react";
import { Globe, Plus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TranslationPanelProps {
  isOpen: boolean;
  bookSlug?: string;
}

/**
 * components/reader/TranslationPanel.tsx
 * Updated: Removed the StatusFooter to streamline the UI.
 */
export function TranslationPanel({ isOpen, bookSlug }: TranslationPanelProps) {
  // Logic could use bookSlug to filter existing projects or pre-fill new project forms
  if (isOpen) {
    console.log(`Layers View active for ${bookSlug || "All Books"}`);
  }

  return (
    <div className="flex flex-col h-full bg-paper animate-in fade-in duration-300">
      <header className="h-20 border-b border-pencil/10 flex items-center px-8 bg-paper/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-2xl text-ink font-bold tracking-tight">Layers</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-pencil/40 uppercase tracking-[0.25em]">
              Personal Sovereignty
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[9px] font-black text-accent uppercase tracking-widest hover:bg-accent/5"
            >
              <Plus className="w-3 h-3 mr-1" /> New Project
            </Button>
          </div>

          <div className="p-8 border-2 border-dashed border-pencil/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-3 bg-pencil/[0.01]">
            <div className="w-12 h-12 rounded-2xl bg-paper flex items-center justify-center">
              <Layers className="w-6 h-6 text-pencil/20" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">No Active Projects</p>
              <p className="text-xs text-pencil/60 max-w-[240px] mx-auto mt-2 leading-relaxed">
                Start a personal interpretation project{" "}
                {bookSlug ? `for ${bookSlug}` : ""} to capture your insights
                alongside the text.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
