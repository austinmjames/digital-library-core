"use client";

import React from "react";
import { Calendar, Sun, Moon, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExtendedUpcomingInfo } from "./useTodayMenu";

interface EventsTabProps {
  calendar: ExtendedUpcomingInfo | null;
  locationName: string;
  isEditing: boolean;
  zipInput: string;
  onZipChange: (val: string) => void;
  onSave: () => void;
  onDetect: () => void;
  onCancel: () => void;
  onEditToggle: () => void;
}

export function EventsTab({
  calendar,
  locationName,
  isEditing,
  zipInput,
  onZipChange,
  onSave,
  onDetect,
  onCancel,
  onEditToggle,
}: EventsTabProps) {
  const zmanim = calendar?.zmanim;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-sans">
      <section className="space-y-4">
        <header className="flex items-center justify-between px-1 min-h-[32px]">
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1 animate-in slide-in-from-left-2">
              <input
                autoFocus
                value={zipInput}
                onChange={(e) => onZipChange(e.target.value)}
                placeholder="Zip or Coords"
                className="w-32 bg-pencil/5 border-none rounded-lg px-2 py-1 text-xs font-bold outline-none ring-1 ring-pencil/10 focus:ring-accent/30 imprint-sm"
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onDetect}
                  className="h-7 px-2 shadow-sm"
                >
                  <Navigation className="w-3 h-3 text-accent" />
                </Button>
                <Button
                  size="sm"
                  onClick={onSave}
                  className="h-7 px-3 text-[10px] font-black uppercase"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onCancel}
                  className="h-7 px-2 text-[10px] font-black uppercase"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={onEditToggle}
              className="flex items-center gap-2 group text-left outline-none"
            >
              <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center imprint-sm group-hover:bg-accent/20 transition-colors">
                <MapPin className="w-3 h-3 text-accent" />
              </div>
              <span className="text-[10px] font-black text-pencil uppercase tracking-widest group-hover:text-ink transition-colors truncate max-w-[200px]">
                {locationName}
              </span>
            </button>
          )}
          {!isEditing && (
            <span className="text-[9px] font-mono font-bold text-pencil/30 uppercase shrink-0">
              Precision Timing
            </span>
          )}
        </header>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              label: "Sunrise",
              val: zmanim?.sunrise,
              icon: Sun,
              color: "bg-amber-50 text-amber-500",
            },
            {
              label: "Sunset",
              val: zmanim?.sunset,
              icon: Moon,
              color: "bg-indigo-50 text-indigo-500",
            },
          ].map((z, i) => (
            <div
              key={i}
              className="p-5 bg-white border border-pencil/10 rounded-[1.8rem] shadow-sm flex items-center gap-4"
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${z.color}`}
              >
                <z.icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-pencil/40 uppercase tracking-widest">
                  {z.label}
                </span>
                <span className="text-sm font-bold text-ink">
                  {z.val || "--:--"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-pencil/40 uppercase tracking-[0.2em] px-1">
          Calendar Events
        </h3>
        <div className="space-y-3 pb-10">
          {calendar?.events?.map((event, idx) => (
            <div
              key={idx}
              className="p-4 bg-pencil/5 border border-pencil/5 rounded-2xl flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-pencil/30 group-hover:text-accent transition-colors" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-charcoal">
                    {event.title}
                  </span>
                  <span className="text-[8px] font-black uppercase text-pencil/40 mt-0.5 tracking-widest">
                    {event.status || "Liturgical"}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-pencil/40">
                {event.date}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
