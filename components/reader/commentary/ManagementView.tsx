"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Check,
  Edit2,
  Trash2,
  Share2,
  Users,
  ChevronLeft,
  Loader2,
  ShieldAlert,
  UserMinus,
  Download,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CollectionMetadata,
  PermissionLevel,
  ImportAction,
} from "@/lib/types/library";

interface ManagementViewProps {
  collections: CollectionMetadata[];
  onBack: () => void;
  onRename: (oldName: string, newName: string) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
  onCreate: (name: string, isCollab: boolean) => Promise<void>;
  onImport: ImportAction;
  onShare: (
    name: string,
    email: string,
    permission: PermissionLevel
  ) => Promise<void>;
  onStopCollaborating: (name: string, email: string) => Promise<void>;
  onScrubAll?: () => Promise<void>;
}

// Explicit export to resolve "declares locally but not exported" error
export function ManagementView({
  collections,
  onBack,
  onRename,
  onDelete,
  onCreate,
  onImport,
  onShare,
  onStopCollaborating,
  onScrubAll,
}: ManagementViewProps) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [sharingName, setSharingName] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [newName, setNewName] = useState("");
  const [importCode, setImportCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "invalid"
  >("idle");

  const handleRename = async (oldName: string) => {
    setLoading(true);
    await onRename(oldName, renameValue);
    setEditingName(null);
    setLoading(false);
  };

  const handleImportSubmit = async () => {
    if (!importCode.trim()) return;
    setLoading(true);
    setImportStatus("idle");
    const success = await onImport(importCode);
    setImportStatus(success ? "success" : "invalid");
    if (success) {
      setImportCode("");
      setTimeout(() => setIsImporting(false), 1500);
    }
    setLoading(false);
    setTimeout(() => setImportStatus("idle"), 3000);
  };

  const handleShare = async () => {
    if (!sharingName || !shareEmail) return;
    setLoading(true);
    await onShare(sharingName, shareEmail, "collaborator");
    setShareEmail("");
    setLoading(false);
  };

  const handleCreateSubmit = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    await onCreate(newName, false);
    setNewName("");
    setIsCreating(false);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 hover:bg-pencil/5 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-pencil" />
          </button>
          <h4 className="font-serif font-bold text-lg text-ink">
            Manage My Books
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {onScrubAll && (
            <button
              onClick={onScrubAll}
              className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-all mr-2"
              title="Scrub All Content"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              setIsImporting(!isImporting);
              setIsCreating(false);
              setImportStatus("idle");
            }}
            className={cn(
              "p-1.5 rounded-full transition-all",
              isImporting
                ? "bg-gold text-white"
                : "bg-pencil/5 text-pencil hover:bg-pencil/10"
            )}
            title="Import Book"
          >
            <Download className="w-4 h-4" />
          </button>
          {!isCreating && (
            <button
              onClick={() => {
                setIsCreating(true);
                setIsImporting(false);
              }}
              className="p-1.5 rounded-full bg-gold text-white shadow-sm hover:bg-gold/90 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isCreating && (
        <div className="p-4 bg-pencil/5 rounded-xl space-y-4 border border-pencil/10 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-pencil uppercase tracking-widest">
              New Personal Book
            </span>
            <button
              onClick={() => setIsCreating(false)}
              className="text-pencil hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Book title..."
              className="flex-1 bg-white border border-pencil/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold/30"
              onKeyDown={(e) => e.key === "Enter" && handleCreateSubmit()}
            />
            <Button
              size="sm"
              onClick={handleCreateSubmit}
              disabled={!newName.trim() || loading}
              className="bg-gold text-white"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </div>
      )}

      {isImporting && (
        <div className="p-4 bg-paper rounded-xl space-y-4 border border-pencil/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-pencil uppercase tracking-widest">
              Import Shared Book
            </span>
            <button onClick={() => setIsImporting(false)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                autoFocus
                value={importCode}
                onChange={(e) => {
                  setImportCode(e.target.value);
                  setImportStatus("idle");
                }}
                placeholder="Paste share code..."
                className={cn(
                  "flex-1 bg-white border rounded-lg px-3 py-1.5 text-sm outline-none shadow-sm transition-all",
                  importStatus === "invalid"
                    ? "border-red-500/30 ring-1 ring-red-500/10"
                    : "border-pencil/10"
                )}
                onKeyDown={(e) => e.key === "Enter" && handleImportSubmit()}
              />
              <Button
                size="sm"
                onClick={handleImportSubmit}
                disabled={!importCode.trim() || loading}
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "Import"
                )}
              </Button>
            </div>
            {importStatus !== "idle" && (
              <p
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  importStatus === "success"
                    ? "text-emerald-600"
                    : "text-red-600"
                )}
              >
                {importStatus === "success"
                  ? "Success! Book added."
                  : "Error: Invalid code."}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {collections.map((coll) => (
          <div
            key={coll.id}
            className="p-4 bg-white border border-pencil/10 rounded-xl flex flex-col gap-3 group/book shadow-sm hover:border-gold/20 transition-all"
          >
            <div className="flex items-center justify-between">
              {editingName === coll.name ? (
                <div className="flex items-center gap-2 flex-1 mr-4">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="flex-1 bg-pencil/5 border-none rounded px-2 py-1 text-sm font-bold text-ink outline-none"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleRename(coll.name)
                    }
                  />
                  <button
                    onClick={() => handleRename(coll.name)}
                    className="text-gold"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingName(null)}
                    className="text-pencil"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink">
                        {coll.name}
                      </span>
                      {coll.collaborators && coll.collaborators.length > 0 && (
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter border border-emerald-100">
                          <Users className="w-2 h-2" /> Collaborative
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-pencil/50 uppercase tracking-tighter">
                      {coll.permission === "owner"
                        ? "Personal Commentary"
                        : "Viewer Access"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {coll.permission === "owner" && (
                      <>
                        <button
                          onClick={() => {
                            setSharingName(
                              sharingName === coll.name ? null : coll.name
                            );
                            setShareEmail("");
                          }}
                          className={cn(
                            "p-1.5 rounded transition-colors",
                            sharingName === coll.name
                              ? "bg-gold text-white"
                              : "hover:bg-gold/10 text-pencil hover:text-gold"
                          )}
                          title="Share & Manage Collaborators"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingName(coll.name);
                            setRenameValue(coll.name);
                          }}
                          className="p-1.5 hover:bg-pencil/5 rounded text-pencil hover:text-ink transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(coll.name)}
                          className="p-1.5 hover:bg-red-50 rounded text-pencil hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            {sharingName === coll.name && (
              <div className="border-t border-pencil/5 pt-3 mt-1 space-y-4 animate-in slide-in-from-top-1">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-bold text-pencil uppercase tracking-widest flex items-center gap-1.5">
                      <Settings2 className="w-2.5 h-2.5" /> Manage Collaborators
                    </span>
                  </div>
                  {coll.collaborators && coll.collaborators.length > 0 ? (
                    <div className="space-y-1.5">
                      {coll.collaborators.map((c) => (
                        <div
                          key={c.email}
                          className="flex items-center justify-between bg-pencil/5 p-2 rounded-lg group/user border border-pencil/5"
                        >
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-ink">
                              {c.email}
                            </span>
                            <span className="text-[8px] text-pencil uppercase font-bold tracking-tighter">
                              Collaborator
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              onStopCollaborating(coll.name, c.email)
                            }
                            className="h-7 text-[9px] text-red-500 hover:text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider"
                          >
                            <UserMinus className="w-3 h-3 mr-1" /> Stop
                            Collaborating
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-pencil/40 italic px-2">
                      No active collaborators for this book.
                    </p>
                  )}
                </div>
                <div className="space-y-3 pt-2">
                  <span className="text-[9px] font-bold text-pencil uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <Users className="w-2.5 h-2.5" /> Invite New Collaborator
                  </span>
                  <div className="flex gap-2">
                    <input
                      placeholder="Enter user email..."
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="flex-1 bg-pencil/5 border-none rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 ring-gold/20"
                      onKeyDown={(e) => e.key === "Enter" && handleShare()}
                    />
                    <Button
                      size="sm"
                      onClick={handleShare}
                      disabled={loading || !shareEmail}
                      className="h-8 text-[10px] bg-ink text-white min-w-[80px] uppercase font-bold tracking-widest"
                    >
                      {loading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Send Invite"
                      )}
                    </Button>
                  </div>
                </div>
                <div className="bg-gold/5 border border-gold/10 rounded-lg p-3 flex items-start gap-2">
                  <ShieldAlert className="w-3 h-3 text-gold shrink-0 mt-0.5" />
                  <p className="text-[9px] text-gold/80 leading-tight italic">
                    When you stop collaborating, the user will receive a
                    personal copy of this book containing only their own notes.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
