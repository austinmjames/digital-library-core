"use client";

import { cn } from "@/lib/utils";
import { User as UserIcon } from "lucide-react";

interface CommentaryEntryProps {
  id: string;
  textHe?: string;
  textEn?: string;
  authorName: string;
  authorDisplayName?: string; // profile full_name
  isUserNote?: boolean;
  isCollaborative?: boolean;
  date?: string;
  languageMode: "en" | "he" | "bilingual";
  showFootnotes: boolean;
}

export function CommentaryEntry({
  textHe,
  textEn,
  authorDisplayName,
  isUserNote,
  isCollaborative,
  date,
  languageMode,
  showFootnotes,
}: CommentaryEntryProps) {
  const renderHe =
    (languageMode === "he" || languageMode === "bilingual") &&
    (textHe || (!textEn && languageMode === "he"));
  const renderEn =
    (languageMode === "en" || languageMode === "bilingual") &&
    (textEn || (!textHe && languageMode === "en"));

  // Privacy: Never show email. Fallback to 'unnamed' if profile name is missing.
  const displayName = authorDisplayName?.trim() || "unnamed";

  return (
    <div className="pt-3 first:pt-0">
      <div className="space-y-2.5">
        {renderHe && (
          <div
            className={cn(
              "text-right font-hebrew text-lg leading-relaxed text-ink",
              !showFootnotes && "hide-notes"
            )}
            dangerouslySetInnerHTML={{ __html: textHe || textEn || "" }}
          />
        )}
        {renderEn && (
          <div
            className={cn(
              "text-left font-english text-sm leading-relaxed text-ink/80",
              languageMode === "bilingual" &&
                textHe &&
                "border-t border-pencil/10 pt-2 mt-1",
              !showFootnotes && "hide-notes"
            )}
            dangerouslySetInnerHTML={{ __html: textEn || textHe || "" }}
          />
        )}

        {isUserNote && (
          <div className="flex items-center justify-end gap-1.5 mt-1.5">
            {isCollaborative ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-pencil/5 rounded-full border border-pencil/5">
                <UserIcon className="w-2.5 h-2.5 text-pencil/40" />
                <span className="text-[9px] font-bold text-pencil/70 uppercase tracking-tight">
                  {displayName}
                </span>
              </div>
            ) : date ? (
              <div className="text-[9px] text-pencil/30 font-mono tracking-tighter uppercase">
                {new Date(date).toLocaleDateString()}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
