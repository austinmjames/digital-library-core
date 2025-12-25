"use client";

import { useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/auth-context";
import { useCommentaryData } from "./useCommentaryData";
import {
  Commentary,
  UserCommentary,
  CommentaryGroup,
  CommentaryTab, // Now correctly imported from central types
} from "@/lib/types/library";

/**
 * useCommentaryPanel
 * Master logic hook for the Commentary sidebar.
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
  const [myAuthors, setMyAuthors] = useState<string[]>(["Rashi", "רש״י"]);
  const [selectedCollection, setSelectedCollection] =
    useState<string>("My Commentary");
  const [isSaving, setIsSaving] = useState(false);

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

  const toggleAuthor = useCallback((author: string) => {
    setMyAuthors((p) =>
      p.includes(author) ? p.filter((x) => x !== author) : [...p, author]
    );
  }, []);

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
    },
    actions: {
      setActiveTab,
      setLanguageMode,
      setShowFootnotes,
      setSelectedCollection,
      handleCreateCollection,
      handleSaveNote,
      toggleAuthor,
      refetch,
    },
    supabase,
  };
}
