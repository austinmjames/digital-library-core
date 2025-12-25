"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Library, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Components & Hooks
import { StatusFooter } from "@/components/ui/status-footer";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { StudiesTab } from "./today/StudiesTab";
import { EventsTab } from "./today/EventsTab";
import { useTodayMenu } from "./today/useTodayMenu";

// Actions
import { getParashaRedirect, resolveStudyRef } from "@/app/actions";

type TodayTab = "STUDIES" | "EVENTS";

/**
 * components/reader/TodayMenu.tsx
 * Updated: Removed backdrop blur to maintain visual clarity on the text.
 */
export function TodayMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TodayTab>("STUDIES");

  const { state, actions } = useTodayMenu(isOpen);

  const handleStudyClick = async (type: string, name: string, ref: string) => {
    onClose();
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

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const jerusalemTime = new Date().toLocaleTimeString("he-IL", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      {/* Responsive Backdrop: No blur, mobile-only */}
      <div
        className={cn(
          "fixed inset-0 bg-ink/5 z-[45] transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-[400px] lg:w-[450px] bg-paper border-l border-pencil/10 z-50 transition-transform duration-500 ease-spring shadow-2xl flex flex-col overflow-hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-20 border-b border-pencil/10 flex items-center justify-between px-8 bg-paper/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center imprint-sm">
              <Sparkles className="w-5 h-5 text-accent-foreground" />
            </div>
            <h2 className="text-2xl text-ink font-bold tracking-tight font-sans">
              Sanctuary
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-pencil/5 transition-all group active:scale-90"
          >
            <X className="w-6 h-6 text-pencil group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

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
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] font-sans">
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

        <StatusFooter className="justify-between px-8">
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-pencil font-bold uppercase tracking-widest leading-none font-sans">
              {todayDate}
            </span>
            <span className="text-accent text-[9px] font-bold uppercase tracking-tighter font-sans">
              Sanctuary in Time
            </span>
          </div>
          <div className="flex items-center gap-2 text-ink">
            <span className="font-mono font-bold text-[10px]">
              Jerusalem: {jerusalemTime}
            </span>
          </div>
        </StatusFooter>
      </aside>
    </>
  );
}
