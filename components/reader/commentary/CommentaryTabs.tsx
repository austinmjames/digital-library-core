"use client";

import React from "react";
import { Library, Users, Settings } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { CommentaryTab } from "@/lib/types/library";

interface CommentaryTabsProps {
  activeTab: CommentaryTab;
  setActiveTab: (tab: CommentaryTab) => void;
  hasUser: boolean;
}

/**
 * components/reader/commentary/CommentaryTabs.tsx
 * Refactored to use the unified SegmentedControl primitive.
 * Automatically handles the icon-only mode when 'Books' tab is present for logged-in users.
 */
export function CommentaryTabs({
  activeTab,
  setActiveTab,
  hasUser,
}: CommentaryTabsProps) {
  const options = [
    { value: "MY_COMMENTARIES" as const, label: "Library", icon: Library },
    { value: "DISCUSSION" as const, label: "Groups", icon: Users },
    ...(hasUser
      ? [{ value: "MANAGE_BOOKS" as const, label: "Books", icon: Settings }]
      : []),
  ];

  return (
    <div className="px-6 py-4 bg-paper border-b border-pencil/[0.03] shrink-0">
      <SegmentedControl
        options={options}
        value={activeTab}
        onChange={(val) => setActiveTab(val as CommentaryTab)}
      />
    </div>
  );
}
