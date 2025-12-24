"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/auth-context";
import { useCommentaryData } from "./commentary/useCommentaryData";
import { CommentaryHeader, CommentaryTab } from "./commentary/CommentaryHeader";
import { NoteEditor } from "./commentary/NoteEditor";
import { ManagementView } from "./commentary/ManagementView";
import { MarketplaceView } from "./commentary/MarketplaceView";
import { DiscussionView } from "./commentary/DiscussionView";
import { LibraryView } from "./commentary/LibraryView";
import {
  Commentary,
  UserCommentary,
  CommentaryGroup,
  PermissionLevel,
} from "@/lib/types/library";

/**
 * CommentaryPanel
 * Orchestrator for the verse-specific detail view.
 * All management functions are now functional and linked to Supabase.
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

  // Grouping logic for the Library View
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

  // --- Collection Management Functions ---

  const handleCreateCollection = async (name: string, isCollab: boolean) => {
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
  };

  const handleRenameCollection = async (oldName: string, newName: string) => {
    if (!user) return;
    await supabase
      .from("commentary_collections")
      .update({ name: newName })
      .eq("owner_id", user.id)
      .eq("name", oldName);
    await refetch();
  };

  const handleDeleteCollection = async (name: string) => {
    if (!user || !confirm(`Delete "${name}" and all associated notes?`)) return;
    await supabase
      .from("commentary_collections")
      .delete()
      .eq("owner_id", user.id)
      .eq("name", name);
    await refetch();
  };

  const handleShare = async (
    name: string,
    email: string,
    permission: PermissionLevel
  ) => {
    const coll = collections.find((c) => c.name === name);
    if (!coll) return;
    await supabase.from("collection_collaborators").upsert({
      collection_id: coll.id,
      user_email: email,
      permission,
      is_in_library: true,
    });
    await refetch();
  };

  const handleImport = async (code: string) => {
    if (!user?.email) return false;
    const { data: coll } = await supabase
      .from("commentary_collections")
      .select("id")
      .eq("share_code", code.toUpperCase())
      .single();
    if (!coll) return false;
    const { error } = await supabase.from("collection_collaborators").upsert({
      collection_id: coll.id,
      user_email: user.email,
      permission: "viewer",
      is_in_library: true,
    });
    if (!error) {
      await refetch();
      return true;
    }
    return false;
  };

  const handleSaveNote = async (content: string, collectionName: string) => {
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
  };

  const isOpen = !!verseRef;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 bg-paper border-l border-pencil/10 flex flex-col transition-transform duration-300 shadow-2xl w-full md:w-[400px] lg:w-[450px]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <CommentaryHeader
          verseRef={verseRef || ""}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          languageMode={languageMode}
          setLanguageMode={setLanguageMode}
          showFootnotes={showFootnotes}
          setShowFootnotes={setShowFootnotes}
          onClose={onClose}
          hasUser={!!user}
        />
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar relative">
          {activeTab === "MANAGE_BOOKS" ? (
            <ManagementView
              collections={collections}
              onBack={() => setActiveTab("MY_COMMENTARIES")}
              onRename={handleRenameCollection}
              onDelete={handleDeleteCollection}
              onCreate={handleCreateCollection}
              onImport={handleImport}
              onShare={handleShare}
              onStopCollaborating={async () => {}}
            />
          ) : activeTab === "MARKETPLACE" ? (
            <MarketplaceView
              loading={loading}
              groupedData={groupedData}
              collections={collections}
              onImport={handleImport}
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
            <>
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
