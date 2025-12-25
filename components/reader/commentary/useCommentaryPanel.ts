"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/auth-context";
import { useCommentaryData } from "./useCommentaryData";
import { fetchVerseText, deleteUserCommentary } from "@/app/actions/reader";
import {
  Commentary,
  UserCommentary,
  CommentaryGroup,
  CommentaryTab,
} from "@/lib/types/library";

/**
 * useCommentaryPanel
 * Logic engine for the Commentary Sidebar.
 * Manages fetching, grouping, saving, and deleting insights.
 */
export function useCommentaryPanel(verseRef: string | null) {
  const { user } = useAuth();
  const supabase = createClient();
  const { commentaries, userCommentaries, collections, loading, refetch } =
    useCommentaryData(verseRef, user);

  const [activeTab, setActiveTab] = useState<CommentaryTab>("MY_COMMENTARIES");
  const [languageMode, setLanguageMode] = useState<"en" | "he" | "bilingual">(
    "bilingual"
  );
  const [showFootnotes, setShowFootnotes] = useState(false);
  const [myAuthors] = useState<string[]>(["Rashi", "רש״י"]);
  const [selectedCollection, setSelectedCollection] =
    useState<string>("My Commentary");
  const [isSaving, setIsSaving] = useState(false);

  // Centralized Editing State for updates
  const [editingNoteId, setEditingNoteId] = useState<string | undefined>(
    undefined
  );
  const [editingContent, setEditingContent] = useState<string | undefined>(
    undefined
  );

  // Verse Source Context for the Editor passage preview
  const [verseContent, setVerseContent] = useState<{
    he: string;
    en: string;
  } | null>(null);

  useEffect(() => {
    if (verseRef) {
      fetchVerseText(verseRef).then(setVerseContent);
    } else {
      setVerseContent(null);
    }
  }, [verseRef]);

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
    async (content: string, collectionName: string, noteId?: string) => {
      if (!user || !verseRef) return;
      setIsSaving(true);

      try {
        const parts = verseRef.trim().split(" ");
        const coords = parts[parts.length - 1].split(":");
        const coll = collections.find((c) => c.name === collectionName);

        const payload = {
          user_id: user.id,
          user_email: user.email,
          verse_ref: verseRef,
          book_slug: parts.slice(0, -1).join("-").toLowerCase(),
          chapter_num: parseInt(coords[0]),
          verse_num: parseInt(coords[1]),
          content,
          collection_name: collectionName,
          collection_id: coll?.id !== "default" ? coll?.id : null,
        };

        const targetId = noteId || editingNoteId;

        if (targetId) {
          await supabase
            .from("user_commentaries")
            .update(payload)
            .eq("id", targetId);
        } else {
          await supabase.from("user_commentaries").insert(payload);
        }

        await refetch();
        setEditingNoteId(undefined);
        setEditingContent(undefined);
      } finally {
        setIsSaving(false);
      }
    },
    [user, verseRef, collections, supabase, refetch, editingNoteId]
  );

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      try {
        await deleteUserCommentary(noteId);
        await refetch();
      } catch (err) {
        console.error("Failed to delete note:", err);
      }
    },
    [refetch]
  );

  const memoizedActions = useMemo(
    () => ({
      setActiveTab,
      setLanguageMode,
      setShowFootnotes,
      setSelectedCollection,
      setEditingNoteId,
      setEditingContent,
      handleCreateCollection,
      handleSaveNote,
      handleDeleteNote,
      refetch,
    }),
    [handleCreateCollection, handleSaveNote, handleDeleteNote, refetch]
  );

  return {
    state: {
      activeTab,
      languageMode,
      showFootnotes,
      myAuthors,
      selectedCollection,
      isSaving,
      groupedData,
      collections,
      loading,
      user,
      verseContent,
      editingNoteId,
      editingContent,
    },
    actions: memoizedActions,
    supabase,
  };
}
