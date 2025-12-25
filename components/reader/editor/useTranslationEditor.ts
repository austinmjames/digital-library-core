import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/auth-context";
import { saveVerseTranslation } from "@/app/actions";
import { handleSupabaseError } from "@/lib/supabase/utils";

interface UseTranslationEditorProps {
  versionId?: string;
  initialTranslation: string;
  verseRef: string;
  bookSlug: string;
  chapterNum: number;
  verseNum: number;
  onClose: () => void;
}

export function useTranslationEditor({
  versionId,
  initialTranslation,
  verseRef,
  bookSlug,
  chapterNum,
  verseNum,
  onClose,
}: UseTranslationEditorProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [content, setContent] = useState(initialTranslation);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionRole, setPermissionRole] = useState<
    "owner" | "collaborator" | "viewer"
  >("viewer");
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const checkPermissions = useCallback(async () => {
    if (!versionId || !user) {
      setHasPermission(false);
      setIsCheckingPermissions(false);
      return;
    }

    try {
      // Check Owner
      const { data: project } = await supabase
        .from("translation_versions")
        .select("owner_id")
        .eq("id", versionId)
        .single();

      if (project?.owner_id === user.id) {
        setHasPermission(true);
        setPermissionRole("owner");
        setIsCheckingPermissions(false);
        return;
      }

      // Check Collaborator
      const { data: collab } = await supabase
        .from("collection_collaborators")
        .select("permission")
        .eq("collection_id", versionId)
        .eq("user_email", user.email)
        .single();

      if (
        collab &&
        (collab.permission === "owner" || collab.permission === "collaborator")
      ) {
        setHasPermission(true);
        setPermissionRole("collaborator");
      } else {
        setHasPermission(false);
        setPermissionRole("viewer");
      }
    } catch (err) {
      console.error("Permission check failed:", err);
      setHasPermission(false);
    } finally {
      setIsCheckingPermissions(false);
    }
  }, [versionId, user, supabase]);

  useEffect(() => {
    setContent(initialTranslation);
    setSaveStatus("idle");
    setErrorMessage(null);
    checkPermissions();
  }, [initialTranslation, verseRef, checkPermissions]);

  const handleSave = async () => {
    if (!versionId || !hasPermission) return;

    setIsSaving(true);
    setSaveStatus("idle");
    setErrorMessage(null);

    try {
      const result = await saveVerseTranslation({
        version_id: versionId,
        book_slug: bookSlug,
        c1: chapterNum,
        c2: verseNum,
        custom_content: content,
        user_id: user?.id || "",
      });

      if (result.success) {
        setSaveStatus("success");
        setTimeout(() => onClose(), 800);
      } else {
        setSaveStatus("error");
        setErrorMessage(result.error || "Failed to commit layer.");
      }
    } catch (err) {
      setSaveStatus("error");
      setErrorMessage(handleSupabaseError(err));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    content,
    setContent,
    isSaving,
    isCheckingPermissions,
    hasPermission,
    permissionRole,
    saveStatus,
    errorMessage,
    textareaRef,
    handleSave,
  };
}
