"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  searchMarkers,
  addMarkerToSchedule,
  deleteSchedule,
  removeScheduleItem,
  resolveStudyRef,
  toggleScheduleItemCompletion,
  shareSchedule,
} from "@/app/actions";
import { UserSchedule, LibraryMarker } from "@/lib/types/library";

/**
 * useScheduleCard
 * Resolved: Correctly handled error in handleRemoveItem.
 */
export function useScheduleCard(schedule: UserSchedule, onUpdate: () => void) {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<LibraryMarker[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [processingItems, setProcessingItems] = useState<Set<string>>(
    new Set()
  );

  const progress = useMemo(() => {
    if (!schedule.items || schedule.items.length === 0) return 0;
    const completed = schedule.items.filter((i) => i.is_completed).length;
    return Math.round((completed / schedule.items.length) * 100);
  }, [schedule.items]);

  const handleSearch = async (q: string) => {
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const results = await searchMarkers(q);
    setSearchResults(results);
  };

  const handleAddMarker = async (marker: LibraryMarker) => {
    setIsAdding(true);
    try {
      const dayOrDate =
        schedule.schedule_type === "sequence"
          ? (schedule.items?.length || 0) + 1
          : new Date().toISOString().split("T")[0];

      await addMarkerToSchedule(schedule.id, marker.id, dayOrDate);
      setSearchResults([]);
      onUpdate();
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleComplete = async (
    e: React.MouseEvent,
    itemId: string,
    currentState: boolean
  ) => {
    e.stopPropagation();
    setProcessingItems((prev) => new Set(prev).add(itemId));
    try {
      await toggleScheduleItemCompletion(itemId, !currentState);
      onUpdate();
    } finally {
      setProcessingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSharing(true);
    try {
      const result = await shareSchedule(schedule.id);
      if (result.success) {
        const input = document.createElement("input");
        input.value = result.code;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);

        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDeleteSchedule = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this study path?")) return;
    setIsDeleting(true);
    try {
      await deleteSchedule(schedule.id);
      onUpdate();
    } catch (err) {
      console.error("Delete failed:", err);
      setIsDeleting(false);
    }
  };

  const handleRemoveItem = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    try {
      await removeScheduleItem(itemId);
      onUpdate();
    } catch (err) {
      console.error("Remove item failed:", err);
    }
  };

  const handleNavigate = async (ref: string) => {
    const path = await resolveStudyRef(ref);
    if (path) router.push(path);
  };

  return {
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
  };
}
