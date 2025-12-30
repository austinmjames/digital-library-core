"use client";

import { useUserNotes } from "@/lib/hooks/useUserNotes";
import { cn } from "@/lib/utils/utils";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Globe,
  Italic,
  List,
  Loader2,
  Lock,
  Save,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";

/**
 * NoteEditor Component (v1.2 - Fix Type Mismatch)
 * Filepath: components/reader/NoteEditor.tsx
 * Role: Phase 3 Creator Loop - Rich Text Entry.
 * Purpose: A TipTap-based editor that automatically saves personal
 * insights to the current DrashRef anchor.
 */

interface NoteEditorProps {
  activeRef: string;
  onClose?: () => void;
}

/**
 * MenuBar Component
 * Resolves: Unexpected any. Specify a different type.
 */
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div className="flex gap-1 mb-4 p-1 bg-zinc-100 rounded-lg w-fit">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "p-1.5 rounded transition-all",
          editor.isActive("bold")
            ? "bg-white shadow-sm text-zinc-900"
            : "text-zinc-400 hover:text-zinc-600"
        )}
        title="Bold"
      >
        <Bold size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "p-1.5 rounded transition-all",
          editor.isActive("italic")
            ? "bg-white shadow-sm text-zinc-900"
            : "text-zinc-400 hover:text-zinc-600"
        )}
        title="Italic"
      >
        <Italic size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "p-1.5 rounded transition-all",
          editor.isActive("bulletList")
            ? "bg-white shadow-sm text-zinc-900"
            : "text-zinc-400 hover:text-zinc-600"
        )}
        title="Bullet List"
      >
        <List size={14} />
      </button>
    </div>
  );
};

export const NoteEditor: React.FC<NoteEditorProps> = ({ activeRef }) => {
  const { note, isLoading, saveNote } = useUserNotes(activeRef);
  const [isPublic, setIsPublic] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none min-h-[200px] max-w-none text-zinc-900",
      },
    },
  });

  // Hydrate editor when note loads
  useEffect(() => {
    if (note && editor) {
      editor.commands.setContent(note.content);
      setIsPublic(note.is_public);
    } else if (editor) {
      editor.commands.setContent("");
    }
  }, [note, editor]);

  const handleSave = async () => {
    if (!editor) return;
    const content = editor.getHTML();

    // Fix: The saveNote mutation expects a string (the content HTML),
    // not an object with metadata. Passing the content string directly
    // resolves the reported type assignment error.
    await saveNote.mutateAsync(content);
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        <p className="text-[10px] font-bold uppercase tracking-widest">
          Opening Notebook...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-4 duration-300 p-6">
      {/* Editor Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">
            Personal Insight
          </h3>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-1">
            Anchored to {activeRef}
          </span>
        </div>
        <button
          onClick={() => setIsPublic(!isPublic)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase transition-all shadow-sm",
            isPublic
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-white"
          )}
        >
          {isPublic ? <Globe size={12} /> : <Lock size={12} />}
          {isPublic ? "Public" : "Private"}
        </button>
      </div>

      {/* Editor Canvas */}
      <div className="flex-grow flex flex-col">
        <MenuBar editor={editor} />
        <div className="flex-grow bg-zinc-50/30 rounded-2xl border border-zinc-100 p-6 focus-within:border-orange-200 focus-within:bg-white transition-all duration-300">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
        <button className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
          <Trash2 size={18} />
        </button>
        <button
          onClick={handleSave}
          disabled={saveNote.isPending || !editor}
          className="flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white text-[11px] font-bold uppercase rounded-xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 disabled:opacity-50"
        >
          {saveNote.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {saveNote.isPending ? "Syncing..." : "Sync Insight"}
        </button>
      </div>
    </div>
  );
};
