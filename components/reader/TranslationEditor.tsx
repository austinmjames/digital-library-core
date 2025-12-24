"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Sparkles,
  Loader2,
  Languages,
  Type,
  Info,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveVerseTranslation } from "@/app/actions";
import { cn } from "@/lib/utils";

interface TranslationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  verseRef: string;
  sourceText: string;
  initialTranslation: string;
  versionId?: string; // The specific Sovereignty project UUID
  bookSlug: string;
  chapterNum: number;
  verseNum: number;
}

/**
 * TranslationEditor
 * A distraction-free modal for crafting personal translations within the Sovereignty Layer.
 * Designed with a focus on typography, legibility, and iOS-style interaction patterns.
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
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync content when verse changes or initial data loads
  useEffect(() => {
    setContent(initialTranslation);
    setSaveStatus("idle");
  }, [initialTranslation, verseRef]);

  // Immersive focus: ensure the keyboard or focus is ready on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => textareaRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!versionId) return;

    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const result = await saveVerseTranslation({
        version_id: versionId,
        book_slug: bookSlug,
        c1: chapterNum,
        c2: verseNum,
        custom_content: content,
        user_id: "", // Server action handles ownership/auth
      });

      if (result.success) {
        setSaveStatus("success");
        // Brief delay before closing to show success state
        setTimeout(() => onClose(), 800);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error("Critical error during save:", err);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Dynamic Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-xl animate-in fade-in duration-700"
        onClick={onClose}
      />

      {/* Immersive Editor Container */}
      <div className="relative w-full max-w-4xl h-full max-h-[85vh] bg-paper rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-pencil/10 overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-spring">
        {/* iOS-Style Sticky Header */}
        <header className="flex items-center justify-between px-8 py-6 border-b border-pencil/5 bg-paper/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center shadow-inner group">
              <Sparkles className="w-7 h-7 text-gold transition-transform group-hover:rotate-12 duration-500" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-2xl text-ink tracking-tight">
                Sovereignty Editor
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gold uppercase font-black tracking-[0.25em] bg-gold/5 px-3 py-1 rounded-full border border-gold/10 shadow-sm">
                  {verseRef}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-4 rounded-full hover:bg-pencil/10 text-pencil transition-all active:scale-75 group"
            title="Close Editor"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </header>

        {/* Scrollable Work Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 no-scrollbar">
          {/* Source Text Context */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <label className="text-[11px] font-black text-pencil/40 uppercase tracking-[0.3em] flex items-center gap-2">
                <Languages className="w-4 h-4" /> Source Authority
              </label>
              <div className="h-px bg-pencil/10 flex-1 ml-4 mr-4" />
              <span className="text-[10px] text-pencil/30 font-serif italic">
                Hebrew Masoretic
              </span>
            </div>
            <div
              className="p-8 rounded-[2.5rem] bg-pencil/[0.02] font-hebrew text-4xl md:text-5xl leading-[1.6] text-right text-ink/90 border border-pencil/5 shadow-inner"
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: sourceText }}
            />
          </section>

          {/* User's Interpretive Layer */}
          <section className="space-y-4 pb-20">
            <div className="flex items-center justify-between px-2">
              <label className="text-[11px] font-black text-gold uppercase tracking-[0.3em] flex items-center gap-2">
                <Type className="w-4 h-4" /> Your Interpretation
              </label>
              <div className="h-px bg-gold/10 flex-1 ml-4 mr-4" />
              <span className="text-[10px] text-gold/40 font-bold uppercase tracking-widest animate-pulse">
                Live Drafting
              </span>
            </div>

            <div className="relative group">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[300px] p-8 rounded-[2.5rem] bg-white border-2 border-pencil/5 focus:border-gold/30 focus:ring-[12px] focus:ring-gold/5 outline-none transition-all font-serif text-2xl leading-relaxed resize-none shadow-xl shadow-black/[0.02] group-hover:border-pencil/10 placeholder:text-pencil/20 placeholder:italic"
                placeholder="Listen to the text... write its meaning for today."
              />

              {/* Corner character count hint */}
              <div className="absolute bottom-6 left-8 flex items-center gap-2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-pencil uppercase">
                  {content.length} characters
                </span>
              </div>
            </div>

            {/* Privacy/Safety Banner */}
            <div className="flex items-center gap-4 p-5 bg-indigo-50/40 rounded-[1.8rem] border border-indigo-100/50">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-[11px] text-indigo-900/50 leading-relaxed font-medium italic">
                This translation remains strictly in your private layer until
                you choose to publish it to the Marketplace.
              </p>
            </div>
          </section>
        </div>

        {/* Action Footer */}
        <footer className="px-10 py-8 bg-pencil/5 border-t border-pencil/10 flex flex-col sm:flex-row items-center justify-between gap-6 z-20">
          <div className="hidden lg:block max-w-sm">
            <p className="text-[10px] text-pencil/40 leading-relaxed font-bold uppercase tracking-widest">
              Sovereignty is the right to define meaning.
            </p>
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-full px-8 h-14 border-pencil/20 text-pencil font-bold text-sm hover:bg-white hover:text-ink transition-all active:scale-95"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving || !versionId || saveStatus === "success"}
              className={cn(
                "flex-1 sm:flex-none rounded-full px-12 h-14 font-black text-sm gap-3 shadow-2xl transition-all active:scale-[0.97]",
                !versionId
                  ? "bg-pencil/20 text-pencil/40 cursor-not-allowed"
                  : saveStatus === "success"
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

              {saveStatus === "success"
                ? "Wisdom Saved"
                : !versionId
                ? "Select Project"
                : "Commit to Layer"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
