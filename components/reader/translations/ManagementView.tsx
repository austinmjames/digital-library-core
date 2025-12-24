"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, CheckCircle2, Globe, Lock, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/auth-context";

interface TranslationProject {
  id: string;
  name: string;
  status: "private" | "public" | "in_review" | "archived";
  is_public: boolean;
  last_published_at?: string;
}

interface ManagementViewProps {
  activeVersionId: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * ManagementView (Translations)
 * Handles the lifecycle of Sovereignty projects including publishing to the Marketplace.
 */
export default function ManagementView({
  activeVersionId,
  onSelect,
}: ManagementViewProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [projects, setProjects] = useState<TranslationProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  /**
   * fetchProjects
   * Wrapped in useCallback to prevent infinite loops or missing dependency warnings.
   */
  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from("translation_versions")
      .select("id, name, status, is_public, last_published_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setProjects(data as TranslationProject[]);
    setIsLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    setIsProcessing(id);
    const newStatus = currentStatus === "public" ? "private" : "public";

    try {
      const { error } = await supabase
        .from("translation_versions")
        .update({
          status: newStatus,
          is_public: newStatus === "public",
        })
        .eq("id", id);

      if (error) throw error;
      await fetchProjects();
    } catch (err) {
      console.error("Publish toggle failed:", err);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCreateProject = async () => {
    if (!user) return;
    const name = prompt("Enter a name for your translation project:");
    if (!name) return;

    const { error } = await supabase
      .from("translation_versions")
      .insert({ name, owner_id: user.id, status: "private" });

    if (!error) await fetchProjects();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-pencil/20" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-pencil uppercase tracking-widest">
          Personal Projects
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateProject}
          className="h-7 px-2 text-gold hover:text-gold/80 gap-1 text-[10px] uppercase font-bold"
        >
          <Plus className="w-3 h-3" /> New Project
        </Button>
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className={cn(
              "w-full rounded-2xl border transition-all overflow-hidden bg-white",
              activeVersionId === project.id
                ? "border-gold/30 ring-1 ring-gold/20 shadow-sm"
                : "border-pencil/10"
            )}
          >
            <button
              onClick={() =>
                onSelect(project.id === activeVersionId ? null : project.id)
              }
              className="w-full text-left p-4 hover:bg-pencil/[0.02] transition-colors"
            >
              <div className="flex items-start justify-between mb-1">
                <h4
                  className={cn(
                    "font-serif font-bold text-ink",
                    activeVersionId === project.id && "text-gold"
                  )}
                >
                  {project.name}
                </h4>
                {activeVersionId === project.id && (
                  <CheckCircle2 className="w-4 h-4 text-gold" />
                )}
              </div>
              <div className="text-[9px] text-pencil uppercase tracking-widest flex items-center gap-1.5">
                {project.status === "public" ? (
                  <>
                    <Globe className="w-2.5 h-2.5 text-emerald-500" /> Published
                    to Marketplace
                  </>
                ) : (
                  <>
                    <Lock className="w-2.5 h-2.5" /> Private Draft
                  </>
                )}
              </div>
            </button>

            {/* Publishing Controls */}
            <div className="px-4 pb-4 flex items-center justify-between border-t border-pencil/5 pt-3 mt-1">
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing === project.id}
                onClick={() => handleTogglePublish(project.id, project.status)}
                className={cn(
                  "h-7 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                  project.status === "public"
                    ? "text-red-500 border-red-100 hover:bg-red-50"
                    : "text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                )}
              >
                {isProcessing === project.id ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : project.status === "public" ? (
                  "Unpublish"
                ) : (
                  "Publish to Explore"
                )}
              </Button>

              <button className="p-1.5 text-pencil/30 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-pencil/10 rounded-2xl">
            <p className="text-sm text-pencil">
              Create your first Sovereignty project to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
