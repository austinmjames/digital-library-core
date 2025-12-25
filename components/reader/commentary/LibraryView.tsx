"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
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
  onAddClick: () => void;
  onEditNote: (id: string, content: string, collection: string) => void;
  onDeleteNote: (id: string) => void;
}

/**
 * components/reader/commentary/LibraryView.tsx
 * Updated: Added note management actions (edit/delete) and passes them to entries.
 */
export function LibraryView({
  groupedData,
  collections,
  languageMode,
  showFootnotes,
  onAddClick,
  onEditNote,
  onDeleteNote,
}: LibraryViewProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    { Personal: true }
  );
  const [expandedCommentators, setExpandedCommentators] = useState<
    Record<string, boolean>
  >({});

  const personalAuthors = groupedData["Personal"];
  const hasPersonalContent = Object.keys(personalAuthors).length > 0;

  return (
    <div className="space-y-8">
      {(["Personal", "Classic", "Community"] as const).map((groupName) => {
        const authors = groupedData[groupName];
        const authorKeys = Object.keys(authors);
        const isPersonalGroup = groupName === "Personal";

        if (authorKeys.length === 0 && !isPersonalGroup) return null;

        const isGroupExpanded = expandedGroups[groupName] || false;

        return (
          <div key={groupName} className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-pencil/10">
              <button
                onClick={() =>
                  setExpandedGroups((p) => ({
                    ...p,
                    [groupName]: !isGroupExpanded,
                  }))
                }
                className="flex items-center gap-2 text-sm font-bold text-pencil uppercase tracking-widest hover:text-ink transition-colors group"
              >
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
                {isGroupExpanded ? (
                  <ChevronDown className="w-3 h-3 ml-1" />
                ) : (
                  <ChevronRight className="w-3 h-3 ml-1" />
                )}
              </button>

              {isPersonalGroup && hasPersonalContent && (
                <button
                  onClick={onAddClick}
                  className="w-8 h-8 rounded-full bg-slate-100 border border-black/[0.03] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.07)] flex items-center justify-center text-pencil hover:text-ink active:scale-90 transition-all"
                  title="Add Insight"
                >
                  <Plus className="w-4 h-4 stroke-[2.5px]" />
                </button>
              )}
            </div>

            {isGroupExpanded && (
              <div className="space-y-6">
                {isPersonalGroup && !hasPersonalContent && (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in zoom-in-95">
                    <p className="text-sm text-pencil font-medium max-w-[200px]">
                      Share your own wisdom on this verse to begin your library.
                    </p>
                    <button
                      onClick={onAddClick}
                      className="w-12 h-12 rounded-full bg-slate-100 border border-black/[0.03] shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] flex items-center justify-center text-pencil hover:text-ink active:scale-90 transition-all"
                    >
                      <Plus className="w-6 h-6 stroke-[2.5px]" />
                    </button>
                  </div>
                )}

                {authorKeys.map((author) => {
                  const isExpanded = expandedCommentators[author] || false;
                  const collMeta = collections.find((c) => c.name === author);

                  return (
                    <div
                      key={author}
                      className="bg-white rounded-2xl border border-pencil/10 shadow-sm hover:border-gold/30 transition-all overflow-hidden"
                    >
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
                          <div className="font-bold text-sm text-ink/80">
                            {author}
                          </div>
                          <span className="text-[10px] text-pencil/40 bg-pencil/5 px-1.5 py-0.5 rounded-md ml-1 font-mono">
                            {authors[author].length}
                          </span>
                        </div>
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
                              onEdit={() =>
                                onEditNote(
                                  item.id,
                                  "content" in item
                                    ? item.content
                                    : item.text_en || "",
                                  author
                                )
                              }
                              onDelete={() => onDeleteNote(item.id)}
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
