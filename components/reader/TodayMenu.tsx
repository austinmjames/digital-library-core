"use client";

import { useEffect, useState } from "react";
import {
  X,
  Calendar,
  BookOpen,
  ChevronRight,
  Sun,
  Moon,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchDailyLearning,
  fetchUpcomingEvents,
  DailySchedule,
  UpcomingInfo,
} from "@/lib/hebcal";

interface TodayMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TodayMenu({ isOpen, onClose }: TodayMenuProps) {
  const [learning, setLearning] = useState<DailySchedule | null>(null);
  const [calendar, setCalendar] = useState<UpcomingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && !learning) {
      const loadData = async () => {
        setLoading(true);
        const [learnData, calData] = await Promise.all([
          fetchDailyLearning(),
          fetchUpcomingEvents(),
        ]);
        setLearning(learnData);
        setCalendar(calData);
        setLoading(false);
      };
      loadData();
    }
  }, [isOpen, learning]);

  if (!isOpen) return null;

  // Helper to format date nicely
  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Slide-over Panel (Right Side) or Modal */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-paper shadow-2xl border-l border-pencil/10 flex flex-col animate-in slide-in-from-right duration-300 sm:rounded-l-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-paper/80 backdrop-blur border-b border-pencil/10">
          <div>
            <h2 className="font-serif font-bold text-2xl text-ink">Today</h2>
            <p className="text-xs text-pencil font-medium uppercase tracking-wider">
              {todayDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-pencil/10 transition-colors"
          >
            <X className="w-6 h-6 text-pencil" />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-32 bg-pencil/10 rounded-xl" />
              <div className="h-20 bg-pencil/10 rounded-xl" />
              <div className="h-20 bg-pencil/10 rounded-xl" />
            </div>
          ) : (
            <>
              {/* --- Daily Study Section --- */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-pencil uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Daily Study
                  </h3>
                  <button className="text-[10px] font-bold text-gold hover:underline">
                    Edit Programs
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-pencil/10 shadow-sm divide-y divide-pencil/5 overflow-hidden">
                  {/* Torah Portion (Weekly) */}
                  {calendar?.shabbat.parasha && (
                    <div className="p-4 hover:bg-pencil/[0.02] transition-colors group cursor-pointer flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-pencil block mb-0.5">
                          Torah Portion
                        </span>
                        <span className="text-ink font-serif font-medium text-lg">
                          {calendar.shabbat.parasha}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-pencil/30 group-hover:text-gold transition-colors" />
                    </div>
                  )}

                  {/* Daf Yomi */}
                  {learning?.dafyomi && (
                    <div className="p-4 hover:bg-pencil/[0.02] transition-colors group cursor-pointer flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-pencil block mb-0.5">
                          Daf Yomi
                        </span>
                        <span className="text-ink font-serif font-medium text-lg">
                          {learning.dafyomi.name}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-pencil/30 group-hover:text-gold transition-colors" />
                    </div>
                  )}

                  {/* Tanya (Mock for now as per prompt requirement) */}
                  <div className="p-4 hover:bg-pencil/[0.02] transition-colors group cursor-pointer flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-pencil block mb-0.5">
                        Tanya
                      </span>
                      <span className="text-ink font-serif font-medium text-lg">
                        Likutei Amarim, Ch 12
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-pencil/30 group-hover:text-gold transition-colors" />
                  </div>

                  {/* Add Custom Program Placeholder */}
                  <div className="p-3 bg-pencil/[0.02] text-center">
                    <span className="text-xs text-pencil/50 font-medium cursor-pointer hover:text-gold transition-colors">
                      + Add Custom Program
                    </span>
                  </div>
                </div>
              </section>

              {/* --- Upcoming Events Section --- */}
              <section>
                <h3 className="text-sm font-bold text-pencil uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4" />
                  Upcoming
                </h3>

                <div className="space-y-3">
                  {/* Shabbat Times Card */}
                  <div className="bg-ink text-paper p-5 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sun className="w-16 h-16" />
                    </div>

                    <div className="relative z-10">
                      <h4 className="font-serif font-bold text-xl mb-1">
                        Shabbat Times
                      </h4>
                      <p className="text-xs text-paper/60 mb-4 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Detected Location
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-paper/10">
                              <Sun className="w-4 h-4 text-gold" />
                            </div>
                            <span className="text-sm font-medium">
                              Candle Lighting
                            </span>
                          </div>
                          <span className="font-mono text-sm">
                            {calendar?.shabbat.start
                              ? new Date(
                                  calendar.shabbat.start
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "--:--"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-paper/10">
                              <Moon className="w-4 h-4 text-indigo-300" />
                            </div>
                            <span className="text-sm font-medium">
                              Havdalah
                            </span>
                          </div>
                          <span className="font-mono text-sm">
                            {calendar?.shabbat.end
                              ? new Date(
                                  calendar.shabbat.end
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "--:--"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Holidays List */}
                  <div className="bg-white rounded-2xl border border-pencil/10 p-1">
                    {calendar?.events.map((event, idx) => (
                      <div
                        key={idx}
                        className="p-3 flex items-start gap-3 border-b border-pencil/5 last:border-0"
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0",
                            event.yomtov
                              ? "bg-red-50 text-red-600"
                              : "bg-emerald-50 text-emerald-600"
                          )}
                        >
                          <span className="text-[10px] font-bold uppercase">
                            {new Date(event.date).getDate()}
                          </span>
                          <span className="text-[8px] font-bold uppercase">
                            {new Date(event.date).toLocaleDateString([], {
                              month: "short",
                            })}
                          </span>
                        </div>
                        <div>
                          <h5 className="font-serif font-bold text-ink text-sm">
                            {event.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            {event.yomtov ? (
                              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                                Work Prohibited
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Work Permitted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {calendar?.events.length === 0 && (
                      <p className="p-4 text-xs text-pencil text-center">
                        No major holidays upcoming.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}
