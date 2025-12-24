"use client";

import { useState } from "react";
import { Plus, ChevronLeft, Download, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CollectionMetadata,
  PermissionLevel,
  ImportAction,
} from "@/lib/types/library";
import { CollectionItem } from "./management/CollectionItem";

interface ManagementViewProps {
  collections: CollectionMetadata[];
  onBack: () => void;
  onRename: (old: string, newN: string) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
  onCreate: (name: string, isCollab: boolean) => Promise<void>;
  onImport: ImportAction;
  onShare: (
    name: string,
    email: string,
    perm: PermissionLevel
  ) => Promise<void>;
  onStopCollaborating: (name: string, email: string) => Promise<void>;
}

/**
 * components/reader/commentary/ManagementView.tsx
 * Orchestrator for Commentary Library administration.
 * Segmented for efficiency and consistent iOS feel.
 */
export function ManagementView({
  collections,
  onBack,
  onRename,
  onDelete,
  onCreate,
  onImport,
  onShare,
  onStopCollaborating,
}: ManagementViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [newName, setNewName] = useState("");
  const [importCode, setImportCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    await onCreate(newName, false);
    setNewName("");
    setIsCreating(false);
    setLoading(false);
  };

  const handleImport = async () => {
    if (!importCode.trim()) return;
    setLoading(true);
    const success = await onImport(importCode);
    if (success) {
      setImportCode("");
      setIsImporting(false);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-pencil/5 rounded-full transition-all active:scale-75"
          >
            <ChevronLeft className="w-5 h-5 text-pencil" />
          </button>
          <h4 className="font-serif font-bold text-xl text-ink tracking-tight">
            Commentary Books
          </h4>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsImporting(!isImporting);
              setIsCreating(false);
            }}
            className={cn(
              "p-2 rounded-full transition-all active:scale-75",
              isImporting
                ? "bg-gold text-white shadow-lg shadow-gold/20"
                : "bg-pencil/5 text-pencil hover:bg-pencil/10"
            )}
            title="Import Shared Book"
          >
            <Download className="w-4 h-4" />
          </button>
          {!isCreating && (
            <button
              onClick={() => {
                setIsCreating(true);
                setIsImporting(false);
              }}
              className="p-2 rounded-full bg-ink text-paper shadow-xl hover:bg-charcoal transition-all active:scale-75 ml-1"
              title="New Book"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Creation/Import Modals */}
      {isCreating && (
        <div className="p-6 bg-gold/5 rounded-[2.5rem] border border-gold/10 shadow-inner animate-in zoom-in-95 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gold uppercase tracking-[0.25em] ml-1">
              New Library Book
            </label>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Insights on Bereshit"
              className="w-full bg-white border border-gold/20 rounded-2xl px-4 py-3 text-sm font-serif shadow-sm focus:ring-4 focus:ring-gold/5 outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreating(false)}
              className="flex-1 py-2.5 text-[10px] font-black text-pencil uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !newName.trim()}
              className="flex-1 py-2.5 bg-gold text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Create Book"
              )}
            </button>
          </div>
        </div>
      )}

      {isImporting && (
        <div className="p-6 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 shadow-inner animate-in zoom-in-95 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.25em] ml-1">
              Import Shared Book
            </label>
            <input
              autoFocus
              value={importCode}
              onChange={(e) => setImportCode(e.target.value.toUpperCase())}
              placeholder="Paste Share Code..."
              className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-sm font-mono shadow-sm focus:ring-4 focus:ring-indigo-500/5 outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleImport()}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsImporting(false)}
              className="flex-1 py-2.5 text-[10px] font-black text-indigo-900/40 uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={loading || !importCode.trim()}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Join Book"
              )}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4 pb-20">
        {collections.map((coll) => (
          <CollectionItem
            key={coll.id}
            collection={coll}
            onRename={onRename}
            onDelete={onDelete}
            onShare={onShare}
            onStopCollaborating={onStopCollaborating}
          />
        ))}

        {collections.length === 0 && !isCreating && !isImporting && (
          <div className="py-16 text-center bg-pencil/[0.02] border-2 border-dashed border-pencil/10 rounded-[2.5rem]">
            <Sparkles className="w-12 h-12 text-pencil/10 mx-auto mb-4" />
            <p className="text-sm font-serif font-bold text-ink">
              Empty Library
            </p>
            <p className="text-[10px] text-pencil/40 uppercase font-black tracking-widest mt-1">
              Start your first book to begin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
