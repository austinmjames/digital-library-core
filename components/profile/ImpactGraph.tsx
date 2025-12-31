"use client";

import { cn } from "@/lib/utils/utils";
import { Calendar } from "lucide-react";

interface ImpactGraphProps {
  data: number[];
}

/**
 * ImpactGraph
 * Filepath: components/profile/ImpactGraph.tsx
 * Role: Contribution heatmap visualization.
 */
export const ImpactGraph = ({ data }: ImpactGraphProps) => {
  return (
    <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.3em] flex items-center gap-3">
          <Calendar size={16} className="text-amber-500" /> Scholarship Graph
        </h3>
        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
          Study Density for current cycle
        </span>
      </div>

      <div
        className="flex gap-1 overflow-hidden"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(52, 1fr)",
          height: "100px",
        }}
      >
        {data.map((val, i) => (
          <div
            key={i}
            className={cn(
              "w-full rounded-sm transition-all hover:scale-125 cursor-pointer",
              val > 0.8
                ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                : val > 0.5
                ? "bg-amber-200"
                : "bg-zinc-100"
            )}
            title={`Intensity: ${Math.floor(val * 100)}%`}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center text-[9px] text-zinc-300 font-black uppercase tracking-[0.3em]">
        <span>Tishrei</span>
        <span>Shevat</span>
        <span>Nisan</span>
        <span>Sivan</span>
        <span>Elul</span>
      </div>
    </section>
  );
};
