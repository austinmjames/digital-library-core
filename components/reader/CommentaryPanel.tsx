"use client";

import React from "react";
import { cn } from "@/lib/utils";

// Logic Hook
import { useCommentaryPanel } from "./commentary/useCommentaryPanel";

// Sub-components
import { CommentaryHeader } from "./commentary/CommentaryHeader";
import { CommentaryTabs } from "./commentary/CommentaryTabs";
import { NoteEditor } from "./commentary/NoteEditor";
import { ManagementView } from "./commentary/ManagementView";
import { DiscussionView } from "./commentary/DiscussionView";
import { LibraryView } from "./commentary/LibraryView";
import { CommentaryFooter } from "./commentary/CommentaryFooter";

interface CommentaryPanelProps {
  verseRef: string | null;
  onClose: () => void;
}

/**
 * components/reader/CommentaryPanel.tsx
 * Updated: backdrop adjusted to md:hidden and blur removed for better desktop usability.
 */
export function CommentaryPanel({ verseRef, onClose }: CommentaryPanelProps) {
  const { state, actions, supabase } = useCommentaryPanel(verseRef);
  const isOpen = !!verseRef;

  return (
    <>
      {/* Responsive Backdrop: Mobile-only, no blur */}
      <div
        className={cn(
          "fixed inset-0 bg-black/5 z-[45] transition-opacity md:hidden",
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
        <CommentaryHeader
          verseRef={verseRef || ""}
          languageMode={state.languageMode}
          setLanguageMode={actions.setLanguageMode}
          showFootnotes={state.showFootnotes}
          setShowFootnotes={actions.setShowFootnotes}
          onClose={onClose}
        />

        <CommentaryTabs
          activeTab={state.activeTab}
          setActiveTab={actions.setActiveTab}
          hasUser={!!state.user}
        />

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
          {state.activeTab === "MANAGE_BOOKS" ? (
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
                if (confirm(`Delete "${name}"?`)) {
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
              onStopCollaborating={async () => {}}
            />
          ) : state.activeTab === "DISCUSSION" ? (
            <DiscussionView verseRef={verseRef || ""} user={state.user} />
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {state.user && (
                <NoteEditor
                  collections={state.collections}
                  selectedCollection={state.selectedCollection}
                  onSelectCollection={actions.setSelectedCollection}
                  onSave={actions.handleSaveNote}
                  isSaving={state.isSaving}
                />
              )}
              <LibraryView
                groupedData={state.groupedData}
                collections={state.collections}
                languageMode={state.languageMode}
                showFootnotes={state.showFootnotes}
              />
            </div>
          )}
        </div>

        <CommentaryFooter />
      </aside>
    </>
  );
}
