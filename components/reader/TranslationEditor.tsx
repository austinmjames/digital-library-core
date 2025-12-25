"use client";

import { Languages, Loader2, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Sub-components & Hook
import { useTranslationEditor } from "./editor/useTranslationEditor";
import { EditorHeader } from "./editor/EditorHeader";
import { InterpretationSection } from "./editor/InterpretationSection";

interface TranslationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  verseRef: string;
  sourceText: string;
  initialTranslation: string;
  versionId?: string;
  bookSlug: string;
  chapterNum: number;
  verseNum: number;
}

/**
 * TranslationEditor
 * Refactored Orchestrator. Logic is separated into useTranslationEditor hook.
 * UI is segmented for performance and readability.
 */
export function TranslationEditor(props: TranslationEditorProps) {
  const { isOpen, onClose, sourceText, verseRef } = props;

  const {
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
  } = useTranslationEditor(props);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-xl animate-in fade-in duration-700"
        onClick={onClose}
      />

      {/* Surface */}
      <div className="relative w-full max-w-4xl h-full max-h-[90vh] bg-paper rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] border border-pencil/10 overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-spring">
        <EditorHeader
          verseRef={verseRef}
          isChecking={isCheckingPermissions}
          hasPermission={hasPermission}
          role={permissionRole}
          onClose={onClose}
        />

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 no-scrollbar">
          {/* Source Section (Lightweight enough to keep inline) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <label className="text-[11px] font-black text-pencil/40 uppercase tracking-[0.3em] flex items-center gap-2">
                <Languages className="w-4 h-4" /> Source Text
              </label>
              <div className="h-px bg-pencil/10 flex-1 ml-4 mr-4" />
              <span className="text-[10px] text-pencil/30 font-serif italic">
                Masoretic Hebrew
              </span>
            </div>
            <div
              className="p-8 rounded-[2.5rem] bg-pencil/[0.02] font-hebrew text-4xl md:text-5xl leading-[1.6] text-right text-ink/90 border border-pencil/5 shadow-inner"
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: sourceText }}
            />
          </section>

          <InterpretationSection
            content={content}
            setContent={setContent}
            hasPermission={hasPermission}
            isChecking={isCheckingPermissions}
            errorMessage={errorMessage}
            textareaRef={textareaRef}
          />
        </div>

        {/* Action Footer */}
        <footer className="px-10 py-8 bg-pencil/5 border-t border-pencil/10 flex flex-col sm:flex-row items-center justify-between gap-6 z-20">
          <div className="hidden lg:block">
            <p className="text-[10px] text-pencil/40 font-bold uppercase tracking-widest">
              Meaning is yours to define.
            </p>
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-full px-8 h-14 border-pencil/20 text-pencil font-bold hover:bg-white hover:text-ink transition-all"
            >
              {hasPermission ? "Discard Changes" : "Close Editor"}
            </Button>

            {hasPermission && (
              <Button
                onClick={handleSave}
                disabled={isSaving || saveStatus === "success"}
                className={cn(
                  "flex-1 sm:flex-none rounded-full px-12 h-14 font-black text-sm gap-3 shadow-2xl transition-all active:scale-[0.97]",
                  saveStatus === "success"
                    ? "bg-emerald-500 text-white shadow-emerald-200"
                    : "bg-ink text-paper hover:bg-charcoal shadow-gold/20"
                )}
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : saveStatus === "success" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saveStatus === "success" ? "Wisdom Saved" : "Commit to Layer"}
              </Button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
