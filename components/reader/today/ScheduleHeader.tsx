"use client";

import { Plus, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScheduleHeaderProps {
  view: "LIST" | "CREATE" | "IMPORT";
  onToggleCreate: () => void;
  onToggleImport: () => void;
}

/**
 * ScheduleHeader
 * Enhanced to handle multi-view toggling for creation and importing.
 */
export function ScheduleHeader({
  view,
  onToggleCreate,
  onToggleImport,
}: ScheduleHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-[10px] font-bold text-pencil uppercase tracking-widest">
        Your Study Paths
      </h3>

      <div className="flex items-center gap-1">
        {view === "LIST" ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleImport}
              className="h-7 px-2 text-pencil/60 hover:text-indigo-600 gap-1 text-[10px] uppercase font-bold"
            >
              <Download className="w-3 h-3" /> Import
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCreate}
              className="h-7 px-2 text-gold hover:text-gold/80 gap-1 text-[10px] uppercase font-bold"
            >
              <Plus className="w-3 h-3" /> New
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={view === "CREATE" ? onToggleCreate : onToggleImport}
            className="h-7 px-2 text-pencil/40 hover:text-pencil gap-1 text-[10px] uppercase font-bold"
          >
            <X className="w-3 h-3" /> Close
          </Button>
        )}
      </div>
    </div>
  );
}
