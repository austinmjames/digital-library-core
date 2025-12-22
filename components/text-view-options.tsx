"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlignJustify, Columns, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTextSettings } from "@/components/text-settings-context";

export function TextViewOptions() {
  const { language, setLanguage, layout, setLayout, fontSize, setFontSize } = useTextSettings();

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-accent border">
          <Type className="h-5 w-5" />
          <span className="sr-only">Text Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-72 p-4 flex flex-col gap-6 shadow-2xl rounded-2xl border-muted bg-background/95 backdrop-blur-md" 
        align="end" 
        sideOffset={10}
      >
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider font-bold opacity-50 px-1">Language</p>
          <div className="flex bg-muted/50 rounded-xl p-1">
            <Button variant="ghost" size="sm" onClick={(e) => handleAction(e, () => setLanguage("he"))} className={cn("flex-1 h-9 rounded-lg", language === "he" && "bg-background shadow-sm")}>א</Button>
            <Button variant="ghost" size="sm" onClick={(e) => handleAction(e, () => setLanguage("both"))} className={cn("flex-1 h-9 rounded-lg gap-1", language === "both" && "bg-background shadow-sm")}>א A</Button>
            <Button variant="ghost" size="sm" onClick={(e) => handleAction(e, () => setLanguage("en"))} className={cn("flex-1 h-9 rounded-lg", language === "en" && "bg-background shadow-sm")}>A</Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider font-bold opacity-50 px-1">View</p>
          <div className="flex bg-muted/50 rounded-xl p-1">
            <Button variant="ghost" size="sm" onClick={(e) => handleAction(e, () => setLayout("stacked"))} className={cn("flex-1 h-9 rounded-lg", layout === "stacked" && "bg-background shadow-sm")}><AlignJustify className="h-4 w-4"/></Button>
            <Button variant="ghost" size="sm" onClick={(e) => handleAction(e, () => setLayout("side-by-side"))} className={cn("flex-1 h-9 rounded-lg", layout === "side-by-side" && "bg-background shadow-sm")}><Columns className="h-4 w-4"/></Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">Text Size</p>
            <span className="text-[10px] font-bold tabular-nums opacity-50">{fontSize}pt</span>
          </div>
          
          <div className="relative flex items-center bg-muted/50 rounded-xl p-3 h-12">
            <span className="text-[10px] font-medium mr-2 opacity-40 select-none">A</span>
            <input
              type="range"
              min="14"
              max="28"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-black dark:accent-white"
            />
            <span className="text-lg font-medium ml-2 opacity-40 select-none leading-none">A</span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}