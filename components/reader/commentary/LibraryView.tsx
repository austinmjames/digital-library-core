"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Library,
  BookOpen,
  Crown,
  User,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Commentary,
  UserCommentary,
  CollectionMetadata,
  CommentaryGroup,
} from "@/lib/types/library";
import { CommentaryEntry } from "./CommentaryEntry";
import { AuthPrompt } from "@/components/auth/AuthPrompt";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface LibraryViewProps {
  user: SupabaseUser | null;
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
 * - Wrapped 'shouldExpandPersonal' in useCallback to resolve dependency warnings.
 * - Smart default expansion for "My Commentary" based on auth and note presence.
 * - Auto-collapses when switching to a verse without notes (for auth users).
 * - Auto-expands for unauth users to prompt log-in.
 */
export function LibraryView({
  user,
  groupedData,
  collections,
  languageMode,
  showFootnotes,
  onAddClick,
  onEditNote,
  onDeleteNote,
}: LibraryViewProps) {
  // Logic to determine if "My Commentary" should be expanded by default
  // Wrapped in useCallback to prevent unnecessary effect re-runs and fix dependency warning
  const shouldExpandPersonal = useCallback(() => {
    if (!user) return true; // Unauth users see the prompt expanded
    const personalNotes = groupedData["My Commentary"] || {};
    return Object.keys(personalNotes).length > 0; // Auth users only see it open if notes exist
  }, [user, groupedData]);

  // State for group expansion
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => ({
      "My Commentary": shouldExpandPersonal(),
      Classics: true,
      "Modern Rabbis": true,
      Library: true,
    })
  );

  // Commentators/Books start collapsed
  const [expandedCommentators, setExpandedCommentators] = useState<
    Record<string, boolean>
  >({});

  // Sync "My Commentary" expansion state when the data changes (e.g., clicking a new verse)
  // This ensures the "by default" logic applies per-verse.
  useEffect(() => {
    setExpandedGroups((prev) => ({
      ...prev,
      "My Commentary": shouldExpandPersonal(),
    }));
    // We also collapse all authors when the data changes to keep it tidy
    setExpandedCommentators({});
  }, [shouldExpandPersonal]);

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
        if (!authors) return null;

        const authorKeys = Object.keys(authors);
        const isPersonalGroup = groupName === "My Commentary";

        // Show group if it has content OR if it's the personal group (to show Empty state or Auth prompt)
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

              {/* Guarded Add Note Button in Header */}
              {isPersonalGroup && user && (
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
                {/* --- Personal Section States --- */}
                {isPersonalGroup &&
                  authorKeys.length === 0 &&
                  (user ? (
                    /* 1. Authenticated: Stylized "No Notes" prompt matching AuthPrompt design */
                    <div className="flex flex-col items-center justify-center text-center p-8 rounded-[2.5rem] bg-pencil/[0.02] border-2 border-dashed border-pencil/10 space-y-6 animate-in fade-in zoom-in-95 duration-700">
                      <div className="w-16 h-16 rounded-[2rem] bg-paper shadow-sm border border-pencil/5 flex items-center justify-center">
                        <StickyNote className="w-7 h-7 text-emerald-500/40" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-serif font-bold text-xl text-ink leading-tight">
                          No Notes
                        </h3>
                        <p className="text-sm text-pencil/60 max-w-[240px] mx-auto leading-relaxed italic">
                          You have not created any notes for this verse yet.
                        </p>
                      </div>

                      <button
                        onClick={onAddClick}
                        className="w-full h-12 bg-ink text-paper rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Note
                      </button>
                    </div>
                  ) : (
                    /* 2. Guest View: Auth Prompt instead of "No Notes" / Add Note Button */
                    <AuthPrompt
                      className="py-10 border-emerald-500/10 bg-emerald-500/[0.01]"
                      title="Your Personal Sanctuary"
                      description="Sign in to capture your own insights and start your commentary collection for this verse."
                      ctaLabel="Sign In to Start Writing"
                    />
                  ))}

                {authorKeys.map((author) => {
                  const isExpanded = expandedCommentators[author] || false;
                  const itemCount = authors[author].length;
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
