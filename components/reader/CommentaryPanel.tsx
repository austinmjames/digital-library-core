"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/auth-context";
import { useCommentaryData } from "./commentary/useCommentaryData";
import { CommentaryHeader, CommentaryTab } from "./commentary/CommentaryHeader";
import { CommentaryTabs } from "./commentary/CommentaryTabs";
import { NoteEditor } from "./commentary/NoteEditor";
import { ManagementView } from "./commentary/ManagementView";
import { MarketplaceView } from "./commentary/MarketplaceView";
import { DiscussionView } from "./commentary/DiscussionView";
import { LibraryView } from "./commentary/LibraryView";
import {
  Commentary,
  UserCommentary,
  CommentaryGroup,
} from "@/lib/types/library";

/**
 * components/reader/CommentaryPanel.tsx
 * Orchestrator for the verse-specific detail view.
 * Refactored to match the premium architecture of TodayMenu.
 */
export function CommentaryPanel({
  verseRef,
  onClose,
}: {
  verseRef: string | null;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const supabase = createClient();
  const { commentaries, userCommentaries, collections, loading, refetch } =
    useCommentaryData(verseRef, user);

  // UI State
  const [activeTab, setActiveTab] = useState<CommentaryTab>("MY_COMMENTARIES");
  const [languageMode, setLanguageMode] = useState<"en" | "he" | "bilingual">(
    "bilingual"
  );
  const [showFootnotes, setShowFootnotes] = useState(false);
  const [myAuthors, setMyAuthors] = useState<string[]>(["Rashi", "רש״י"]);
  const [selectedCollection, setSelectedCollection] =
    useState<string>("My Commentary");
  const [isSaving, setIsSaving] = useState(false);

  const isOpen = !!verseRef;

  // Grouping logic memoized for performance
  const groupedData = useMemo(() => {
    const groups: Record<
      CommentaryGroup,
      Record<string, (Commentary | UserCommentary)[]>
    > = {
      Personal: {},
      Classic: {},
      Community: {},
    };

    commentaries.forEach((comm) => {
      const author = comm.author_en || comm.author_he || "Unknown";
      if (activeTab === "MY_COMMENTARIES" && !myAuthors.includes(author))
        return;
      const group = comm.source_ref?.includes("Community")
        ? "Community"
        : "Classic";
      if (!groups[group][author]) groups[group][author] = [];
      groups[group][author].push(comm);
    });

    userCommentaries.forEach((note) => {
      const collMeta = collections.find((c) => c.name === note.collection_name);
      if (
        activeTab === "MY_COMMENTARIES" &&
        collMeta &&
        !collMeta.is_in_library
      )
        return;
      if (!groups["Personal"][note.collection_name])
        groups["Personal"][note.collection_name] = [];
      groups["Personal"][note.collection_name].push(note);
    });

    return groups;
  }, [commentaries, userCommentaries, activeTab, myAuthors, collections]);

  // --- Collection Actions (Delegated from sub-views) ---

  const handleCreateCollection = useCallback(
    async (name: string, isCollab: boolean) => {
      if (!user) return;
      const shareCode = `TORAH-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;
      await supabase.from("commentary_collections").insert({
        name,
        owner_id: user.id,
        is_collaborative: isCollab,
        share_code: shareCode,
      });
      await refetch();
    },
    [user, supabase, refetch]
  );

  const handleSaveNote = useCallback(
    async (content: string, collectionName: string) => {
      if (!user || !verseRef) return;
      setIsSaving(true);
      try {
        const parts = verseRef.split(" ");
        const nums = parts[parts.length - 1].split(":");
        const coll = collections.find((c) => c.name === collectionName);

        await supabase.from("user_commentaries").insert({
          user_id: user.id,
          user_email: user.email,
          verse_ref: verseRef,
          book_slug: parts[0].toLowerCase(),
          chapter_num: parseInt(nums[0]),
          verse_num: parseInt(nums[1]),
          content,
          collection_name: collectionName,
          collection_id: coll?.id !== "default" ? coll?.id : null,
        });
        await refetch();
      } finally {
        setIsSaving(false);
      }
    },
    [user, verseRef, collections, supabase, refetch]
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/10 backdrop-blur-sm z-[45] transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-[400px] lg:w-[450px] bg-paper border-l border-pencil/10 z-50 transition-transform duration-500 ease-spring shadow-2xl flex flex-col overflow-hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* iOS Header - Settings and Metadata only */}
        <CommentaryHeader
          verseRef={verseRef || ""}
          languageMode={languageMode}
          setLanguageMode={setLanguageMode}
          showFootnotes={showFootnotes}
          setShowFootnotes={setShowFootnotes}
          onClose={onClose}
        />

        {/* Premium Segmented Tabs - Unified Navigation */}
        <CommentaryTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasUser={!!user}
        />

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
          {activeTab === "MANAGE_BOOKS" ? (
            <ManagementView
              collections={collections}
              onBack={() => setActiveTab("MY_COMMENTARIES")}
              onRename={async (old, newN) => {
                await supabase
                  .from("commentary_collections")
                  .update({ name: newN })
                  .eq("owner_id", user?.id)
                  .eq("name", old);
                await refetch();
              }}
              onDelete={async (name) => {
                if (confirm(`Delete "${name}"?`)) {
                  await supabase
                    .from("commentary_collections")
                    .delete()
                    .eq("owner_id", user?.id)
                    .eq("name", name);
                  await refetch();
                }
              }}
              onCreate={handleCreateCollection}
              onImport={async (code) => {
                const { data } = await supabase
                  .from("commentary_collections")
                  .select("id")
                  .eq("share_code", code.toUpperCase())
                  .single();
                if (!data || !user?.email) return false;
                await supabase.from("collection_collaborators").upsert({
                  collection_id: data.id,
                  user_email: user.email,
                  permission: "viewer",
                  is_in_library: true,
                });
                await refetch();
                return true;
              }}
              onShare={async (name, email, perm) => {
                const coll = collections.find((c) => c.name === name);
                if (coll) {
                  await supabase.from("collection_collaborators").upsert({
                    collection_id: coll.id,
                    user_email: email,
                    permission: perm,
                    is_in_library: true,
                  });
                  await refetch();
                }
              }}
              onStopCollaborating={async () => {}}
            />
          ) : activeTab === "MARKETPLACE" ? (
            <MarketplaceView
              loading={loading}
              groupedData={groupedData}
              collections={collections}
              onImport={async () => false}
              myAuthors={myAuthors}
              onToggleAuthor={(a) =>
                setMyAuthors((p) =>
                  p.includes(a) ? p.filter((x) => x !== a) : [...p, a]
                )
              }
            />
          ) : activeTab === "DISCUSSION" ? (
            <DiscussionView verseRef={verseRef || ""} user={user} />
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {user && (
                <NoteEditor
                  collections={collections}
                  selectedCollection={selectedCollection}
                  onSelectCollection={setSelectedCollection}
                  onSave={handleSaveNote}
                  isSaving={isSaving}
                />
              )}
              <LibraryView
                groupedData={groupedData}
                collections={collections}
                languageMode={languageMode}
                showFootnotes={showFootnotes}
              />
            </div>
          )}
        </div>

        {/* Sticky Status Footer */}
        <footer className="absolute bottom-0 left-0 right-0 p-6 border-t border-pencil/5 bg-paper/90 backdrop-blur-xl z-20 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-pencil/50 uppercase font-black tracking-widest">
              Verse Context
            </p>
            <p className="text-[9px] text-gold font-bold uppercase tracking-tighter italic">
              Sovereignty & Commentary
            </p>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-pencil/30 uppercase tracking-widest">
              Synced Layers
            </span>
          </div>
        </footer>
      </aside>
    </>
  );
}
