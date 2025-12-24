"use client";

import { BookOpen, ChevronRight } from "lucide-react";
import { DailySchedule } from "@/lib/hebcal";

interface LearningCyclesProps {
  learning: DailySchedule | null;
  onStudyClick: (type: string, name: string, ref: string) => void;
}

export function LearningCycles({
  learning,
  onStudyClick,
}: LearningCyclesProps) {
  return (
    <section>
      <h3 className="text-[10px] font-bold text-pencil uppercase tracking-widest flex items-center gap-2 mb-4">
        <BookOpen className="w-3.5 h-3.5" />
        Learning Cycles
      </h3>
      <div className="bg-white rounded-2xl border border-pencil/10 divide-y divide-pencil/5 overflow-hidden shadow-sm">
        {learning?.parasha && (
          <button
            onClick={() =>
              onStudyClick(
                "parasha",
                learning.parasha!.name,
                learning.parasha!.ref
              )
            }
            className="w-full text-left p-4 hover:bg-pencil/[0.02] flex items-center justify-between group"
          >
            <div>
              <span className="text-[9px] text-pencil/50 uppercase block mb-0.5 font-bold tracking-tighter">
                Torah Portion
              </span>
              <span className="text-ink font-serif font-bold text-lg">
                {learning.parasha.name}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-pencil/30 group-hover:text-gold transition-colors" />
          </button>
        )}
        {learning?.dafyomi && (
          <button
            onClick={() =>
              onStudyClick(
                "dafyomi",
                learning.dafyomi!.name,
                learning.dafyomi!.ref
              )
            }
            className="w-full text-left p-4 hover:bg-pencil/[0.02] flex items-center justify-between group"
          >
            <div>
              <span className="text-[9px] text-pencil/50 uppercase block mb-0.5 font-bold tracking-tighter">
                Daf Yomi
              </span>
              <span className="text-ink font-serif font-bold text-lg">
                {learning.dafyomi.name}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-pencil/30 group-hover:text-gold transition-colors" />
          </button>
        )}
      </div>
    </section>
  );
}
