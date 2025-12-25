"use client";

import { cn } from "@/lib/utils";
import { User as UserIcon, MoreVertical, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface CommentaryEntryProps {
  id: string;
  textHe?: string;
  textEn?: string;
  authorName: string;
  authorDisplayName?: string;
  isUserNote?: boolean;
  isCollaborative?: boolean;
  date?: string;
  languageMode: "en" | "he" | "bilingual";
  showFootnotes: boolean;
  onEdit?: (id: string, content: string, collection: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * CommentaryEntry
 * Updated: Set explicit font sizes (16pt approx) for readability.
 */
export function CommentaryEntry({
  id,
  textHe,
  textEn,
  authorName,
  authorDisplayName,
  isUserNote,
  isCollaborative,
  date,
  languageMode,
  showFootnotes,
  onEdit,
  onDelete,
}: CommentaryEntryProps) {
  const renderHe =
    (languageMode === "he" || languageMode === "bilingual") &&
    (textHe || (!textEn && languageMode === "he"));
  const renderEn =
    (languageMode === "en" || languageMode === "bilingual") &&
    (textEn || (!textHe && languageMode === "en"));

  const displayName = authorDisplayName?.trim() || "unnamed";

  return (
    <div className="pt-3 first:pt-0 group/entry relative pr-12">
      <div className="space-y-2.5">
        {renderHe && (
          <div
            className={cn(
              "text-right font-hebrew leading-relaxed text-ink",
              !showFootnotes && "hide-notes"
            )}
            style={{ fontSize: "13pt" }} // Explicit 12pt as requested
            dangerouslySetInnerHTML={{ __html: textHe || textEn || "" }}
          />
        )}
        {renderEn && (
          <div
            className={cn(
              "text-left font-english leading-relaxed text-ink/80",
              languageMode === "bilingual" &&
                textHe &&
                "border-t border-pencil/10 pt-2 mt-1",
              !showFootnotes && "hide-notes"
            )}
            style={{ fontSize: "13pt" }} // Explicit 14pt as requested
            dangerouslySetInnerHTML={{ __html: textEn || textHe || "" }}
          />
        )}

        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1.5">
            {isUserNote ? (
              isCollaborative ? (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-pencil/5 rounded-full border border-pencil/5">
                  <UserIcon className="w-2.5 h-2.5 text-pencil/40" />
                  <span className="text-[9px] font-bold text-pencil/70 uppercase tracking-tight">
                    {displayName}
                  </span>
                </div>
              ) : (
                date && (
                  <div className="text-[9px] text-pencil/30 font-mono tracking-tighter uppercase">
                    {new Date(date).toLocaleDateString()}
                  </div>
                )
              )
            ) : null}
          </div>

          {/* iOS Tap-Friendly Action Menu: Absolute top-right alignment */}
          {isUserNote && (onEdit || onDelete) && (
            <div className="absolute top-0 right-[-12px] opacity-0 group-hover/entry:opacity-100 transition-opacity z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-4 rounded-xl hover:bg-pencil/5 text-pencil/20 hover:text-ink transition-all active:scale-95 outline-none">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 rounded-2xl p-1.5 shadow-2xl border-pencil/10 bg-paper/95 backdrop-blur-xl"
                >
                  <DropdownMenuItem
                    onClick={() =>
                      onEdit?.(id, textEn || textHe || "", authorName)
                    }
                    className="flex items-center gap-3 rounded-xl py-3.5 px-4 text-xs font-bold uppercase tracking-widest cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 text-pencil" />
                    Edit Note
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(id)}
                    className="flex items-center gap-3 rounded-xl py-3.5 px-4 text-xs font-bold uppercase tracking-widest text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
