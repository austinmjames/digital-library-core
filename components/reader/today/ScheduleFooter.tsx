"use client";

import { BookMarked } from "lucide-react";

/**
 * ScheduleFooter
 * Static informational section about importing schedules.
 */
export function ScheduleFooter() {
  return (
    <div className="p-5 rounded-2xl bg-indigo-600/[0.03] border border-indigo-600/10">
      <h5 className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest mb-1 flex items-center gap-2">
        <BookMarked className="w-3.5 h-3.5" />
        Import Schedulers
      </h5>
      <p className="text-[11px] text-indigo-800/70 leading-relaxed">
        You can import community schedules like the 929 Tanakh cycle or specific
        yeshiva programs via a share code.
      </p>
    </div>
  );
}
