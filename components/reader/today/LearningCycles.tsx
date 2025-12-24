"use client";

import { BookOpen, ChevronRight, Hash, Bookmark } from "lucide-react";
import { DailySchedule } from "@/lib/hebcal";
import { cn } from "@/lib/utils";

interface LearningCyclesProps {
  learning: DailySchedule | null;
  onStudyClick: (type: string, name: string, ref: string) => void;
}

/**
 * components/reader/today/LearningCycles.tsx
 * List of daily study portions with clear hierarchy and touch-friendly targets.
 */
export function LearningCycles({
  learning,
  onStudyClick,
}: LearningCyclesProps) {
  const studyItems = [
    {
      id: "parasha",
      label: "Torah Portion",
      data: learning?.parasha,
      icon: BookOpen,
      color: "text-gold bg-gold/5",
    },
    {
      id: "dafyomi",
      label: "Daf Yomi",
      data: learning?.dafyomi,
      icon: Hash,
      color: "text-indigo-500 bg-indigo-500/5",
    },
    {
      id: "tanya",
      label: "Tanya",
      data: learning?.tanya,
      icon: Bookmark,
      color: "text-emerald-600 bg-emerald-600/5",
    },
  ];

  return (
    <section className="space-y-4">
      <h3 className="text-[10px] font-black text-pencil/40 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
        <BookOpen className="w-3 h-3" />
        Learning Cycles
      </h3>

      <div className="bg-white rounded-[2rem] border border-pencil/10 divide-y divide-pencil/5 overflow-hidden shadow-sm">
        {studyItems.map((item) => {
          if (!item.data) return null;

          return (
            <button
              key={item.id}
              onClick={() =>
                onStudyClick(item.id, item.data!.name, item.data!.ref)
              }
              className="w-full text-left p-5 hover:bg-pencil/[0.02] active:bg-pencil/5 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm",
                    item.color
                  )}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-pencil/40 uppercase tracking-widest block mb-0.5">
                    {item.label}
                  </span>
                  <span className="text-ink font-serif font-bold text-lg leading-tight group-hover:text-gold transition-colors">
                    {item.data.name}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-pencil/20 group-hover:text-gold group-hover:translate-x-1 transition-all" />
            </button>
          );
        })}

        {/* Placeholder if empty */}
        {!learning?.parasha && !learning?.dafyomi && (
          <div className="p-10 text-center opacity-30 italic text-sm">
            No active cycles today
          </div>
        )}
      </div>
    </section>
  );
}
