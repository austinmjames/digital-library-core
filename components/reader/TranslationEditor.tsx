"use client";

import { useState, useEffect } from "react";
import { X, Save, Sparkles, Loader2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveVerseTranslation } from "@/app/actions";

interface TranslationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  verseRef: string;
  sourceText: string;
  initialTranslation: string;
  versionId?: string; // The specific Sovereignty project ID
  bookSlug: string;
  chapterNum: number;
  verseNum: number;
}

/**
 * TranslationEditor
 * UI for crafting and saving custom translations.
 * Removed unused 'cn' import.
 */
export function TranslationEditor({
  isOpen,
  onClose,
  verseRef,
  sourceText,
  initialTranslation,
  versionId,
  bookSlug,
  chapterNum,
  verseNum,
}: TranslationEditorProps) {
  const [content, setContent] = useState(initialTranslation);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setContent(initialTranslation);
  }, [initialTranslation, verseRef]);

  const handleSave = async () => {
    if (!versionId) {
      alert("Please select a Sovereignty project to save your translation.");
      return;
    }

    setIsSaving(true);
    const result = await saveVerseTranslation({
      version_id: versionId,
      book_slug: bookSlug,
      c1: chapterNum,
      c2: verseNum,
      custom_content: content,
      user_id: "", // Set by server action
    });

    if (result.success) {
      onClose();
    } else {
      alert("Failed to save translation. Please try again.");
    }
    setIsSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Editor Modal */}
      <div className="relative w-full max-w-2xl bg-paper rounded-[2.5rem] shadow-2xl border border-pencil/10 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-8 py-6 border-b border-pencil/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-ink">
                Sovereignty Editor
              </h2>
              <p className="text-[10px] text-pencil uppercase font-bold tracking-widest">
                {verseRef}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-pencil/10 transition-colors"
          >
            <X className="w-6 h-6 text-pencil" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Source Text Display */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-pencil uppercase tracking-widest flex items-center gap-2">
              <Languages className="w-3 h-3" /> Source Text
            </label>
            <div
              className="p-5 rounded-2xl bg-pencil/5 font-hebrew text-2xl leading-relaxed text-right text-ink/80"
              dangerouslySetInnerHTML={{ __html: sourceText }}
            />
          </div>

          {/* Edit Area */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-pencil uppercase tracking-widest">
              Your Translation
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-40 p-5 rounded-2xl bg-white border border-pencil/10 focus:border-gold/50 focus:ring-4 focus:ring-gold/5 outline-none transition-all font-serif text-lg leading-relaxed resize-none"
              placeholder="Begin translating..."
            />
          </div>
        </div>

        <div className="px-8 py-6 bg-pencil/5 flex items-center justify-between">
          <p className="text-[10px] text-pencil/60 max-w-[60%] leading-relaxed">
            Translations are saved to your active Sovereignty project and can be
            published to the community.
          </p>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full px-8 bg-gold hover:bg-gold/90 text-white font-bold gap-2 shadow-lg shadow-gold/20 h-12"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Translation
          </Button>
        </div>
      </div>
    </div>
  );
}
