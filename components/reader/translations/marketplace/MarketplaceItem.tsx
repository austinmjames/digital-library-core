"use client";

import React from "react";
import { Download, Check, MoreVertical, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketplaceVersion } from "@/lib/types/library";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MarketplaceItemProps {
  item: MarketplaceVersion;
  onSelect: (id: string) => void;
  onInstall: () => void;
  onReport: (reason: string) => void;
}

/**
 * MarketplaceItemUI
 * Resolved: Removed unused Globe import and renamed to avoid interface collision.
 */
export function MarketplaceItemUI({
  item,
  onSelect,
  onInstall,
  onReport,
}: MarketplaceItemProps) {
  return (
    <div className="flex flex-col gap-4 p-5 rounded-[2rem] bg-white border border-pencil/10 hover:border-indigo-600/30 hover:shadow-xl transition-all group relative overflow-hidden shadow-sm">
      <div className="flex justify-between items-start">
        <div
          className="flex-1 cursor-pointer pr-8"
          onClick={() => onSelect(item.id)}
        >
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-serif font-bold text-lg text-ink leading-tight group-hover:text-indigo-600 transition-colors">
              {item.name}
            </h4>
            {item.is_system && (
              <span className="bg-gold text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                System
              </span>
            )}
          </div>
          <p className="text-[10px] text-pencil font-bold uppercase tracking-widest">
            by {item.author_name || "Community Effort"}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full hover:bg-pencil/5 text-pencil opacity-40 hover:opacity-100 transition-opacity outline-none">
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onReport("Inappropriate Content")}
              className="text-red-600 font-bold text-[10px] uppercase gap-2"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Report Layer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {item.description && (
        <p className="text-xs text-pencil/70 line-clamp-2 italic leading-relaxed">
          {item.description}
        </p>
      )}

      <div className="mt-2 pt-4 border-t border-pencil/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-tight">
            {item.install_count} Installs
          </span>
          <span className="text-[9px] font-black text-pencil/40 uppercase tracking-widest flex items-center gap-1.5">
            <Download className="w-3 h-3" /> {item.segment_count || 0} Verses
          </span>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onInstall();
          }}
          disabled={item.is_installed}
          size="sm"
          className={cn(
            "h-8 rounded-full px-5 text-[9px] font-black uppercase tracking-widest transition-all",
            item.is_installed
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
              : "bg-ink text-paper hover:bg-indigo-600 shadow-md"
          )}
        >
          {item.is_installed ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1" /> Added
            </>
          ) : (
            "Install"
          )}
        </Button>
      </div>
    </div>
  );
}
