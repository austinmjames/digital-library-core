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
import { DiscussionTab } from "./DiscussionTab";
import { NotesTab } from "./NotesTab";
import { ResourceTab } from "./ResourceTab";

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
    <aside className="w-[450px] h-full bg-white dark:bg-zinc-900 border-l border-zinc-100 dark:border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500 z-50">
      {/* 1. Panel Header (Active Verse Context) */}
      <header className="p-8 bg-zinc-950 text-white space-y-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] -mr-16 -mt-16 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Hash size={14} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              {activeVerse.ref}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative z-10 space-y-4">
          <p
            className="font-hebrew text-3xl leading-snug text-zinc-100 text-right"
            dir="rtl"
          >
            {activeVerse.hebrew_text}
          </p>
          <p className="text-xs text-zinc-400 line-clamp-3 italic font-serif leading-relaxed">
            {activeVerse.text}
          </p>
        </div>
      </header>

      {/* 2. M3 Tab Navigation */}
      <nav className="flex items-center justify-around border-b border-zinc-50 dark:border-zinc-800 px-4 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabID)}
            className={cn(
              "flex flex-col items-center gap-2 py-5 px-2 transition-all relative min-w-[80px] group",
              activeTab === tab.id
                ? "text-blue-600"
                : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-500"
            )}
          >
            <div className="relative">
              <tab.icon
                size={20}
                strokeWidth={activeTab === tab.id ? 2.5 : 1.5}
              />
              {tab.premium && !isPro && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm" />
              )}
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.15em]">
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full animate-in fade-in" />
            )}
          </button>
        ))}
      </nav>

      {/* 3. Dynamic Tab Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        {activeTab === "resources" && <ResourceTab />}

        {activeTab === "ai" && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[3rem] text-blue-600 animate-pulse">
              <Sparkles size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold uppercase tracking-tight italic">
                Neural Synthesis
              </h3>
              <p className="text-xs text-zinc-400 max-w-[240px] mx-auto leading-relaxed">
                Synthesizing canonical logic and community insights for{" "}
                {activeVerse.ref}...
              </p>
            </div>
          </div>
        )}

        {activeTab === "notes" && <NotesTab activeVerse={activeVerse} />}

        {activeTab === "community" && (
          <DiscussionTab activeVerse={activeVerse} context={context} />
        )}
      </div>

      {/* 4. Footer Identity */}
      <footer className="p-5 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
        <p className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-black">
          Scriptorium Engine v5.3
        </p>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
        </div>
      </footer>
    </aside>
  );
};
