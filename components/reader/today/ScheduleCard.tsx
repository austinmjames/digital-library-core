"use client";

import React from "react";
import {
  Plus,
  Calendar,
  List,
  Search,
  Loader2,
  ChevronRight,
  ChevronDown,
  BookMarked,
  Trash2,
  Share2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserSchedule } from "@/lib/types/library";
import { useScheduleCard } from "./useScheduleCard";
import { MilestoneItem } from "./MilestoneItem";

interface ScheduleCardProps {
  schedule: UserSchedule;
  onUpdate: () => void;
}

/**
 * ScheduleCard
 * Renders an individual schedule with a progress bar and milestone tracking.
 * Refactored to use standard icons.
 */
export function ScheduleCard({ schedule, onUpdate }: ScheduleCardProps) {
  const {
    progress,
    searchResults,
    isAdding,
    isDeleting,
    isSharing,
    isExpanded,
    setIsExpanded,
    showCopied,
    processingItems,
    handleSearch,
    handleAddMarker,
    handleToggleComplete,
    handleShare,
    handleDeleteSchedule,
    handleRemoveItem,
    handleNavigate,
  } = useScheduleCard(schedule, onUpdate);

  return (
    <div
      className={cn(
        "group bg-white rounded-2xl border transition-all overflow-hidden",
        isExpanded
          ? "border-gold/30 shadow-md"
          : "border-pencil/10 hover:shadow-sm"
      )}
    >
      {/* Header Info */}
      <div
        className="p-4 flex flex-col gap-3 cursor-pointer hover:bg-pencil/[0.01]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                isExpanded ? "bg-gold/10 text-gold" : "bg-pencil/5 text-pencil"
              )}
            >
              {schedule.schedule_type === "calendar" ? (
                <Calendar className="w-5 h-5" />
              ) : (
                <List className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="font-serif font-bold text-ink">
                {schedule.title}
              </h4>
              <p className="text-[9px] text-pencil uppercase font-bold tracking-widest">
                {schedule.items?.length || 0} Milestones • {progress}% Complete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className={cn(
                "p-2 rounded-lg transition-all",
                showCopied
                  ? "text-emerald-500 bg-emerald-50"
                  : "text-pencil/40 hover:text-gold hover:bg-gold/5"
              )}
              title="Share Schedule"
            >
              {isSharing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : showCopied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleDeleteSchedule}
              className="p-2 text-pencil/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gold" />
            ) : (
              <ChevronRight className="w-4 h-4 text-pencil/20" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-pencil/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Expanded Milestone View */}
      {isExpanded && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-2 mb-4">
            {schedule.items && schedule.items.length > 0 ? (
              schedule.items.map((item) => (
                <MilestoneItem
                  key={item.id}
                  item={item}
                  scheduleType={schedule.schedule_type}
                  isProcessing={processingItems.has(item.id)}
                  onToggle={(e) =>
                    handleToggleComplete(e, item.id, item.is_completed)
                  }
                  onNavigate={handleNavigate}
                  onRemove={(e) => handleRemoveItem(e, item.id)}
                />
              ))
            ) : (
              <div className="py-8 text-center bg-pencil/[0.02] rounded-xl border border-dashed border-pencil/10">
                <p className="text-[10px] uppercase font-bold text-pencil/40 tracking-widest">
                  No Milestones Added Yet
                </p>
              </div>
            )}
          </div>

          {/* Search/Add Section */}
          <div className="relative border-t border-pencil/5 pt-4">
            <Search className="absolute left-2.5 top-[1.45rem] w-3 h-3 text-pencil/40" />
            <input
              placeholder="Find a portion to add..."
              className="w-full h-8 pl-8 pr-4 bg-pencil/5 rounded-lg text-xs outline-none focus:bg-white border border-transparent focus:border-gold/20 transition-all font-medium"
              onChange={(e) => handleSearch(e.target.value)}
            />

            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto no-scrollbar pt-2">
                {searchResults.map((m) => (
                  <button
                    key={m.id}
                    disabled={isAdding}
                    onClick={() => handleAddMarker(m)}
                    className="w-full p-2.5 flex items-center justify-between text-left hover:bg-gold/5 rounded-lg transition-colors group/search disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <BookMarked className="w-3 h-3 text-pencil/40" />
                      <span className="text-xs text-ink font-bold">
                        {m.label}
                      </span>
                    </div>
                    {isAdding ? (
                      <Loader2 className="w-3 h-3 animate-spin text-gold" />
                    ) : (
                      <Plus className="w-3 h-3 text-gold opacity-0 group-hover/search:opacity-100" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
