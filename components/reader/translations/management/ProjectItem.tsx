"use client";

import {
  Globe,
  Lock,
  CheckCircle2,
  Share2,
  Edit3,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TranslationProject {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface ProjectItemProps {
  project: TranslationProject;
  isActive: boolean;
  isProcessing: boolean;
  onSelect: (id: string | null) => void;
  onTogglePublish: (id: string, status: string) => Promise<void>;
  onDelete: (id: string, name: string) => Promise<void>;
}

/**
 * components/reader/translations/management/ProjectItem.tsx
 * Renders an individual project card with its administrative actions.
 */
export function ProjectItem({
  project,
  isActive,
  isProcessing,
  onSelect,
  onTogglePublish,
  onDelete,
}: ProjectItemProps) {
  return (
    <div
      className={cn(
        "group w-full rounded-[2rem] border transition-all duration-500 overflow-hidden bg-white",
        isActive
          ? "border-gold/40 ring-1 ring-gold/20 shadow-xl shadow-gold/5"
          : "border-pencil/10 hover:border-pencil/20 hover:shadow-md"
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
              {project.status === "public" ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[8px] font-black uppercase tracking-widest">
                  <Globe className="w-2.5 h-2.5" /> Published
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-pencil/5 text-pencil/60 rounded-full border border-pencil/10 text-[8px] font-black uppercase tracking-widest">
                  <Lock className="w-2.5 h-2.5" /> Private Layer
                </div>
              )}
            </div>
          </div>
          {isActive && (
            <div className="bg-gold rounded-full p-1.5 shadow-lg shadow-gold/20 animate-in zoom-in-50">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <p className="text-[10px] text-pencil/40 font-mono">
          Started {new Date(project.created_at).toLocaleDateString()}
        </p>
      </button>

      <div className="px-5 py-4 bg-pencil/[0.02] border-t border-pencil/5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={isProcessing}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePublish(project.id, project.status);
            }}
            className={cn(
              "h-8 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all px-4",
              project.status === "public"
                ? "text-red-500 border-red-100 hover:bg-red-50"
                : "text-emerald-700 border-emerald-100 hover:bg-emerald-50"
            )}
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : project.status === "public" ? (
              "Take Offline"
            ) : (
              "Publish to Explore"
            )}
          </Button>
          {project.status === "public" && (
            <button
              className="p-2 text-pencil/30 hover:text-gold transition-colors"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 text-pencil/20 hover:text-ink transition-colors"
            title="Rename Project"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            disabled={isProcessing}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id, project.name);
            }}
            className="p-2 text-pencil/10 hover:text-red-500 transition-colors"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
