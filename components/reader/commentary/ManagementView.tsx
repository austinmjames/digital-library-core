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
  AlertCircle,
  ShieldAlert,
  UserMinus,
  Download,
  Key,
  Copy,
  CheckCircle2,
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
  onCreate: (name: string, isCollaborative: boolean) => void;
  onImport: ImportAction; // Updated to use ImportAction from Canvas
  onShare: (
    name: string,
    email: string,
    permission: PermissionLevel
  ) => Promise<void>;
  onRevokeAccess: (name: string, email: string) => Promise<void>;
}

export function ManagementView({
  collections,
  onBack,
  onRename,
  onDelete,
  onCreate,
  onImport,
  onShare,
  onRevokeAccess,
}: ManagementViewProps) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [sharingName, setSharingName] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePerm, setSharePerm] = useState<"collaborator" | "viewer">(
    "viewer"
  );

  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [newName, setNewName] = useState("");
  const [importCode, setImportCode] = useState("");
  const [newIsCollab, setNewIsCollab] = useState(false);

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

    // Parent handleImportCollection returns boolean
    const success = await onImport(importCode);

    if (success) {
      setImportStatus("success");
      setImportCode("");
    } else {
      setImportStatus("invalid");
    }

    setLoading(false);
    setTimeout(() => setImportStatus("idle"), 3000);
  };

  const handleShare = async () => {
    if (!sharingName || !shareEmail) return;
    setLoading(true);
    await onShare(sharingName, shareEmail, sharePerm);
    setShareEmail("");
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
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
          <button
            onClick={() => {
              setIsImporting(true);
              setIsCreating(false);
            }}
            className="p-1.5 rounded-full bg-pencil/5 text-pencil hover:bg-pencil/10 transition-all"
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
        <div className="p-4 bg-pencil/5 rounded-xl space-y-4 animate-in slide-in-from-top-2 border border-pencil/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-pencil uppercase tracking-widest">
              New Collection
            </span>
            <button
              onClick={() => setIsCreating(false)}
              className="text-pencil hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter book title..."
              className="w-full bg-white border border-pencil/10 rounded-lg px-3 py-2 text-sm outline-none shadow-sm focus:border-gold/30"
            />

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => setNewIsCollab(!newIsCollab)}
                  className={cn(
                    "w-8 h-4 rounded-full relative transition-colors duration-200",
                    newIsCollab ? "bg-gold" : "bg-pencil/20"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200",
                      newIsCollab ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </div>
                <span className="text-xs font-bold text-ink/70">
                  Enable Collaboration
                </span>
              </label>

              {newIsCollab && (
                <div className="bg-gold/5 border border-gold/10 rounded-lg p-2.5 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                  <p className="text-[10px] text-gold/80 leading-relaxed font-medium">
                    Collaboration will allow users you invite to edit and add
                    notes to your commentary.
                  </p>
                </div>
              )}
            </div>

            <Button
              size="sm"
              onClick={() => onCreate(newName, newIsCollab)}
              className="w-full bg-gold text-white"
              disabled={!newName.trim()}
            >
              Create Collection
            </Button>
          </div>
        </div>
      )}

      {isImporting && (
        <div className="p-4 bg-paper rounded-xl space-y-4 animate-in slide-in-from-top-2 border border-pencil/10">
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
                placeholder="Paste read-only code..."
                className={cn(
                  "flex-1 bg-white border rounded-lg px-3 py-1.5 text-sm outline-none shadow-sm transition-all",
                  importStatus === "invalid"
                    ? "border-red-500/30 ring-1 ring-red-500/10"
                    : "border-pencil/10"
                )}
              />
              <Button
                size="sm"
                onClick={handleImportSubmit}
                disabled={!importCode || loading}
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
                  "text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                  importStatus === "success"
                    ? "text-emerald-600"
                    : "text-red-600"
                )}
              >
                {importStatus === "success" ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Success! Book added.
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" /> Error: Invalid code.
                  </>
                )}
              </p>
            )}

            <p className="text-[9px] text-pencil/60">
              Enter the 12-digit code provided by the commentary owner.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {collections.map((coll) => (
          <div
            key={coll.name}
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
                      {coll.is_collaborative && (
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter border border-emerald-100">
                          <Users className="w-2 h-2" />
                          Collab
                        </div>
                      )}
                      {coll.permission !== "owner" && (
                        <span className="text-[9px] bg-pencil/10 text-pencil px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                          Shared
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-pencil/50 uppercase tracking-tighter">
                      {coll.permission === "owner"
                        ? coll.is_collaborative
                          ? "Collaborative Book"
                          : "Personal Book"
                        : `View Only - Shared`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 md:opacity-0 md:group-hover/book:opacity-100 transition-opacity">
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
                          title="Share & Manage Access"
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
                <div className="bg-pencil/5 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-pencil uppercase flex items-center gap-1.5">
                      <Key className="w-2.5 h-2.5" /> Read-Only Code
                    </span>
                    <button
                      className="text-[9px] font-bold text-gold flex items-center gap-1 hover:underline"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          coll.share_code || "TORAH-ABC-123"
                        );
                      }}
                    >
                      <Copy className="w-2.5 h-2.5" /> Copy Code
                    </button>
                  </div>
                  <div className="font-mono text-xs font-bold text-ink bg-white/50 border border-pencil/5 rounded p-1.5 text-center tracking-wider">
                    {coll.share_code || "TORAH-CODE-GEN"}
                  </div>
                </div>

                {coll.collaborators && coll.collaborators.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-pencil uppercase tracking-widest">
                      Active Access
                    </span>
                    <div className="space-y-1.5">
                      {coll.collaborators.map((c) => (
                        <div
                          key={c.email}
                          className="flex items-center justify-between bg-pencil/5 p-2 rounded-lg group/user"
                        >
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-ink">
                              {c.email}
                            </span>
                            <span className="text-[8px] text-pencil uppercase font-medium">
                              {c.permission}
                            </span>
                          </div>
                          <button
                            onClick={() => onRevokeAccess(coll.name, c.email)}
                            className="p-1 text-pencil hover:text-red-500 hover:bg-red-50 rounded transition-all"
                            title="Revoke Access (Forks book for user)"
                          >
                            <UserMinus className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <span className="text-[9px] font-bold text-pencil uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-2.5 h-2.5" /> Invite by Email
                  </span>
                  <div className="flex flex-col gap-3">
                    <input
                      placeholder="User email address..."
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="bg-pencil/5 border-none rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 ring-gold/20"
                    />

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer group w-fit">
                        <div
                          onClick={() =>
                            setSharePerm(
                              sharePerm === "collaborator"
                                ? "viewer"
                                : "collaborator"
                            )
                          }
                          className={cn(
                            "w-8 h-4 rounded-full relative transition-colors duration-200",
                            sharePerm === "collaborator"
                              ? "bg-gold"
                              : "bg-pencil/20"
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200",
                              sharePerm === "collaborator"
                                ? "translate-x-4"
                                : "translate-x-0"
                            )}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-ink/70">
                          Enable Collaboration
                        </span>
                      </label>

                      {sharePerm === "collaborator" && (
                        <div className="bg-gold/5 border border-gold/10 rounded-lg p-2.5 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                          <AlertCircle className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                          <p className="text-[10px] text-gold/80 leading-relaxed font-medium">
                            Invited users will have the ability to edit and
                            delete comments made in this commentary.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end">
                      <Button
                        size="sm"
                        onClick={handleShare}
                        disabled={loading || !shareEmail}
                        className="h-8 text-[10px] bg-ink text-white min-w-[80px]"
                      >
                        {loading ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-2" />
                        ) : null}
                        Send Invite
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-pencil/[0.02] border border-dashed border-pencil/10 rounded-lg p-2 flex items-start gap-2">
                  <ShieldAlert className="w-3 h-3 text-pencil/40 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-pencil/60 leading-tight">
                    Revoking access will create a personal copy (fork) for the
                    member so they keep their existing notes.
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
