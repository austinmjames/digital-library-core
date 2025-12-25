"use client";

import React, { useState } from "react";
import { User as UserIcon, Loader2, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MarketplaceItem } from "@/lib/types/library";

interface CommentaryBookPanelProps {
  item: MarketplaceItem;
  onInstall: (id: string) => Promise<void>;
  onAuthorClick: (name: string) => void;
}

/**
 * CommentaryBookPanel
 * Pure UI component for an individual commentary book card.
 */
export function CommentaryBookPanel({
  item,
  onInstall,
  onAuthorClick,
}: CommentaryBookPanelProps) {
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await onInstall(item.id);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-[2.5rem] border border-pencil/10 shadow-sm hover:border-accent/30 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2 text-left">
          <h4 className="font-serif font-bold text-xl text-ink leading-tight group-hover:text-accent transition-colors">
            {item.name}
          </h4>

          {item.author_name && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAuthorClick(item.author_name!);
              }}
              className="flex items-center gap-2 text-[10px] font-bold text-pencil/60 uppercase tracking-widest hover:text-accent transition-colors outline-none"
            >
              <UserIcon className="w-3 h-3" />
              {item.author_name}
            </button>
          )}

          {item.description && (
            <p className="text-[11px] text-pencil/70 leading-relaxed italic line-clamp-2 pr-4">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/5 rounded-lg border border-accent/5 text-accent text-[9px] font-black uppercase tracking-tight">
            {item.install_count} added
          </div>

          <Button
            onClick={handleInstall}
            disabled={item.is_installed || isInstalling}
            variant={item.is_installed ? "imprinted" : "default"}
            className={cn(
              "h-10 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
              item.is_installed && "text-emerald-600 border-emerald-100"
            )}
          >
            {isInstalling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : item.is_installed ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1" /> Installed
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 mr-1" /> Install
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
