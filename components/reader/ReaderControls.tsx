"use client";

import { TextViewOptions } from "@/components/text-view-options";

/**
 * ReaderControls has been refactored to remove manual props.
 * It now simply renders the TextViewOptions component, which
 * handles all text settings via the global TextSettingsContext.
 */
export function ReaderControls() {
  return (
    <div className="flex items-center gap-2">
      <TextViewOptions />
    </div>
  );
}