"use client";

import { ArrowRight, Calendar, Clock } from "lucide-react";

export const PlansView = () => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    {/* Featured Plan (Daf Yomi) */}
    <div className="bg-zinc-900 rounded-3xl p-8 mb-10 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-orange-400">
            <Calendar size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Global Schedule
            </span>
          </div>
          <h2 className="text-3xl font-serif font-bold mb-2">
            Daf Yomi: Today&rsquo;s Portion
          </h2>
          <p className="text-zinc-400 max-w-lg">
            Join learners worldwide in the daily study of the Talmud.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white text-zinc-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
          Start Today <ArrowRight size={16} />
        </button>
      </div>
    </div>

    <h2 className="text-lg font-bold text-zinc-900 mb-6">
      Curated Learning Paths
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="group p-4 bg-white border border-zinc-100 rounded-2xl cursor-pointer hover:border-zinc-300 transition-colors"
        >
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0">
              <Clock size={24} className="text-zinc-400" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900">30 Days of Psalms</h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                A guided journey through the poetry of King David, focused on
                healing.
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
