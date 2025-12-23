"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  X,
  Loader2,
  ChevronDown,
  ChevronRight,
  Check,
  MessageSquare,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  Commentary,
  UserCommentary,
  CollectionMetadata,
} from "@/lib/types/library";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";

// Feature-specific sub-components
import { NoteEditor } from "./commentary/NoteEditor";
import { CommentaryEntry } from "./commentary/CommentaryEntry";
import { ManagementView } from "./commentary/ManagementView";
import { MarketplaceView } from "./commentary/MarketplaceView";
import { DiscussionView } from "./commentary/DiscussionView";

interface CommentaryPanelProps {
  verseRef: string | null;
  onClose: () => void;
}

type CommentaryTab =
  | "MY_COMMENTARIES"
  | "MARKETPLACE"
  | "DISCUSSION"
  | "MANAGE_BOOKS";
type CommentaryGroup = "Personal" | "Classic" | "Community";
type LanguageMode = "en" | "he" | "bilingual";

export function CommentaryPanel({ verseRef, onClose }: CommentaryPanelProps) {
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [userCommentaries, setUserCommentaries] = useState<UserCommentary[]>(
    []
  );
  const [collections, setCollections] = useState<CollectionMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<CommentaryTab>("MY_COMMENTARIES");

  const [selectedCollection, setSelectedCollection] =
    useState<string>("My Commentary");
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      Personal: false,
      Classic: false,
      Community: false,
    }
  );
  const [expandedCommentators, setExpandedCommentators] = useState<
    Record<string, boolean>
  >({});
  const [languageMode, setLanguageMode] = useState<LanguageMode>("bilingual");
  const [showFootnotes, setShowFootnotes] = useState(false);
  const [myAuthors] = useState<string[]>(["Rashi", "רש״י"]);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data: { user: currentUser } }) => setUser(currentUser));
  }, [supabase.auth]);

  const fetchData = useCallback(async () => {
    if (!verseRef) return;
    setLoading(true);
    try {
      const [libRes, userRes, collRes] = await Promise.all([
        supabase
          .from("library_commentaries")
          .select("*")
          .eq("verse_ref", verseRef),
        user
          ? supabase
              .from("user_commentaries")
              .select("*")
              .eq("verse_ref", verseRef)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [] }),
        user
          ? supabase
              .from("user_commentaries")
              .select("collection_name, user_email, user_name")
              .eq("user_id", user.id)
          : Promise.resolve({ data: [] }),
      ]);

      setCommentaries((libRes.data as Commentary[]) || []);
      setUserCommentaries((userRes.data as unknown as UserCommentary[]) || []);

      const collectionData = (collRes.data || []) as Pick<
        UserCommentary,
        "collection_name"
      >[];
      const uniqueNames = Array.from(
        new Set(collectionData.map((n) => n.collection_name))
      );

      const mapped: CollectionMetadata[] = uniqueNames.map((name) => ({
        name,
        owner_id: user?.id || "",
        permission: "owner" as const,
        is_collaborative: name.includes("Collab"),
        share_code: name.includes("Shared") ? "TORAH-ABC-123" : undefined,
        collaborators: name.includes("Collab")
          ? [{ email: "study@partner.com", permission: "collaborator" }]
          : [],
      }));

      if (mapped.length === 0)
        mapped.push({
          name: "My Commentary",
          owner_id: user?.id || "",
          permission: "owner",
        });
      setCollections(mapped);
    } finally {
      setLoading(false);
    }
  }, [verseRef, user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCollection = (name: string, isCollab: boolean) => {
    if (!name.trim() || collections.some((c) => c.name === name)) return;
    setCollections((prev) => [
      ...prev,
      {
        name,
        owner_id: user?.id || "",
        permission: "owner",
        is_collaborative: isCollab,
        collaborators: [],
      },
    ]);
  };

  const handleImportCollection = async (code: string): Promise<boolean> => {
    if (!code.trim()) return false;
    const isValid = code.toUpperCase().startsWith("TORAH-");
    if (isValid) {
      setCollections((prev) => [
        ...prev,
        {
          name: `Imported (${code.toUpperCase().slice(0, 8)})`,
          owner_id: "other",
          permission: "viewer",
          is_collaborative: false,
        },
      ]);
      return true;
    }
    return false;
  };

  const handleRevokeAccess = async (bookName: string, email: string) => {
    if (
      !window.confirm(
        `Revoke access for ${email}? This will fork a copy for them.`
      )
    )
      return;
    setCollections((prev) =>
      prev.map((c) => {
        if (c.name === bookName) {
          return {
            ...c,
            collaborators: c.collaborators?.filter(
              (col) => col.email !== email
            ),
          };
        }
        return c;
      })
    );
  };

  const handleSaveNote = async (content: string, collection: string) => {
    if (!user || !verseRef) return;
    setIsSaving(true);
    try {
      const parts = verseRef.split(" ");
      const nums = parts[parts.length - 1].split(":");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      const { data, error } = await supabase
        .from("user_commentaries")
        .insert({
          user_id: user.id,
          user_email: user.email,
          user_name: profile?.full_name || "unnamed",
          verse_ref: verseRef,
          book_slug: parts[0].toLowerCase(),
          chapter_num: parseInt(nums[0]),
          verse_num: parseInt(nums[1]),
          content,
          collection_name: collection,
        })
        .select()
        .single();

      if (error) throw error;
      if (data)
        setUserCommentaries((prev) => [
          data as unknown as UserCommentary,
          ...prev,
        ]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenameCollection = async (oldName: string, newName: string) => {
    if (!user || !newName.trim() || newName === oldName) return;
    const { error } = await supabase
      .from("user_commentaries")
      .update({ collection_name: newName })
      .eq("user_id", user.id)
      .eq("collection_name", oldName);
    if (!error) {
      setCollections((prev) =>
        prev.map((c) => (c.name === oldName ? { ...c, name: newName } : c))
      );
      setUserCommentaries((prev) =>
        prev.map((n) =>
          n.collection_name === oldName ? { ...n, collection_name: newName } : n
        )
      );
    }
  };

  const handleDeleteCollection = async (name: string) => {
    if (!user || !window.confirm(`Delete "${name}" and all notes?`)) return;
    const { error } = await supabase
      .from("user_commentaries")
      .delete()
      .eq("user_id", user.id)
      .eq("collection_name", name);
    if (!error) {
      setCollections((prev) => prev.filter((c) => c.name !== name));
      setUserCommentaries((prev) =>
        prev.filter((n) => n.collection_name !== name)
      );
    }
  };

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

    if (activeTab === "MY_COMMENTARIES") {
      userCommentaries.forEach((note) => {
        if (!groups["Personal"][note.collection_name])
          groups["Personal"][note.collection_name] = [];
        groups["Personal"][note.collection_name].push(note);
      });
    }
    return groups;
  }, [commentaries, userCommentaries, activeTab, myAuthors]);

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
        <div className="flex flex-col bg-paper/95 backdrop-blur border-b border-pencil/10 shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex flex-col">
              <h3 className="font-serif font-bold text-xl text-ink">
                Commentary
              </h3>
              <p className="text-xs text-pencil font-mono mt-0.5">{verseRef}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFootnotes(!showFootnotes)}
                className={cn(
                  "w-8 h-8 rounded-full transition-colors flex items-center justify-center",
                  showFootnotes
                    ? "bg-gold text-white"
                    : "bg-pencil/5 text-pencil"
                )}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-3 py-1.5 rounded-full bg-pencil/5 text-xs font-bold text-pencil uppercase flex items-center gap-1.5">
                    {languageMode === "bilingual"
                      ? "Bi"
                      : languageMode === "en"
                      ? "En"
                      : "He"}{" "}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(["en", "he", "bilingual"] as const).map((m) => (
                    <DropdownMenuItem
                      key={m}
                      onClick={() => setLanguageMode(m)}
                      className="text-xs font-medium cursor-pointer uppercase uppercase-first"
                    >
                      {m}{" "}
                      {languageMode === m && (
                        <Check className="w-3 h-3 ml-auto" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-pencil/10 transition-colors"
              >
                <X className="w-5 h-5 text-pencil" />
              </button>
            </div>
          </div>

          <div className="flex px-6 pb-0 gap-6">
            {(["MY_COMMENTARIES", "MARKETPLACE", "DISCUSSION"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-3 text-sm font-bold border-b-2 transition-all",
                    activeTab === tab
                      ? "text-ink border-gold"
                      : "text-pencil border-transparent hover:text-ink/70"
                  )}
                >
                  {tab === "MY_COMMENTARIES"
                    ? "Library"
                    : tab === "DISCUSSION"
                    ? "Groups"
                    : "Explore"}
                </button>
              )
            )}
            {user && (
              <button
                onClick={() => setActiveTab("MANAGE_BOOKS")}
                className={cn(
                  "pb-3 text-sm font-bold border-b-2 transition-all ml-auto",
                  activeTab === "MANAGE_BOOKS"
                    ? "text-ink border-gold"
                    : "text-pencil border-transparent"
                )}
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {activeTab === "MANAGE_BOOKS" ? (
            <ManagementView
              collections={collections}
              onBack={() => setActiveTab("MY_COMMENTARIES")}
              onRename={handleRenameCollection}
              onDelete={handleDeleteCollection}
              onCreate={handleCreateCollection}
              onImport={handleImportCollection}
              onShare={async (n, e, p) =>
                alert(`Invite sent to ${e} for ${n} as ${p}`)
              }
              onRevokeAccess={handleRevokeAccess}
            />
          ) : activeTab === "MARKETPLACE" ? (
            <MarketplaceView
              loading={loading}
              groupedData={groupedData}
              collections={collections}
              onImport={handleImportCollection}
              languageMode={languageMode}
              showFootnotes={showFootnotes}
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
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-3 text-pencil/50">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Loading...
                  </p>
                </div>
              ) : (
                (["Personal", "Classic", "Community"] as const).map(
                  (groupName) => {
                    const authors = groupedData[groupName];
                    const authorKeys = Object.keys(authors);
                    if (authorKeys.length === 0) return null;
                    return (
                      <div
                        key={groupName}
                        className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                      >
                        <button
                          onClick={() =>
                            setExpandedGroups((p) => ({
                              ...p,
                              [groupName]: !p[groupName],
                            }))
                          }
                          className="w-full flex items-center justify-between text-sm font-bold text-pencil uppercase tracking-widest mb-3 pb-2 border-b border-pencil/10 hover:text-ink transition-colors"
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
                          {expandedGroups[groupName] ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>
                        {expandedGroups[groupName] && (
                          <div className="space-y-4">
                            {authorKeys.map((author) => {
                              const isExpanded = expandedCommentators[author];
                              const collMeta = collections.find(
                                (c) => c.name === author
                              );
                              return (
                                <div
                                  key={author}
                                  className="bg-white rounded-xl border border-pencil/10 shadow-sm hover:border-gold/30 transition-all overflow-hidden"
                                >
                                  <button
                                    onClick={() =>
                                      setExpandedCommentators((p) => ({
                                        ...p,
                                        [author]: !p[author],
                                      }))
                                    }
                                    className="w-full p-4 flex items-center justify-between hover:bg-pencil/[0.02]"
                                  >
                                    <div className="flex items-center gap-2 text-left">
                                      <ChevronRight
                                        className={cn(
                                          "w-3 h-3 text-pencil transition-transform",
                                          isExpanded && "rotate-90"
                                        )}
                                      />
                                      <div className="flex flex-col items-start">
                                        <div className="flex items-center gap-2 text-left font-bold text-sm text-ink/80">
                                          {author}
                                        </div>
                                        {collMeta?.permission !== "owner" && (
                                          <span className="text-[8px] text-pencil/50 font-bold uppercase tracking-tighter">
                                            Shared Book
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-pencil/50 bg-pencil/5 px-1.5 py-0.5 rounded-md ml-1">
                                        {authors[author].length}
                                      </span>
                                    </div>
                                  </button>
                                  {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-pencil/5 pt-3 divide-y divide-pencil/5">
                                      {authors[author].map((item) => (
                                        <CommentaryEntry
                                          key={item.id}
                                          id={item.id}
                                          textHe={
                                            "text_he" in item
                                              ? item.text_he
                                              : undefined
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
                                              ? (item as UserCommentary)
                                                  .user_name
                                              : "unnamed"
                                          }
                                          isCollaborative={
                                            !!collMeta?.is_collaborative ||
                                            collMeta?.permission !== "owner"
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
                  }
                )
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
