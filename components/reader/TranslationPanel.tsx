"use client";

import { useState } from "react";
import { X, Globe, Library } from "lucide-react";
import { cn } from "@/lib/utils";
// Ensure named imports are used
import { ManagementView } from "@/components/reader/translations/ManagementView";
import { MarketplaceView } from "@/components/reader/translations/MarketplaceView";

interface TranslationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeVersionId: string | null;
  onSelectVersion: (id: string | null) => void;
}

type PanelTab = "MY_VERSIONS" | "MARKETPLACE";

/**
 * TranslationPanel
 * Fixed: Explicitly typed the onSelect callback for MarketplaceView.
 */
export function TranslationPanel({
  isOpen,
  onClose,
  activeVersionId,
  onSelectVersion,
}: TranslationPanelProps) {
  const [tab, setTab] = useState<PanelTab>("MY_VERSIONS");

  return (
    <aside
      className={cn(
        "fixed top-0 right-0 h-full w-full md:w-[400px] lg:w-[450px] bg-paper border-l border-pencil/10 z-50 transition-transform duration-300 ease-spring shadow-2xl",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* iOS-Style Sticky Header */}
      <div className="h-14 border-b border-pencil/10 flex items-center justify-between px-4 bg-paper/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gold" />
          <h2 className="font-serif font-bold text-ink text-lg">
            Translations
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-black/5 transition-colors"
        >
          <X className="w-5 h-5 text-pencil" />
        </button>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex p-1.5 gap-1 bg-pencil/5 mx-4 mt-4 rounded-xl">
        <button
          onClick={() => setTab("MY_VERSIONS")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
            tab === "MY_VERSIONS"
              ? "bg-white text-ink shadow-sm"
              : "text-pencil/60 hover:text-pencil"
          )}
        >
          <Library className="w-3.5 h-3.5" />
          My Projects
        </button>
        <button
          onClick={() => setTab("MARKETPLACE")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
            tab === "MARKETPLACE"
              ? "bg-white text-ink shadow-sm"
              : "text-pencil/60 hover:text-pencil"
          )}
        >
          <Globe className="w-3.5 h-3.5" />
          Explore
        </button>
      </div>

      {/* Scrollable View Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {tab === "MY_VERSIONS" ? (
          <ManagementView
            activeVersionId={activeVersionId}
            onSelect={onSelectVersion}
          />
        ) : (
          <MarketplaceView onSelect={(id: string) => onSelectVersion(id)} />
        )}
      </div>

      <div className="p-4 border-t border-pencil/10 bg-pencil/5 mt-auto">
        <p className="text-[9px] text-pencil uppercase tracking-widest leading-relaxed text-center">
          Translate the text yourself or contribute to community versions. Tap a
          verse to open the editor.
        </p>
      </div>
    </aside>
  );
}
