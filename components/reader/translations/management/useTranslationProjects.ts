"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/auth-context";
import { handleSupabaseError, validateResponse } from "@/lib/supabase/utils";
import { useRouter } from "next/navigation";
import { TranslationProject } from "@/lib/types/library";

/**
 * useTranslationProjects
 * Central engine for managing Sovereignty layers.
 * Resolves: Promise type assignment errors and "Unexpected any" warnings.
 */
export function useTranslationProjects() {
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  const [projects, setProjects] = useState<TranslationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * fetchProjects
   * Retrieves user-owned layers and maps them to the social metadata interface.
   */
  const fetchProjects = useCallback(async () => {
    if (authLoading || !user) {
      if (!authLoading) setLoading(false);
      return;
    }

    try {
      if (projects.length === 0) setLoading(true);

      // Explicit interface for the database response to satisfy strict typing
      interface ProjectRow {
        id: string;
        title: string;
        description: string | null;
        author_display_name: string | null;
        status: string;
        install_count: number;
        created_at: string;
      }

      // Explicitly typing the selection to remove 'any'
      const query = supabase
        .from("translation_versions")
        .select(
          "id, title, description, author_display_name, status, install_count, created_at"
        )
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      // Wrap the query in Promise.resolve to satisfy the validateResponse generic constraint
      const { data, error: fetchErr } = await validateResponse<ProjectRow[]>(
        Promise.resolve(query)
      );

      if (fetchErr) {
        setError(fetchErr);
        return;
      }

      // Transform raw DB rows into the UI-friendly TranslationProject interface
      const mappedProjects: TranslationProject[] = (data || []).map(
        (p: ProjectRow) => ({
          id: p.id,
          title: p.title,
          name: p.title,
          description: p.description || "",
          author_display_name: p.author_display_name || "",
          status: p.status,
          install_count: p.install_count || 0,
          created_at: p.created_at,
        })
      );

      setProjects(mappedProjects);
      setError(null);
    } catch (err: unknown) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, supabase, projects.length]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /**
   * createProject
   */
  const createProject = async (projectName: string): Promise<boolean> => {
    if (!user || !projectName.trim()) return false;
    setProcessingId("create");
    setError(null);

    try {
      const { error: insertErr } = await supabase
        .from("translation_versions")
        .insert({
          title: projectName.trim(),
          owner_id: user.id,
          status: "private",
          language_code: "en",
          install_count: 0,
        });

      if (insertErr) throw insertErr;
      await fetchProjects();
      return true;
    } catch (err: unknown) {
      setError(handleSupabaseError(err));
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * togglePublish
   */
  const togglePublish = async (id: string, currentStatus: string) => {
    setProcessingId(id);
    const newStatus = currentStatus === "public" ? "private" : "public";
    try {
      const { error: updateErr } = await supabase
        .from("translation_versions")
        .update({ status: newStatus })
        .eq("id", id);

      if (updateErr) throw updateErr;

      await fetchProjects();
      router.refresh();
    } catch (err: unknown) {
      setError(handleSupabaseError(err));
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * deleteProject
   */
  const deleteProject = async (id: string) => {
    setProcessingId(id);
    try {
      const { error: deleteErr } = await supabase
        .from("translation_versions")
        .delete()
        .eq("id", id);

      if (deleteErr) throw deleteErr;

      await fetchProjects();
      router.refresh();
    } catch (err: unknown) {
      setError(handleSupabaseError(err));
    } finally {
      setProcessingId(null);
    }
  };

  return {
    projects,
    loading,
    processingId,
    error,
    createProject,
    togglePublish,
    deleteProject,
    fetchProjects,
  };
}
