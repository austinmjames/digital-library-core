"use client";

import { Sun, Moon } from "lucide-react";
import { UpcomingInfo } from "@/lib/hebcal";

export function ZmanimCard({ calendar }: { calendar: UpcomingInfo | null }) {
  return (
    <section>
      <div className="bg-ink text-paper p-6 rounded-3xl shadow-xl relative overflow-hidden group">
        <Sun className="absolute -top-4 -right-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        <div className="relative z-10">
          <h4 className="font-serif font-bold text-2xl mb-1 italic">
            Shabbat Kodesh
          </h4>
          <p className="text-[10px] text-paper/40 mb-5 uppercase font-bold tracking-[0.2em]">
            Portion: {calendar?.shabbat.parasha || "Loading..."}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-2xl bg-paper/5 border border-paper/10">
              <Sun className="w-4 h-4 text-gold mb-2" />
              <span className="block text-[9px] font-bold text-paper/40 uppercase tracking-tighter mb-1">
                Candles
              </span>
              <span className="font-mono text-lg font-bold">
                {calendar?.shabbat.start
                  ? new Date(calendar.shabbat.start).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--"}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-paper/5 border border-paper/10">
              <Moon className="w-4 h-4 text-indigo-400 mb-2" />
              <span className="block text-[9px] font-bold text-paper/40 uppercase tracking-tighter mb-1">
                Havdalah
              </span>
              <span className="font-mono text-lg font-bold">
                {calendar?.shabbat.end
                  ? new Date(calendar.shabbat.end).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
