"use client";

import React, { useState } from "react";
import {
  User as UserIcon,
  Loader2,
  Check,
  Plus,
  Book as BookIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MarketplaceItem } from "@/lib/types/library";

interface MarketplaceBookCardProps {
  item: MarketplaceItem;
  /**
   * Signature aligns with the master orchestrator.
   * type can be "translation" | "commentary" | "book"
   */
  onInstall: (id: string, type: any) => Promise<void>;
  onAuthorClick?: (name: string) => void;
  // Optional: Allow the card to act as a direct Link if already installed
  onOpen?: (id: string) => void;
}

/**
 * marketplace/shared/MarketplaceBookCard.tsx
 * The "Master Discovery Card" for DrashX.
 * Used for any item that can be 'installed' or 'added' to a user's sanctuary.
 */
export function MarketplaceBookCard({
  item,
  onInstall,
  onAuthorClick,
  onOpen,
}: MarketplaceBookCardProps) {
  const [isInstalling, setIsInstalling] = useState(false);

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If it's already installed, perform the 'Open' action instead
    if (item.is_installed && onOpen) {
      onOpen(item.id);
      return;
    }

    setIsInstalling(true);
    try {
      const itemType = item.type || "book";
      await onInstall(item.id, itemType);
    } finally {
      setIsInstalling(false);
    }
  };

  const safeDescription = item.description
    ? item.description.replace(/"/g, "&ldquo;").replace(/'/g, "&apos;")
    : "";

  return (
    <div
      onClick={() => item.is_installed && onOpen?.(item.id)}
      className={cn(
        "p-6 bg-white rounded-[2.5rem] border border-pencil/10 shadow-sm transition-all duration-500 group relative overflow-hidden",
        item.is_installed
          ? "hover:border-accent/30"
          : "hover:border-gold/30 hover:shadow-xl",
        onOpen && item.is_installed && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2 text-left">
          <div className="flex items-center gap-2">
            {item.type === "book" && (
              <BookIcon className="w-4 h-4 text-pencil/40" />
            )}
            <h4 className="font-serif font-bold text-xl text-ink leading-tight group-hover:text-accent transition-colors">
              {item.name}
            </h4>
          </div>

          {item.author_name && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAuthorClick?.(item.author_name!);
              }}
              className={cn(
                "flex items-center gap-2 text-[10px] font-bold text-pencil/60 uppercase tracking-widest transition-colors outline-none",
                onAuthorClick && "hover:text-accent"
              )}
            >
              <UserIcon className="w-3 h-3" />
              {item.author_name}
            </button>
          )}

          {item.description && (
            <p className="text-[11px] text-pencil/70 leading-relaxed italic line-clamp-2 pr-4">
              {safeDescription}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/5 rounded-lg border border-accent/5 text-accent text-[9px] font-black uppercase tracking-tight">
            {item.install_count || 0} added
          </div>

          <Button
            onClick={handleAction}
            disabled={isInstalling}
            variant={item.is_installed ? "imprinted" : "default"}
            className={cn(
              "h-10 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
              item.is_installed && "text-emerald-600 border-emerald-100"
            )}
          >
            {isInstalling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : item.is_installed ? (
              <React.Fragment>
                <Check className="w-3.5 h-3.5 mr-1" /> Added
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add to Library
              </React.Fragment>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
