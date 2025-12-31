"use client";

import { cn } from "@/lib/utils/utils";
import {
  Database,
  Hash,
  MessageSquare,
  PenLine,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";

// Sub-component imports
import { useAuth } from "@/lib/hooks/useAuth";
import { ReaderContext } from "@/lib/hooks/useReaderSettings";
import { Verse } from "@/types/reader";
import { AITab } from "./AITab";
import { DiscussionTab } from "./DiscussionTab";
import { NotesTab } from "./NotesTab";
import { ResourceTab } from "./ResourceTab";

/**
 * ContextPanel (v3.4)
 * Filepath: components/reader/ContextPanel.tsx
 * Role: Unified scholarly interface for AI, Notes, Resources, and Community.
 * PRD Alignment: Section 3.2 (Contextual Metadata) & 5.0 (Monetization).
 */

interface ContextPanelProps {
  activeVerse: Verse | null;
  onClose: () => void;
  context: ReaderContext;
  isOpen?: boolean;
}

type TabID = "resources" | "notes" | "ai" | "community";

export const ContextPanel = ({
  activeVerse,
  onClose,
  context,
}: ContextPanelProps) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabID>("resources");

  if (!activeVerse) return null;

  const isPro = profile?.tier === "pro";

  const tabs = [
    { id: "resources", label: "Sources", icon: Database },
    { id: "ai", label: "Insights", icon: Sparkles, premium: true },
    { id: "notes", label: "My Notes", icon: PenLine },
    { id: "community", label: "Discussion", icon: MessageSquare },
  ];

  return (
    <aside className="w-[420px] h-full bg-white border-l border-zinc-100 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500 z-40">
      {/* 1. Panel Header (Active Verse Context) */}
      <header className="p-8 bg-zinc-950 text-white space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] -mr-16 -mt-16 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Hash size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              {activeVerse.ref}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative z-10">
          <p
            className="font-serif-hebrew text-3xl leading-relaxed text-zinc-100 text-right"
            dir="rtl"
          >
            {activeVerse.he}
          </p>
          <p className="text-xs text-zinc-500 mt-4 line-clamp-2 italic font-serif leading-relaxed">
            {activeVerse.en}
          </p>
        </div>
      </header>

      {/* 2. Tab Navigation */}
      <nav className="flex items-center justify-around border-b border-zinc-50 px-4 bg-zinc-50/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabID)}
            className={cn(
              "flex flex-col items-center gap-2 py-5 px-2 transition-all relative min-w-[80px] group",
              activeTab === tab.id
                ? "text-zinc-950"
                : "text-zinc-300 hover:text-zinc-500"
            )}
          >
            <div className="relative">
              <tab.icon
                size={20}
                strokeWidth={activeTab === tab.id ? 2.5 : 1.5}
              />
              {tab.premium && !isPro && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-white shadow-sm" />
              )}
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.15em]">
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* 3. Tab Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        {activeTab === "resources" && <ResourceTab />}
        {activeTab === "notes" && <NotesTab activeVerse={activeVerse} />}
        {activeTab === "community" && (
          <DiscussionTab activeVerse={activeVerse} context={context} />
        )}
        {activeTab === "ai" && (
          <AITab activeVerse={activeVerse} isPro={isPro} />
        )}
      </div>

      {/* 4. Footer Identity */}
      <footer className="p-5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
        <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-black">
          Engine v3.4
        </p>
        <div className="flex gap-1.5">
          <div className="w-1 h-1 rounded-full bg-emerald-500" />
          <div className="w-1 h-1 rounded-full bg-emerald-500/20" />
        </div>
      </footer>
    </aside>
  );
};
