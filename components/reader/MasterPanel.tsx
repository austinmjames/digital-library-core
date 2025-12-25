"use client";

import React from "react";
import {
  MessageSquare,
  ShoppingBag,
  Calendar,
  Globe,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sub-view Components
import { TodayMenu } from "./SanctuaryPanel";
import { CommentaryPanel } from "./CommentaryPanel";
import { MarketplacePanel } from "./MarketplacePanel";
import { TranslationPanel } from "./TranslationPanel";
import { ProfilePanel } from "./ProfilePanel";

// Types
import { PanelType } from "./hooks/useMasterPanel";

interface MasterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activePanel: PanelType;
  onSwitchPanel: (type: PanelType) => void;

  // Context for sub-views
  verseRef: string | null;
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  bookSlug?: string;
}

/**
 * components/reader/MasterPanel.tsx
 * FIXED: Explicit named export and corrected import paths for sub-panels.
 */
export function MasterPanel({
  isOpen,
  onClose,
  activePanel,
  onSwitchPanel,
  verseRef,
  activeLayerId,
  onSelectLayer,
  bookSlug,
}: MasterPanelProps) {
  const menuItems: { id: PanelType; icon: LucideIcon; label: string }[] = [
    { id: "TODAY", icon: Calendar, label: "Sanctuary" },
    { id: "COMMENTARY", icon: MessageSquare, label: "Commentary" },
    { id: "MARKETPLACE", icon: ShoppingBag, label: "Market" },
    { id: "LAYERS", icon: Globe, label: "Layers" },
    { id: "ACCOUNT", icon: User, label: "Account" },
  ];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-ink/10 z-[45] transition-opacity md:hidden",
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
        <button
          onClick={onClose}
          className="absolute top-5 right-6 z-[70] md:hidden w-10 h-10 rounded-xl bg-paper border border-pencil/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] flex items-center justify-center active:scale-90 transition-all group"
          aria-label="Dismiss tools"
        >
          <X className="w-5 h-5 text-pencil group-hover:text-ink transition-colors" />
        </button>

        <div className="flex-1 overflow-hidden relative">
          {activePanel === "TODAY" && <TodayMenu isOpen={isOpen} />}
          {activePanel === "COMMENTARY" && (
            <CommentaryPanel verseRef={verseRef} />
          )}
          {activePanel === "MARKETPLACE" && (
            <MarketplacePanel isOpen={isOpen} />
          )}
          {activePanel === "LAYERS" && (
            <TranslationPanel isOpen={isOpen} bookSlug={bookSlug} />
          )}
          {activePanel === "ACCOUNT" && (
            <ProfilePanel
              isOpen={isOpen}
              activeVersionId={activeLayerId}
              onSelectVersion={onSelectLayer}
              onOpenTranslations={() => onSwitchPanel("LAYERS")}
            />
          )}
        </div>

        <footer className="h-20 bg-paper/95 border-t border-pencil/10 flex items-center justify-around shrink-0 backdrop-blur-xl z-[60] px-4">
          {menuItems.map((item) => {
            const isActive = activePanel === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSwitchPanel(item.id)}
                className={cn(
                  "flex-1 h-full flex items-center justify-center transition-all relative group outline-none",
                  isActive
                    ? "text-accent"
                    : "text-pencil/40 hover:text-pencil/60"
                )}
                aria-label={item.label}
              >
                <div
                  className={cn(
                    "p-3 rounded-2xl transition-all duration-300 transform",
                    isActive
                      ? "bg-accent/5 shadow-[inset_0_3px_8px_rgba(0,0,0,0.12)] border border-accent/10 scale-[0.97]"
                      : "group-hover:bg-pencil/5 group-active:scale-95"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      isActive ? "stroke-[2.2px]" : "stroke-[1.5px]"
                    )}
                  />
                </div>
              </button>
            );
          })}
        </footer>
      </aside>
    </>
  );
}
