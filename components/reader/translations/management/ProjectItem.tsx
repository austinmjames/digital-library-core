"use client";

import { useState } from "react";
import {
  Globe,
  Lock,
  CheckCircle2,
  Edit3,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TranslationProject } from "@/lib/types/library";
import { updateProjectMetadata } from "@/app/actions/sovereignty";

interface ProjectItemProps {
  project: TranslationProject;
  isActive: boolean;
  isProcessing: boolean;
  onSelect: (id: string | null) => void;
  onTogglePublish: (id: string, status: string) => Promise<void>;
  onDelete: (id: string, name: string) => Promise<void>;
}

/**
 * ProjectItem
 * Orchestrates individual project management with metadata editing.
 * Resolved: Correctly handles install_count and metadata updates.
 */
export function ProjectItem({
  project,
  isActive,
  isProcessing,
  onSelect,
  onTogglePublish,
  onDelete,
}: ProjectItemProps) {
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [meta, setMeta] = useState({
    name: project.name,
    description: project.description || "",
    authorName: project.author_display_name || "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateMeta = async () => {
    setIsUpdating(true);
    try {
      await updateProjectMetadata(project.id, "translation", {
        name: meta.name,
        description: meta.description,
        author_name: meta.authorName,
      });
      setIsEditingMetadata(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={cn(
        "group w-full rounded-[2rem] border transition-all duration-500 overflow-hidden bg-white",
        isActive
          ? "border-gold/40 ring-1 ring-gold/20 shadow-xl"
          : "border-pencil/10 hover:shadow-md"
      )}
    >
      <button
        onClick={() => onSelect(isActive ? null : project.id)}
        className="w-full text-left p-5 hover:bg-pencil/[0.01] transition-colors relative"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="space-y-1">
            <h4
              className={cn(
                "font-serif font-bold text-lg leading-tight transition-colors",
                isActive ? "text-gold" : "text-ink group-hover:text-gold"
              )}
            >
              {project.name}
            </h4>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all",
                  project.status === "public"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-pencil/5 text-pencil/60 border-pencil/10"
                )}
              >
                {project.status === "public" ? (
                  <>
                    <Globe className="w-2.5 h-2.5" /> Published
                  </>
                ) : (
                  <>
                    <Lock className="w-2.5 h-2.5" /> Private
                  </>
                )}
              </div>
              <span className="text-[9px] font-bold text-pencil/30 uppercase tracking-tighter">
                {project.install_count} installs
              </span>
            </div>
          </div>
          {isActive && (
            <div className="bg-gold rounded-full p-1.5 shadow-lg shadow-gold/20 animate-in zoom-in-50">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </button>

      {isEditingMetadata ? (
        <div className="p-6 bg-pencil/[0.02] border-t border-pencil/5 space-y-4 animate-in slide-in-from-top-2">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-pencil uppercase tracking-widest px-1">
                Marketplace Title
              </label>
              <input
                value={meta.name}
                onChange={(e) => setMeta({ ...meta, name: e.target.value })}
                className="w-full bg-white border border-pencil/10 rounded-xl px-3 py-2 text-xs font-serif outline-none focus:ring-2 ring-gold/20 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-pencil uppercase tracking-widest px-1">
                Public Author Display Name
              </label>
              <input
                value={meta.authorName}
                placeholder="e.g. The OpenTorah Collective"
                onChange={(e) =>
                  setMeta({ ...meta, authorName: e.target.value })
                }
                className="w-full bg-white border border-pencil/10 rounded-xl px-3 py-2 text-xs font-serif outline-none focus:ring-2 ring-gold/20 transition-all"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between px-1">
                <label className="text-[9px] font-black text-pencil uppercase tracking-widest">
                  Marketplace Description
                </label>
                <span className="text-[9px] font-mono text-pencil/40">
                  {meta.description.length}/160
                </span>
              </div>
              <textarea
                value={meta.description}
                maxLength={160}
                onChange={(e) =>
                  setMeta({ ...meta, description: e.target.value })
                }
                placeholder="A short description of your interpretation style..."
                className="w-full bg-white border border-pencil/10 rounded-xl px-3 py-2 text-xs font-serif outline-none focus:ring-2 ring-gold/20 transition-all min-h-[80px] resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingMetadata(false)}
              className="flex-1 h-9 rounded-xl text-[10px] font-bold uppercase"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateMeta}
              disabled={isUpdating}
              className="flex-1 h-9 bg-gold text-white rounded-xl text-[10px] font-black uppercase"
            >
              {isUpdating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-5 py-4 bg-pencil/[0.02] border-t border-pencil/5 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={isProcessing}
            onClick={() => onTogglePublish(project.id, project.status)}
            className={cn(
              "h-8 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all px-4",
              project.status === "public"
                ? "text-red-500 border-red-100 hover:bg-red-50"
                : "text-emerald-700 border-emerald-100 hover:bg-emerald-50"
            )}
          >
            {isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
            ) : project.status === "public" ? (
              "Take Offline"
            ) : (
              "Publish to Marketplace"
            )}
          </Button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditingMetadata(true)}
              className="p-2 text-pencil/30 hover:text-gold transition-colors"
              title="Edit Metadata"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(project.id, project.name)}
              className="p-2 text-pencil/10 hover:text-red-500 transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
