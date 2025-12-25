"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Library,
  BookOpen,
  Crown,
  User,
} from "lucide-react";
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
 * Updated:
 * - Supports 4 distinct groups: My Commentary, Classics, Modern Rabbis, Library.
 * - All groups expanded by default.
 * - Authors/Books collapsed by default.
 */
export function LibraryView({
  groupedData,
  // collections prop is kept for potential future use or passed down if needed,
  // currently it was unused in the provided snippet but might be needed for logic.
  // To avoid unused var error, we can remove it if truly unused or comment it out.
  // However, I'll keep it in props interface but not destructure it if unused,
  // or use it if logic requires checking collection metadata.
  // Actually, checking original code, it WAS used to find collMeta.
  // I will ensure it is used.
  collections,
  languageMode,
  showFootnotes,
  onAddClick,
  onEditNote,
  onDeleteNote,
}: LibraryViewProps) {
  // Initialize all groups as expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      "My Commentary": true,
      Classics: true,
      "Modern Rabbis": true,
      Library: true,
    }
  );

  // Commentators/Books start collapsed
  const [expandedCommentators, setExpandedCommentators] = useState<
    Record<string, boolean>
  >({});

  const groupConfig = [
    {
      id: "My Commentary",
      label: "My Commentary",
      icon: User,
      color: "text-emerald-600",
    },
    { id: "Classics", label: "Classics", icon: Crown, color: "text-gold" },
    {
      id: "Modern Rabbis",
      label: "Modern Rabbis",
      icon: BookOpen,
      color: "text-indigo-600",
    },
    { id: "Library", label: "Library", icon: Library, color: "text-pencil" },
  ] as const;

  return (
    <div className="space-y-8">
      {groupConfig.map((group) => {
        const groupName = group.id as CommentaryGroup;
        const authors = groupedData[groupName];

        // Safety check if authors is undefined (though type says it shouldn't be)
        if (!authors) return null;

        const authorKeys = Object.keys(authors);
        const isPersonalGroup = groupName === "My Commentary";

        // Show group if it has content OR if it's "My Commentary" (to allow adding notes)
        if (authorKeys.length === 0 && !isPersonalGroup) return null;

        const isGroupExpanded = expandedGroups[groupName];
        const Icon = group.icon;

        return (
          <div key={groupName} className="animate-in fade-in duration-500">
            {/* Group Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-pencil/10 select-none">
              <button
                onClick={() =>
                  setExpandedGroups((p) => ({
                    ...p,
                    [groupName]: !isGroupExpanded,
                  }))
                }
                className="flex items-center gap-2 text-xs font-black text-pencil/80 uppercase tracking-[0.2em] hover:text-ink transition-colors group outline-none"
              >
                <Icon className={cn("w-3.5 h-3.5", group.color)} />
                {group.label}
                {isGroupExpanded ? (
                  <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                ) : (
                  <ChevronRight className="w-3 h-3 ml-1 opacity-50" />
                )}
              </button>

              {isPersonalGroup && (
                <button
                  onClick={onAddClick}
                  className="w-7 h-7 rounded-full bg-pencil/5 hover:bg-ink hover:text-white flex items-center justify-center text-pencil transition-all active:scale-90"
                  title="Add Note"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {isGroupExpanded && (
              <div className="space-y-4">
                {isPersonalGroup && authorKeys.length === 0 && (
                  <div className="py-8 text-center opacity-40">
                    <p className="text-xs font-serif italic">
                      No personal notes on this verse yet.
                    </p>
                  </div>
                )}

                {authorKeys.map((author) => {
                  const isExpanded = expandedCommentators[author] || false;
                  // For personal notes, 'author' is actually the collection name
                  const itemCount = authors[author].length;

                  // Use 'collections' to find metadata about this author/collection if needed
                  // This fixes the 'unused variable' error by using it (even if logically optional for display)
                  // In a real app, we might check if this collection is collaborative here.
                  const collMeta = collections.find((c) => c.name === author);

                  return (
                    <div
                      key={author}
                      className="bg-white rounded-2xl border border-pencil/10 shadow-sm hover:border-accent/30 transition-all overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedCommentators((p) => ({
                            ...p,
                            [author]: !isExpanded,
                          }))
                        }
                        className={cn(
                          "w-full p-4 flex items-center justify-between bg-white transition-colors z-10 outline-none",
                          isExpanded && "bg-pencil/[0.02]"
                        )}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center transition-colors",
                              isExpanded
                                ? "bg-accent/10 text-accent"
                                : "bg-pencil/5 text-pencil/40"
                            )}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span className="font-serif font-bold text-base text-ink">
                            {author}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-pencil/40 bg-pencil/5 px-2 py-1 rounded-md">
                          {itemCount}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-pencil/5 space-y-4">
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
                              // Use collMeta to determine collaborative status if available
                              isCollaborative={!!collMeta?.is_collaborative}
                              authorName={author}
                              languageMode={languageMode}
                              showFootnotes={showFootnotes}
                              onEdit={
                                "content" in item
                                  ? () =>
                                      onEditNote(item.id, item.content, author)
                                  : undefined
                              }
                              onDelete={
                                "content" in item
                                  ? () => onDeleteNote(item.id)
                                  : undefined
                              }
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
