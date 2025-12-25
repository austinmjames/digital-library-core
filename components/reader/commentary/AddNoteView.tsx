"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Plus,
  BookMarked,
  Save,
  ChevronLeft,
  X,
  Strikethrough,
  ChevronUp,
  ChevronDown,
  Highlighter,
  Eraser,
  Languages,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CollectionMetadata } from "@/lib/types/library";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  collections: CollectionMetadata[];
  selectedCollection: string;
  onSelectCollection: (name: string) => void;
  onSave: (content: string, collection: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  verseRef: string;
  verseContent: { he: string; en: string } | null;
  initialContent?: string;
  passageLanguage?: "he" | "en" | "bilingual";
}

/**
 * components/reader/commentary/AddNoteView.tsx
 * Updated: Refined verse reference styling to be more subtle and muted.
 */
export function NoteEditor({
  collections,
  selectedCollection,
  onSelectCollection,
  onSave,
  onCancel,
  isSaving,
  verseRef,
  verseContent,
  initialContent = "",
  passageLanguage = "bilingual",
}: NoteEditorProps) {
  const [newBookName, setNewBookName] = useState("");
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [previewLang, setPreviewLang] = useState<"he" | "en" | "bilingual">(
    passageLanguage
  );
  const [isPassageExpanded, setIsPassageExpanded] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== initialContent) {
        editorRef.current.innerHTML = initialContent;
      }
      editorRef.current.focus();

      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    if (typeof document !== "undefined") {
      try {
        document.execCommand("styleWithCSS", false, "true");
      } catch (e) {
        console.warn("Editor initialization warning:", e);
      }
    }
  }, [initialContent]);

  const currentPermission = collections.find(
    (c) => c.name === selectedCollection
  )?.permission;
  const isViewOnly = currentPermission === "viewer";

  const handleBack = useCallback(() => {
    const text = editorRef.current?.innerText.trim();
    const hasChanged = editorRef.current?.innerHTML !== initialContent;

    if (text && hasChanged) {
      if (window.confirm("You have unsaved wisdom. Discard draft?")) {
        onCancel();
      }
    } else {
      onCancel();
    }
  }, [onCancel, initialContent]);

  const execCmd = (cmd: string, value: string | undefined = undefined) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const highlight = (type: "blue" | "yellow" | "none") => {
    if (typeof document === "undefined") return;
    if (type === "none") {
      execCmd("backColor", "transparent");
      return;
    }
    const isDark = document.documentElement.classList.contains("dark");
    const colors = {
      blue: isDark ? "#075985" : "#BAE6FD",
      yellow: isDark ? "#854D0E" : "#FEF08A",
    };
    execCmd("backColor", colors[type]);
  };

  const handleSave = async () => {
    const content = editorRef.current?.innerHTML || "";
    if (!content.replace(/<[^>]*>/g, "").trim()) return;
    await onSave(content, selectedCollection);
  };

  const handleCreateBook = () => {
    if (!newBookName.trim()) return;
    onSelectCollection(newBookName);
    setNewBookName("");
    setIsAddingBook(false);
  };

  return (
    <div className="flex flex-col h-full bg-paper animate-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      <header className="h-20 border-b border-pencil/10 bg-paper/95 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-xl hover:bg-pencil/5 text-pencil transition-all active:scale-90 outline-none"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5px]" />
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-xl text-ink font-sans font-bold tracking-tight">
              {initialContent ? "Edit Commentary" : "Add Commentary"}
            </h2>
          </div>
        </div>

        {/* Tactile 3-Way Toggle for Passage Preview */}
        <div className="flex bg-slate-200/40 p-1 rounded-2xl shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.08)] border border-black/[0.02]">
          <button
            onClick={() => setPreviewLang("he")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all duration-300 flex items-center justify-center min-w-[40px]",
              previewLang === "he"
                ? "bg-white text-ink shadow-sm scale-[1.02]"
                : "text-pencil/30 hover:text-pencil"
            )}
          >
            <span className="text-[15px] font-semibold leading-none pt-0.5">
              אב
            </span>
          </button>
          <button
            onClick={() => setPreviewLang("bilingual")}
            className={cn(
              "px-4 py-1.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 min-w-[60px]",
              previewLang === "bilingual"
                ? "bg-white text-ink shadow-sm scale-[1.02]"
                : "text-pencil/30 hover:text-pencil"
            )}
          >
            <Languages className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewLang("en")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all duration-300 flex items-center justify-center min-w-[40px]",
              previewLang === "en"
                ? "bg-white text-ink shadow-sm scale-[1.02]"
                : "text-pencil/60 hover:text-pencil"
            )}
          >
            <span className="text-[12px] font-semibold leading-none">Aa</span>
          </button>
        </div>
      </header>

      <div className="bg-pencil/[0.01] border-b border-pencil/5 shrink-0 overflow-hidden">
        <button
          onClick={() => setIsPassageExpanded(!isPassageExpanded)}
          className="w-full px-8 py-4 flex items-center justify-between group hover:bg-pencil/[0.02] transition-colors outline-none"
        >
          {/* UPDATED STYLING HERE */}
          <h4 className="text-lg font-semibold text-pencil/80 font-sans tracking-tight">
            {verseRef}
          </h4>
          <div className="w-8 h-8 rounded-full bg-pencil/5 flex items-center justify-center text-pencil/40 group-hover:text-accent transition-colors">
            {isPassageExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>
        {isPassageExpanded && (
          <div className="px-8 pb-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-4">
              {(previewLang === "he" || previewLang === "bilingual") && (
                <div
                  className="hebrew-text text-right text-2xl font-hebrew text-ink leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: verseContent?.he || "" }}
                />
              )}
              {previewLang === "bilingual" && (
                <div className="h-px w-8 bg-accent/20" />
              )}
              {(previewLang === "en" || previewLang === "bilingual") && (
                <div
                  className="font-sans italic text-pencil/80 text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: verseContent?.en || "" }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
        <div className="sticky top-0 z-20 px-8 py-3 bg-paper/90 backdrop-blur-md border-b border-pencil/5 flex flex-wrap items-center gap-1">
          <div className="flex items-center gap-0.5 p-1 bg-pencil/5 rounded-xl border border-black/[0.03] shadow-sm">
            <button
              onClick={() => execCmd("bold")}
              className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-lg transition-all text-pencil hover:text-ink active:scale-90"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCmd("italic")}
              className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-lg transition-all text-pencil hover:text-ink active:scale-90"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCmd("underline")}
              className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-lg transition-all text-pencil hover:text-ink active:scale-90"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCmd("strikeThrough")}
              className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-lg transition-all text-pencil hover:text-ink active:scale-90"
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-0.5 p-1 bg-pencil/5 rounded-xl border border-black/[0.03] shadow-sm">
            <button
              onClick={() => highlight("blue")}
              className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-lg transition-all text-sky-500 hover:text-sky-600 active:scale-90"
              title="Blue Highlight"
            >
              <Highlighter className="w-4 h-4" />
            </button>
            <button
              onClick={() => highlight("yellow")}
              className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-lg transition-all text-amber-500 hover:text-amber-600 active:scale-90"
              title="Yellow Highlight"
            >
              <Highlighter className="w-4 h-4" />
            </button>
            <button
              onClick={() => highlight("none")}
              className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-lg transition-all text-pencil hover:text-red-500 active:scale-90 border-l border-pencil/10 ml-0.5 pl-0.5"
              title="Remove Highlight"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-8 pt-10">
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[400px] w-full bg-transparent outline-none font-serif text-lg leading-[1.8] prose prose-slate max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-pencil/20 empty:before:italic empty:before:font-sans"
            data-placeholder="Capture your wisdom..."
          />
        </div>
      </div>

      <footer className="p-6 border-t border-pencil/10 bg-paper/95 backdrop-blur-xl z-20 shrink-0">
        {isAddingBook ? (
          <div className="flex items-center gap-2 animate-in zoom-in-95">
            <input
              autoFocus
              value={newBookName}
              onChange={(e) => setNewBookName(e.target.value)}
              placeholder="Name new book..."
              className="flex-1 h-14 bg-white border border-accent/20 rounded-2xl px-6 font-bold text-ink outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleCreateBook()}
            />
            <Button
              onClick={handleCreateBook}
              className="h-14 bg-accent text-white rounded-2xl px-6 shadow-lg shadow-accent/10"
            >
              Create
            </Button>
            <button
              onClick={() => setIsAddingBook(false)}
              className="p-4 text-pencil hover:text-ink"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex h-16 w-full rounded-[1.4rem] bg-ink overflow-hidden shadow-2xl border border-white/5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex-1 flex items-center gap-3 px-6 text-white hover:bg-white/5 transition-colors border-r border-white/10 outline-none text-left min-w-0">
                  <BookMarked className="w-4 h-4 opacity-50 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold truncate">
                      {selectedCollection}
                    </span>
                    <span className="text-[8px] uppercase font-black tracking-widest opacity-40">
                      Destination Book
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 opacity-30 ml-auto shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[300px] rounded-2xl p-2 border-pencil/10 shadow-2xl"
              >
                <div className="px-3 py-2 text-[9px] font-black text-pencil/40 uppercase tracking-widest">
                  Authorized Books
                </div>
                {collections.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => onSelectCollection(c.name)}
                    className="p-3 rounded-xl cursor-pointer flex justify-between"
                  >
                    <span className="font-bold text-sm">{c.name}</span>
                    {c.permission === "viewer" && (
                      <span className="text-[8px] text-red-400 font-black uppercase">
                        Read Only
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
                <div className="h-px bg-pencil/5 my-1" />
                <DropdownMenuItem
                  onClick={() => setIsAddingBook(true)}
                  className="text-accent font-bold p-3 hover:bg-accent/5 rounded-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" /> Establish New Book
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={handleSave}
              disabled={isSaving || isViewOnly}
              className="w-20 flex items-center justify-center bg-accent text-white hover:bg-accent/90 transition-all active:scale-95 group/save"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5 group-hover/save:scale-110" />
              )}
            </button>
          </div>
        )}
      </footer>

      <style jsx global>{`
        :root {
          --highlight-blue: #bae6fd;
          --highlight-yellow: #fef08a;
        }
        .dark {
          --highlight-blue: #075985;
          --highlight-yellow: #854d0e;
        }
      `}</style>
    </div>
  );
}
