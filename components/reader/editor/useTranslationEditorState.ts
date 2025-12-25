import { useState, useCallback, useRef, useEffect } from "react";

/**
 * useTranslationEditorState
 * Enhanced hook to support the community ranking and publishing system.
 * Manages drafting, publication toggles, and community feedback (votes).
 */
export function useTranslationEditorState(
  initialContent: string,
  initialIsPublished: boolean = false,
  initialVoteScore: number = 0
) {
  // Core Drafting State
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Community & Ranking State
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [voteScore, setVoteScore] = useState(initialVoteScore);

  // Sync state if the source data changes
  useEffect(() => {
    setContent(initialContent);
    setIsPublished(initialIsPublished);
    setVoteScore(initialVoteScore);
    setSaveStatus("idle");
    setErrorMessage(null);
  }, [initialContent, initialIsPublished, initialVoteScore]);

  /**
   * handleContentChange
   * Updates the buffer and resets the status to idle.
   */
  const handleContentChange = useCallback(
    (val: string) => {
      setContent(val);
      if (saveStatus !== "idle") setSaveStatus("idle");
    },
    [saveStatus]
  );

  /**
   * togglePublishStatus
   * Local toggle for the "Marketplace Visibility" intent.
   */
  const togglePublishStatus = useCallback(() => {
    setIsPublished((prev) => !prev);
    if (saveStatus !== "idle") setSaveStatus("idle");
  }, [saveStatus]);

  const resetStatus = useCallback(() => {
    setSaveStatus("idle");
    setErrorMessage(null);
  }, []);

  return {
    // Content data
    content,
    setContent: handleContentChange,
    charCount: content.length,

    // Publication logic
    isPublished,
    setIsPublished: togglePublishStatus,

    // Community standing
    voteScore,
    setVoteScore,

    // Lifecycle/UI state
    saveStatus,
    setSaveStatus,
    errorMessage,
    setErrorMessage,
    textareaRef,
    resetStatus,

    // Helper to determine if the draft has unsaved "Publish" changes
    isDirty: content !== initialContent || isPublished !== initialIsPublished,
  };
}
