"use client";

import { Calendar, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/lib/hebcal";

export function HolidayEvents({ events }: { events: CalendarEvent[] }) {
  return (
    <section>
      <h3 className="text-[10px] font-bold text-pencil uppercase tracking-widest flex items-center gap-2 mb-4">
        <Calendar className="w-3.5 h-3.5" />
        Upcoming Events
      </h3>
      <div className="space-y-4">
        {events.map((event, idx) => (
          <div
            key={idx}
            className="p-5 rounded-3xl border border-pencil/10 bg-white shadow-sm group hover:border-gold/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 border",
                    event.status?.includes("Fast")
                      ? "bg-red-50 text-red-600 border-red-100"
                      : event.status === "Yom Tov"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-pencil/5 text-pencil border-pencil/10"
                  )}
                >
                  <span className="text-base font-bold leading-none">
                    {new Date(event.date).getDate()}
                  </span>
                  <span className="text-[9px] font-bold uppercase mt-1">
                    {new Date(event.date).toLocaleDateString([], {
                      month: "short",
                    })}
                  </span>
                </div>
                <div>
                  <h5 className="font-serif font-bold text-ink text-base">
                    {event.title}
                  </h5>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        "text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border",
                        event.status?.includes("Fast")
                          ? "bg-red-100 text-red-700 border-red-200"
                          : event.status === "Yom Tov"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-pencil/10 text-pencil/60 border-pencil/20"
                      )}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="mt-3 pt-3 border-t border-pencil/5 flex gap-3">
                <Info className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                <p className="text-xs text-pencil/70 leading-relaxed italic">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
