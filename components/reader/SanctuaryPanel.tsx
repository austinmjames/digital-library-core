"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Library, Clock, Sparkles } from "lucide-react";

// Components & Hooks
import { SegmentedControl } from "@/components/ui/segmented-control";
import { StudiesTab } from "./today/StudiesTab";
import { EventsTab } from "./today/EventsTab";
import { useTodayMenu } from "./today/useTodayMenu";

// Actions
import { getParashaRedirect, resolveStudyRef } from "@/app/actions";

type TodayTab = "STUDIES" | "EVENTS";

/**
 * components/reader/TodayMenu.tsx
 * Updated: Removed StatusFooter for a cleaner, high-fidelity look.
 */
export function TodayMenu({ isOpen }: { isOpen: boolean }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TodayTab>("STUDIES");

  const { state, actions } = useTodayMenu(isOpen);

  const handleStudyClick = async (type: string, name: string, ref: string) => {
    if (type === "parasha") {
      const redirect = await getParashaRedirect(name);
      if (redirect) {
        router.push(`/library/tanakh/${redirect.book}/${redirect.chapter}`);
        return;
      }
    }
    const path = await resolveStudyRef(ref);
    if (path) router.push(path);
  };

  return (
    <div className="flex flex-col h-full bg-paper animate-in fade-in duration-300">
      <header className="h-20 border-b border-pencil/10 flex items-center px-8 bg-paper/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-2xl text-ink font-bold tracking-tight">
            Sanctuary
          </h2>
        </div>
      </header>

      <div className="px-8 py-4 bg-paper border-b border-pencil/[0.03]">
        <SegmentedControl
          value={activeTab}
          onChange={(val) => setActiveTab(val as TodayTab)}
          options={[
            { value: "STUDIES", label: "Studies", icon: Library },
            { value: "EVENTS", label: "Events", icon: Clock },
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8">
        {state.loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-30">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center">
              Gathering Wisdom...
            </p>
          </div>
        ) : activeTab === "STUDIES" ? (
          <StudiesTab
            learning={state.learning}
            onStudyClick={handleStudyClick}
          />
        ) : (
          <EventsTab
            calendar={state.calendar}
            locationName={state.locationName}
            isEditing={state.isEditingLocation}
            zipInput={state.zipInput}
            onZipChange={actions.setZipInput}
            onSave={actions.handleSaveLocation}
            onDetect={actions.handleDetectLocation}
            onCancel={() => actions.setIsEditingLocation(false)}
            onEditToggle={() => actions.setIsEditingLocation(true)}
          />
        )}
      </div>
    </div>
  );
}
