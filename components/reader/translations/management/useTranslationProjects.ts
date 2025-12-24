import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/auth-context";

export interface TranslationProject {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export function useTranslationProjects() {
  const { user } = useAuth();
  const supabase = createClient();

  const [projects, setProjects] = useState<TranslationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    try {
      if (projects.length === 0) setLoading(true);

      const { data, error } = await supabase
        .from("translation_versions")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data as TranslationProject[]);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, projects.length]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (name: string) => {
    if (!user || !name.trim()) return;
    setProcessingId("create");

    try {
      const { error } = await supabase.from("translation_versions").insert({
        name,
        owner_id: user.id,
        status: "private",
        language_code: "en",
      });

      if (error) throw error;
      await fetchProjects();
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const togglePublish = async (id: string, currentStatus: string) => {
    setProcessingId(id);
    const newStatus = currentStatus === "public" ? "private" : "public";

    try {
      const { error } = await supabase
        .from("translation_versions")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      await fetchProjects();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const deleteProject = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from("translation_versions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return {
    projects,
    loading,
    processingId,
    createProject,
    togglePublish,
    deleteProject,
  };
}
