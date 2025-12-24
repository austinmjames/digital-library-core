"use client";

import { Library, Globe, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommentaryTab } from "./CommentaryHeader";

interface CommentaryTabsProps {
  activeTab: CommentaryTab;
  setActiveTab: (tab: CommentaryTab) => void;
  hasUser: boolean;
}

/**
 * components/reader/commentary/CommentaryTabs.tsx
 * Premium segmented control for the Commentary Sidebar.
 * Mimics the iOS widget switcher with spring animations.
 */
export function CommentaryTabs({
  activeTab,
  setActiveTab,
  hasUser,
}: CommentaryTabsProps) {
  const tabs = [
    { id: "MY_COMMENTARIES", label: "Library", icon: Library },
    { id: "MARKETPLACE", label: "Explore", icon: Globe },
    { id: "DISCUSSION", label: "Groups", icon: Users },
  ] as const;

  return (
    <div className="px-6 py-4 bg-paper border-b border-pencil/[0.03] shrink-0">
      <div className="flex p-1.5 gap-1.5 bg-pencil/5 rounded-2xl relative">
        {/* Animated Background Slider */}
        <div
          className={cn(
            "absolute top-1.5 bottom-1.5 rounded-[0.8rem] bg-white shadow-xl shadow-black/5 transition-all duration-300 ease-spring",
            activeTab === "MY_COMMENTARIES" && "left-1.5 w-[calc(25%-4.5px)]",
            activeTab === "MARKETPLACE" &&
              "left-[calc(25%+1.5px)] w-[calc(25%-4.5px)]",
            activeTab === "DISCUSSION" &&
              "left-[calc(50%+1.5px)] w-[calc(25%-4.5px)]",
            activeTab === "MANAGE_BOOKS" &&
              "left-[calc(75%+1.5px)] w-[calc(25%-4.5px)]",
            // Adjust widths if user is guest (3 tabs instead of 4)
            !hasUser &&
              activeTab === "MY_COMMENTARIES" &&
              "w-[calc(33.3%-4px)] translate-x-0",
            !hasUser &&
              activeTab === "MARKETPLACE" &&
              "w-[calc(33.3%-4px)] translate-x-full",
            !hasUser &&
              activeTab === "DISCUSSION" &&
              "w-[calc(33.3%-4px)] translate-x-[200%]"
          )}
        />

        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as CommentaryTab)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[9px] font-black uppercase tracking-widest z-10 transition-colors duration-300",
              activeTab === tab.id
                ? "text-ink"
                : "text-pencil/40 hover:text-pencil"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}

        {hasUser && (
          <button
            onClick={() => setActiveTab("MANAGE_BOOKS")}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[9px] font-black uppercase tracking-widest z-10 transition-colors duration-300",
              activeTab === "MANAGE_BOOKS"
                ? "text-gold"
                : "text-pencil/40 hover:text-gold"
            )}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Books</span>
          </button>
        )}
      </div>
    </div>
  );
}
