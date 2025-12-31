"use client";

import { cn } from "@/lib/utils/utils";
import { Clock, Grid, Loader2, LucideIcon, Users } from "lucide-react";
import { useState } from "react";

/**
 * ProfileTabs
 * Filepath: components/profile/ProfileTabs.tsx
 * Role: Manages sub-content navigation for the scholar profile.
 */

type ProfileTabID = "content" | "activity" | "groups";

interface TabItem {
  id: ProfileTabID;
  label: string;
  icon: LucideIcon;
}

export const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState<ProfileTabID>("content");

  const tabs: TabItem[] = [
    { id: "content", label: "Library", icon: Grid },
    { id: "activity", label: "History", icon: Clock },
    { id: "groups", label: "Circles", icon: Users },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-12 border-b border-zinc-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 py-6 text-[11px] font-black uppercase tracking-[0.25em] relative transition-all",
              activeTab === tab.id
                ? "text-zinc-950"
                : "text-zinc-300 hover:text-zinc-500"
            )}
          >
            <tab.icon size={14} /> {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Dynamic Content Slot */}
      <div className="bg-white p-16 rounded-[3rem] border border-zinc-100 shadow-sm text-center">
        <Loader2
          className="animate-spin text-zinc-100 mx-auto mb-6"
          size={40}
        />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">
          Syncing Scholarly Records...
        </p>
      </div>
    </div>
  );
};
