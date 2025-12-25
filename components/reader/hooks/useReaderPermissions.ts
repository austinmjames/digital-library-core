import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/context/auth-context";
import { createClient } from "@/lib/supabase/client";

/**
 * useReaderPermissions
 * Handles the logic for determining if a user has rights to edit
 * a specific translation layer (Sovereignty project).
 */
export function useReaderPermissions(activeLayerId: string) {
  const { user } = useAuth();
  const supabase = createClient();
  const [canEdit, setCanEdit] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  const checkGlobalPermissions = useCallback(async () => {
    // Library defaults (short IDs) are always read-only
    const isLibraryDefault = !activeLayerId || activeLayerId.length < 20;

    if (isLibraryDefault || !user) {
      setCanEdit(false);
      setIsVerifying(false);
      return;
    }

    try {
      setIsVerifying(true);

      // Check if user is the Owner
      const { data: project } = await supabase
        .from("translation_versions")
        .select("owner_id")
        .eq("id", activeLayerId)
        .single();

      if (project?.owner_id === user.id) {
        setCanEdit(true);
        return;
      }

      // Check if user is an authorized Collaborator
      const { data: collab } = await supabase
        .from("collection_collaborators")
        .select("permission")
        .eq("collection_id", activeLayerId)
        .eq("user_email", user.email)
        .single();

      setCanEdit(
        !!collab &&
          (collab.permission === "owner" ||
            collab.permission === "collaborator")
      );
    } catch (err) {
      console.warn("Permission check failed:", err);
      setCanEdit(false);
    } finally {
      setIsVerifying(false);
    }
  }, [activeLayerId, user, supabase]);

  useEffect(() => {
    checkGlobalPermissions();
  }, [checkGlobalPermissions]);

  return { canEdit, isVerifying };
}
