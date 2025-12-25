"use client";

import React from "react";
import { X, Globe, Plus, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusFooter } from "@/components/ui/status-footer";
import { Button } from "@/components/ui/button";

interface TranslationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * components/reader/TranslationPanel.tsx
 * Fixed: Removed unused 'activeVersionId' and 'onSelectVersion' from props.
 */
export function TranslationPanel({ isOpen, onClose }: TranslationPanelProps) {
  return (
    <aside
      className={cn(
        "fixed top-0 right-0 h-full w-full md:w-[400px] lg:w-[450px] bg-paper border-l border-pencil/10 z-[60] transition-transform duration-500 ease-spring shadow-[-12px_0_40px_-10px_rgba(0,0,0,0.05)] flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* High-Fidelity Header */}
      <div className="h-20 border-b border-pencil/10 flex items-center justify-between px-8 bg-paper/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center imprint-sm">
            <Globe className="w-5 h-5 text-accent-foreground" />
          </div>
          <h2 className="text-2xl text-ink font-bold tracking-tight">
            Translations
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-3 rounded-full hover:bg-pencil/5 transition-all group active:scale-90"
        >
          <X className="w-6 h-6 text-pencil group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-pencil/40 uppercase tracking-[0.2em]">
              Your Personal Layers
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[9px] font-black text-accent uppercase tracking-widest hover:bg-accent/5"
            >
              <Plus className="w-3 h-3 mr-1" /> New Layer
            </Button>
          </div>

          <div className="p-8 border-2 border-dashed border-pencil/10 rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
              <Layers className="w-6 h-6 text-pencil/20" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">No Active Layers</p>
              <p className="text-xs text-pencil/60 max-w-[200px] mx-auto mt-1">
                Create a personal translation layer to capture your own
                insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      <StatusFooter>
        Discover community-driven translation projects in the marketplace.
      </StatusFooter>
    </aside>
  );
}
