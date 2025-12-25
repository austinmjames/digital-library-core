"use client";

import React from "react";
import {
  Library,
  Clock,
  Sparkles,
  Plus,
  Share2,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DailySchedule } from "@/lib/hebcal";

interface StudiesTabProps {
  learning: DailySchedule | null;
  onStudyClick: (type: string, name: string, ref: string) => void;
}

export function StudiesTab({ learning, onStudyClick }: StudiesTabProps) {
  if (!learning)
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-20 italic">
        <Library className="w-12 h-12 mb-4" />
        <p className="text-sm font-sans">Retrieving your scrolls...</p>
      </div>
    );

  const tracks = [
    {
      id: "parasha",
      label: "Torah Portion",
      data: learning.parasha,
      icon: Library,
    },
    { id: "dafyomi", label: "Daf Yomi", data: learning.dafyomi, icon: Clock },
    {
      id: "rambam",
      label: "Daily Rambam",
      data: learning.rambam,
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <header className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-pencil/40 uppercase tracking-[0.2em]">
          Active Library
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[10px] font-bold uppercase text-accent hover:bg-accent/5"
        >
          <Plus className="w-3 h-3 mr-1.5" /> Create Path
        </Button>
      </header>

      <div className="space-y-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="group p-5 bg-white border border-pencil/10 rounded-[2rem] shadow-sm hover:border-accent/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <button
                onClick={() =>
                  track.data &&
                  onStudyClick(track.id, track.data.name, track.data.ref)
                }
                className="flex items-center gap-4 text-left group-hover:opacity-80 transition-opacity outline-none"
              >
                <div className="w-12 h-12 rounded-2xl bg-pencil/5 flex items-center justify-center imprint-sm">
                  <track.icon className="w-6 h-6 text-pencil/30" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-pencil/40 uppercase tracking-widest block mb-0.5">
                    {track.label}
                  </span>
                  <span className="text-base font-bold text-ink leading-tight">
                    {track.data?.name || "N/A"}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full text-pencil/40 hover:text-accent"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full text-pencil/40 hover:text-accent"
                >
                  <Globe className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-pencil/5 border border-pencil/5 text-[8px] font-black uppercase text-pencil/60">
                <Lock className="w-2 h-2" /> Private Path
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
