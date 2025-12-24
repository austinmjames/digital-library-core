"use client";

import { useState } from "react";
import {
  Users,
  Share2,
  Edit,
  Trash2,
  Check,
  X,
  Settings2,
  UserMinus,
  Shield,
  Loader2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CollectionMetadata, PermissionLevel } from "@/lib/types/library";

interface CollectionItemProps {
  collection: CollectionMetadata;
  onRename: (old: string, newN: string) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
  onShare: (
    name: string,
    email: string,
    perm: PermissionLevel
  ) => Promise<void>;
  onStopCollaborating: (name: string, email: string) => Promise<void>;
}

/**
 * components/reader/commentary/management/CollectionItem.tsx
 * Isolated administrative card for a commentary collection/book.
 * Fixed: Updated icons to standard Lucide set (Edit, Shield).
 */
export function CollectionItem({
  collection,
  onRename,
  onDelete,
  onShare,
  onStopCollaborating,
}: CollectionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [renameValue, setRenameValue] = useState(collection.name);
  const [isSharing, setIsSharing] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRenameSubmit = async () => {
    setLoading(true);
    await onRename(collection.name, renameValue);
    setIsEditing(false);
    setLoading(false);
  };

  return (
    <div className="p-5 bg-white border border-pencil/10 rounded-3xl flex flex-col gap-4 shadow-sm hover:border-gold/20 transition-all group/book">
      <div className="flex items-center justify-between">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1 mr-4">
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="flex-1 bg-pencil/5 border-none rounded-xl px-3 py-1.5 text-sm font-bold text-ink outline-none shadow-inner"
              onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
            />
            <button
              onClick={handleRenameSubmit}
              className="text-gold p-1 active:scale-75 transition-transform"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-pencil p-1 active:scale-75 transition-transform"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-ink">
                  {collection.name}
                </span>
                {collection.is_collaborative && (
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                    <Users className="w-2.5 h-2.5" /> Collaborative
                  </div>
                )}
              </div>
              <span className="text-[10px] text-pencil/50 uppercase font-black tracking-widest mt-0.5">
                {collection.permission === "owner"
                  ? "Personal Library"
                  : "Shared Access"}
              </span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover/book:opacity-100 transition-opacity">
              {collection.permission === "owner" && (
                <>
                  <button
                    onClick={() => setIsSharing(!isSharing)}
                    className={cn(
                      "p-2 rounded-full transition-all active:scale-75",
                      isSharing
                        ? "bg-gold text-white"
                        : "hover:bg-gold/10 text-pencil hover:text-gold"
                    )}
                    title="Collaborators"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-pencil/5 rounded-full text-pencil hover:text-ink transition-all active:scale-75"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(collection.name)}
                    className="p-2 hover:bg-red-50 rounded-full text-pencil/40 hover:text-red-500 transition-all active:scale-75"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {isSharing && (
        <div className="border-t border-pencil/5 pt-4 space-y-5 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-3">
            <label className="text-[9px] font-black text-pencil uppercase tracking-[0.25em] px-1 flex items-center gap-2">
              <Settings2 className="w-3 h-3" /> Active Collaborators
            </label>
            {collection.collaborators?.length ? (
              <div className="space-y-2">
                {collection.collaborators.map((c) => (
                  <div
                    key={c.email}
                    className="flex items-center justify-between bg-pencil/5 p-3 rounded-2xl border border-pencil/5"
                  >
                    <span className="text-[11px] font-bold text-ink truncate">
                      {c.email}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        onStopCollaborating(collection.name, c.email)
                      }
                      className="h-7 text-[9px] text-red-500 font-black uppercase tracking-widest hover:bg-red-50 rounded-full"
                    >
                      <UserMinus className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-pencil/40 italic px-2">
                No collaborators yet.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black text-gold uppercase tracking-[0.25em] px-1 flex items-center gap-2">
              <Plus className="w-3 h-3" /> Invite New Author
            </label>
            <div className="flex gap-2">
              <input
                placeholder="author@example.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="flex-1 bg-pencil/5 border-none rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 ring-gold/20 transition-all"
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  onShare(collection.name, shareEmail, "collaborator")
                }
              />
              <Button
                size="sm"
                onClick={() =>
                  onShare(collection.name, shareEmail, "collaborator")
                }
                disabled={loading || !shareEmail}
                className="h-9 bg-ink text-white rounded-full px-5 text-[10px] font-black uppercase tracking-widest shadow-lg"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Invite"
                )}
              </Button>
            </div>
          </div>

          <div className="bg-gold/5 border border-gold/10 rounded-2xl p-4 flex gap-3">
            <Shield className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <p className="text-[10px] text-gold/80 leading-relaxed font-medium italic">
              Sharing a book allows others to add notes to this specific
              collection in real-time. You maintain full ownership.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
