"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCommentaryPanel } from "./commentary/useCommentaryPanel";

// Sub-components
import { CommentaryHeader } from "./commentary/CommentaryHeader";
import { CommentaryTabs } from "./commentary/CommentaryTabs";
import { NoteEditor } from "./commentary/AddNoteView";
import { ManagementView } from "./commentary/ManagementView";
import { DiscussionView } from "./commentary/DiscussionView";
import { LibraryView } from "./commentary/LibraryView";
import { AuthPrompt } from "@/components/auth/AuthPrompt";
import { MessageSquarePlus } from "lucide-react";

interface CommentaryPanelProps {
  verseRef: string | null;
}

/**
 * components/reader/CommentaryPanel.tsx
 * Orchestrator for the right-side commentary system.
 * Updated: Removed the global auth gate so guests can view Classic/Library commentary.
 * Fixed: Ensured triggers and props align with LibraryView authentication rules.
 */
export function CommentaryPanel({ verseRef }: CommentaryPanelProps) {
  const { state, actions, supabase } = useCommentaryPanel(verseRef);
  const [viewMode, setViewMode] = useState<"BROWSE" | "ADD_NOTE">("BROWSE");

  const isAdding = viewMode === "ADD_NOTE";

  // Reset view mode and clear editing buffers whenever the selected verse changes
  useEffect(() => {
    setViewMode("BROWSE");
    actions.setEditingNoteId(undefined);
    actions.setEditingContent(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verseRef]);

  const handleSaveNote = async (content: string, collection: string) => {
    await actions.handleSaveNote(content, collection);
    setViewMode("BROWSE");
  };

  const handleTriggerEdit = useCallback(
    (id: string, content: string, collection: string) => {
      actions.setEditingNoteId(id);
      actions.setEditingContent(content);
      actions.setSelectedCollection(collection);
      setViewMode("ADD_NOTE");
    },
    [actions]
  );

  const handleTriggerDelete = useCallback(
    async (id: string) => {
      if (
        window.confirm(
          "This insight will be permanently removed from your library. It cannot be restored. Proceed?"
        )
      ) {
        await actions.handleDeleteNote(id);
      }
    },
    [actions]
  );

  return (
    <div className="flex flex-col h-full bg-paper animate-in fade-in duration-300 overflow-hidden relative">
      {!isAdding && (
        <CommentaryHeader
          title="Commentary"
          languageMode={state.languageMode}
          setLanguageMode={actions.setLanguageMode}
        />
      )}

      {isAdding ? (
        <NoteEditor
          collections={state.collections}
          selectedCollection={state.selectedCollection}
          onSelectCollection={actions.setSelectedCollection}
          onSave={handleSaveNote}
          onCancel={() => {
            setViewMode("BROWSE");
            actions.setEditingNoteId(undefined);
            actions.setEditingContent(undefined);
          }}
          isSaving={state.isSaving}
          verseRef={verseRef || ""}
          verseContent={state.verseContent}
          initialContent={state.editingContent}
          passageLanguage={state.languageMode}
        />
      ) : (
        <>
          <CommentaryTabs
            activeTab={state.activeTab}
            setActiveTab={actions.setActiveTab}
            hasUser={!!state.user}
          />

          <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-20">
            {/* Multi-view Router */}
            {state.activeTab === "MANAGE_BOOKS" ? (
              state.user ? (
                <ManagementView
                  collections={state.collections}
                  onBack={() => actions.setActiveTab("MY_COMMENTARIES")}
                  onRename={async (old, newN) => {
                    await supabase
                      .from("commentary_collections")
                      .update({ name: newN })
                      .eq("owner_id", state.user?.id)
                      .eq("name", old);
                    await actions.refetch();
                  }}
                  onDelete={async (name) => {
                    if (
                      window.confirm(`Delete "${name}" and all its contents?`)
                    ) {
                      await supabase
                        .from("commentary_collections")
                        .delete()
                        .eq("owner_id", state.user?.id)
                        .eq("name", name);
                      await actions.refetch();
                    }
                  }}
                  onCreate={actions.handleCreateCollection}
                  onImport={async (code: string) => {
                    const { data } = await supabase
                      .from("commentary_collections")
                      .select("id")
                      .eq("share_code", code.toUpperCase())
                      .single();

                    if (!data || !state.user?.email) return false;

                    await supabase.from("collection_collaborators").upsert({
                      collection_id: data.id,
                      user_email: state.user.email,
                      permission: "viewer",
                      is_in_library: true,
                    });
                    await actions.refetch();
                    return true;
                  }}
                  onShare={async (name, email, perm) => {
                    const coll = state.collections.find((c) => c.name === name);
                    if (coll) {
                      await supabase.from("collection_collaborators").upsert({
                        collection_id: coll.id,
                        user_email: email,
                        permission: perm,
                        is_in_library: true,
                      });
                      await actions.refetch();
                    }
                  }}
                  onStopCollaborating={async (collectionId: string) => {
                    if (
                      window.confirm(
                        "Stop collaborating on this book? It will be removed from your library."
                      )
                    ) {
                      await supabase
                        .from("collection_collaborators")
                        .delete()
                        .eq("collection_id", collectionId)
                        .eq("user_email", state.user?.email);
                      await actions.refetch();
                    }
                  }}
                />
              ) : (
                <div className="py-12">
                  <AuthPrompt
                    title="Manage Your Library"
                    description="Sign in to establish personal books, import shared collections, and manage your authored wisdom."
                  />
                </div>
              )
            ) : state.activeTab === "DISCUSSION" ? (
              state.user ? (
                <DiscussionView verseRef={verseRef || ""} user={state.user} />
              ) : (
                <div className="py-12">
                  <AuthPrompt
                    title="Join the Global Seder"
                    description="Authenticate to participate in real-time verse discussions and collaborate with scholars around the world."
                  />
                </div>
              )
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {!verseRef ? (
                  <div className="py-24 flex flex-col items-center justify-center text-center opacity-20 italic space-y-4">
                    <div className="w-16 h-16 rounded-[2rem] bg-pencil/5 flex items-center justify-center border border-pencil/10">
                      <MessageSquarePlus className="w-8 h-8 text-pencil" />
                    </div>
                    <p className="text-sm font-sans max-w-[200px]">
                      Select a verse to view or add commentary.
                    </p>
                  </div>
                ) : (
                  <LibraryView
                    user={state.user}
                    groupedData={state.groupedData}
                    collections={state.collections}
                    languageMode={state.languageMode}
                    showFootnotes={state.showFootnotes}
                    onAddClick={() => setViewMode("ADD_NOTE")}
                    onEditNote={handleTriggerEdit}
                    onDeleteNote={handleTriggerDelete}
                  />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
