"use client";

import { Loader2 } from "lucide-react";
import { Suspense, useState } from "react";

// Feature Folder Components
import { CatalogView } from "@/components/library/CatalogView";
import { CommunityView } from "@/components/library/CommunityView";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { PlansView } from "@/components/library/PlansView";
import { ShelfView } from "@/components/library/ShelfView";

/**
 * DrashX Library Orchestrator (v2.1)
 * Filepath: app/library/page.tsx
 * Role: Central hub for canonical discovery, community scholarship, and personal shelf management.
 * PRD Alignment: Section 2.2 (Marketplace), Section 3.1 (Library Discovery).
 */

export type LibraryTab = "shelf" | "catalog" | "community" | "plans";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<LibraryTab>("shelf");

  return (
    <div className="min-h-screen bg-[#FAF9F6] selection:bg-zinc-950 selection:text-white">
      {/* 1. Sticky Header with Search & Navigation */}
      <LibraryHeader
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab as LibraryTab)}
      />

      {/* 2. Main Content Slot */}
      <main className="max-w-7xl mx-auto px-6 py-10 pb-32">
        <Suspense fallback={<LoadingState />}>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === "shelf" && <ShelfView />}
            {activeTab === "catalog" && <CatalogView />}
            {activeTab === "community" && <CommunityView />}
            {activeTab === "plans" && <PlansView />}
          </div>
        </Suspense>
      </main>

      {/* 3. Subtle Background Texture (Manifest 4.1 - Paper Aesthetic) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] z-0" />
    </div>
  );
}

/**
 * LoadingState
 * Design: Minimalist centered loader following DrashX aesthetics.
 */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-40 gap-4 text-zinc-400">
      <Loader2 className="animate-spin" size={32} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em]">
        Organizing the Shelf...
      </p>
    </div>
  );
}
