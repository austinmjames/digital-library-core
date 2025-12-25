"use client";

import React from "react";
import { MoreVertical, ShieldAlert, Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketplaceItem } from "@/lib/types/library";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MarketplaceCardProps {
  item: MarketplaceItem;
  onInstall: () => void;
  onReport: (reason: string) => void;
}

/**
 * MarketplaceCardUI
 * Resolved: Removed unused 'Download' import.
 */
export function MarketplaceCardUI({
  item,
  onInstall,
  onReport,
}: MarketplaceCardProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-[2.5rem] border transition-all group relative bg-white overflow-hidden shadow-sm",
        item.is_system
          ? "border-gold/20 bg-gold/[0.01]"
          : "border-pencil/10 hover:border-indigo-600/30 hover:shadow-xl"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1.5 pr-8">
          <div className="flex items-center gap-2.5">
            <h4 className="font-serif font-bold text-xl text-ink leading-tight">
              {item.name}
            </h4>
            {item.is_system && (
              <span className="bg-gold text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                System
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-pencil/40 uppercase tracking-widest">
            <User className="w-3 h-3" />{" "}
            {item.author_name || "Community Effort"}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2.5 rounded-full hover:bg-pencil/5 text-pencil transition-opacity group-hover:opacity-100 opacity-20 outline-none">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-2xl border-pencil/10 shadow-2xl"
          >
            <DropdownMenuItem
              onClick={() => onReport("Inappropriate Content")}
              className="text-red-600 gap-2 p-3 font-bold text-xs uppercase tracking-widest"
            >
              <ShieldAlert className="w-4 h-4" /> Report Content
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {item.description && (
        <p className="text-[11px] text-pencil/70 leading-relaxed italic line-clamp-3 mb-6">
          {item.description}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-pencil/5 pt-5">
        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-tight">
          {item.install_count} added
        </span>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onInstall();
          }}
          disabled={item.is_installed || item.is_system}
          size="sm"
          className={cn(
            "h-9 rounded-full px-8 text-[10px] font-black uppercase tracking-widest transition-all",
            item.is_installed || item.is_system
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
              : "bg-ink text-paper hover:bg-indigo-600"
          )}
        >
          {item.is_installed || item.is_system ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" /> Added
            </>
          ) : (
            "Install"
          )}
        </Button>
      </div>
    </div>
  );
}
