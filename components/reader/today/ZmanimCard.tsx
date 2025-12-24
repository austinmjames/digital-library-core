"use client";

import { Sun, Moon, Clock } from "lucide-react";
import { UpcomingInfo } from "@/lib/hebcal";
// Removed unused cn import

interface ZmanimCardProps {
  calendar: UpcomingInfo | null;
}

/**
 * components/reader/today/ZmanimCard.tsx
 * A high-fidelity iOS-style widget for Shabbat times.
 * Features the "Slate & Chalk" palette with warm gold accents.
 */
export function ZmanimCard({ calendar }: ZmanimCardProps) {
  const formatTime = (isoString?: string) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150">
      <div className="bg-ink text-paper p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        {/* Decorative Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[60px] group-hover:bg-gold/20 transition-all duration-1000" />
        <Sun className="absolute -top-6 -right-6 w-32 h-32 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000" />

        <div className="relative z-10">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-serif font-bold text-2xl tracking-tight italic">
                Shabbat Kodesh
              </h4>
              <p className="text-[10px] text-paper/40 uppercase font-black tracking-[0.2em] mt-0.5">
                {calendar?.shabbat.parasha || "Loading Portion..."}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-paper/5 border border-paper/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gold/60" />
            </div>
          </header>

          <div className="grid grid-cols-2 gap-4">
            {/* Candle Lighting */}
            <div className="p-4 rounded-3xl bg-paper/5 border border-paper/10 backdrop-blur-sm group/item hover:bg-paper/10 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                  <Sun className="w-3.5 h-3.5 text-gold" />
                </div>
                <span className="text-[9px] font-black text-paper/40 uppercase tracking-widest">
                  Candles
                </span>
              </div>
              <span className="font-mono text-2xl font-bold tracking-tighter">
                {formatTime(calendar?.shabbat.start)}
              </span>
            </div>

            {/* Havdalah */}
            <div className="p-4 rounded-3xl bg-paper/5 border border-paper/10 backdrop-blur-sm group/item hover:bg-paper/10 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="text-[9px] font-black text-paper/40 uppercase tracking-widest">
                  Havdalah
                </span>
              </div>
              <span className="font-mono text-2xl font-bold tracking-tighter">
                {formatTime(calendar?.shabbat.end)}
              </span>
            </div>
          </div>

          <footer className="mt-5 pt-4 border-t border-paper/5 flex items-center justify-center">
            <span className="text-[8px] font-bold text-paper/20 uppercase tracking-[0.3em]">
              Precision Sanctuary Times
            </span>
          </footer>
        </div>
      </div>
    </section>
  );
}
