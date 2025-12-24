"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Commentary,
  UserCommentary,
  CollectionMetadata,
  CommentaryGroup,
} from "@/lib/types/library";
import { CommentaryEntry } from "./CommentaryEntry";

interface LibraryViewProps {
  groupedData: Record<
    CommentaryGroup,
    Record<string, (Commentary | UserCommentary)[]>
  >;
  collections: CollectionMetadata[];
  languageMode: "en" | "he" | "bilingual";
  showFootnotes: boolean;
}

export function LibraryView({
  groupedData,
  collections,
  languageMode,
  showFootnotes,
}: LibraryViewProps) {
  // Expansion state managed locally for the view
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      Personal: true, // Keep personal open by default for convenience
    }
  );
  const [expandedCommentators, setExpandedCommentators] = useState<
    Record<string, boolean>
  >({});

  return (
    <div className="space-y-6">
      {(["Personal", "Classic", "Community"] as const).map((groupName) => {
        const authors = groupedData[groupName];
        const authorKeys = Object.keys(authors);
        if (authorKeys.length === 0) return null;

        const isGroupExpanded = expandedGroups[groupName] || false;

        return (
          <div key={groupName} className="animate-in fade-in duration-500">
            <button
              onClick={() =>
                setExpandedGroups((p) => ({
                  ...p,
                  [groupName]: !isGroupExpanded,
                }))
              }
              className="w-full flex items-center justify-between text-sm font-bold text-pencil uppercase tracking-widest mb-3 pb-2 border-b border-pencil/10 hover:text-ink transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-1 h-4 rounded-full",
                    groupName === "Personal"
                      ? "bg-emerald-500"
                      : groupName === "Classic"
                      ? "bg-gold"
                      : "bg-indigo-500"
                  )}
                />
                {groupName}
              </div>
              {isGroupExpanded ? (
                <ChevronDown className="w-3 h-3 transition-transform group-hover:scale-110" />
              ) : (
                <ChevronRight className="w-3 h-3 transition-transform group-hover:scale-110" />
              )}
            </button>

            {isGroupExpanded && (
              <div className="space-y-6">
                {authorKeys.map((author) => {
                  const isExpanded = expandedCommentators[author] || false;
                  const collMeta = collections.find((c) => c.name === author);

                  return (
                    <div
                      key={author}
                      className="bg-white rounded-2xl border border-pencil/10 shadow-sm hover:border-gold/30 transition-all overflow-hidden"
                    >
                      {/* STICKY HEADER FOR THE BOOK */}
                      <button
                        onClick={() =>
                          setExpandedCommentators((p) => ({
                            ...p,
                            [author]: !isExpanded,
                          }))
                        }
                        className={cn(
                          "w-full p-4 flex items-center justify-between bg-white transition-colors z-10",
                          isExpanded &&
                            "sticky top-0 border-b border-pencil/5 shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-2 text-left">
                          <ChevronRight
                            className={cn(
                              "w-3.5 h-3.5 text-pencil transition-transform",
                              isExpanded && "rotate-90"
                            )}
                          />
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2 text-left font-bold text-sm text-ink/80">
                              {author}
                              {collMeta?.permission !== "owner" &&
                                collMeta?.permission && (
                                  <span className="text-[8px] bg-pencil/5 text-pencil/50 px-1 py-0.5 rounded font-bold uppercase tracking-tighter ml-1">
                                    Shared
                                  </span>
                                )}
                            </div>
                          </div>
                          <span className="text-[10px] text-pencil/40 bg-pencil/5 px-1.5 py-0.5 rounded-md ml-1 font-mono">
                            {authors[author].length}
                          </span>
                        </div>
                        {isExpanded && (
                          <span className="text-[9px] font-bold text-gold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            Collapse
                          </span>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-4 divide-y divide-pencil/5">
                          {authors[author].map((item) => (
                            <CommentaryEntry
                              key={item.id}
                              id={item.id}
                              textHe={
                                "text_he" in item ? item.text_he : undefined
                              }
                              textEn={
                                "text_en" in item
                                  ? item.text_en
                                  : (item as UserCommentary).content
                              }
                              isUserNote={"content" in item}
                              date={
                                "created_at" in item
                                  ? item.created_at
                                  : undefined
                              }
                              authorDisplayName={
                                "user_name" in item
                                  ? (item as UserCommentary).user_name
                                  : "unnamed"
                              }
                              isCollaborative={
                                !!collMeta?.is_collaborative ||
                                (collMeta?.permission !== "owner" &&
                                  !!collMeta?.permission)
                              }
                              authorName={author}
                              languageMode={languageMode}
                              showFootnotes={showFootnotes}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
