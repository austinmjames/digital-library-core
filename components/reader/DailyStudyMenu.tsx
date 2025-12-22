"use client";

import { useEffect, useState } from "react";
import { 
  Calendar, 
  Sparkles, 
  BookOpen, 
  Sliders, 
  Plus, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StudyData {
  date: { hebrew: string };
  parsha: { name: string; ref: string };
  dafYomi: { ref: string };
  holidays: { name: string; date: string }[];
  shabbat: { candleLighting: string; parsha: string } | null;
}

export function DailyStudyMenu() {
  const [data, setData] = useState<StudyData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/study/today');
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Failed to fetch daily study", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-black/[0.03] dark:hover:bg-white/[0.05]">
          <Calendar className="h-5 w-5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 p-2 rounded-2xl shadow-xl border-muted bg-background/95 backdrop-blur-md">
        <div className="px-3 py-2 border-b border-muted/50 mb-2">
          {/* FIXED: Escaped apostrophe */}
          <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">Today&apos;s Study</p>
          <p className="text-xs font-medium opacity-80 mt-0.5">
            {data && data.date ? data.date.hebrew : "Loading date..."}
          </p>
        </div>
        
        {loading || !data ? (
          <div className="h-20 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin opacity-50" />
          </div>
        ) : (
          <>
            <DropdownMenuItem className="rounded-xl py-3 px-3 cursor-pointer flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">Torah Portion</span>
                <span className="text-[10px] opacity-50 truncate">
                  {data.parsha?.name} • {data.parsha?.ref}
                </span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem className="rounded-xl py-3 px-3 cursor-pointer flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">Daf Yomi</span>
                <span className="text-[10px] opacity-50 truncate">{data.dafYomi?.ref}</span>
              </div>
            </DropdownMenuItem>
            
            {data.shabbat && (
              <div className="px-3 py-2 bg-muted/20 rounded-xl my-2 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="opacity-60">Candle Lighting</span>
                  <span className="font-medium">{data.shabbat.candleLighting}</span>
                </div>
                {data.holidays && data.holidays[0] && (
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="opacity-60">Next: {data.holidays[0].name}</span>
                    <span className="font-medium">{data.holidays[0].date}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <DropdownMenuSeparator className="my-2" />
        
        <DropdownMenuItem className="rounded-xl py-2 px-3 cursor-pointer flex items-center gap-2 text-xs font-medium opacity-60 hover:opacity-100">
          <Plus className="h-3 w-3" />
          Browse for a study to add
        </DropdownMenuItem>
        
        <DropdownMenuItem className="rounded-xl py-2 px-3 cursor-pointer flex items-center gap-2 text-xs font-medium opacity-60 hover:opacity-100">
          <Sliders className="h-3 w-3" />
          Manage Daily Tracks
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}