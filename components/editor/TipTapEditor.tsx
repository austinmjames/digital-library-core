"use client";

import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Underline as UnderlineIcon,
} from "lucide-react";
import React from "react";
import { DrashLink } from "./DrashLink";

/**
 * TipTapEditor Component (v1.2 - Strict Typing)
 * Filepath: components/editor/TipTapEditor.tsx
 * Role: The high-fidelity rich text core of DrashX.
 * Fix: Replaced 'any' with the 'Editor' type from @tiptap/react.
 */

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface ToolbarProps {
  editor: Editor | null;
}

const Toolbar = ({ editor }: ToolbarProps) => {
  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-2 rounded-lg transition-all ${
      active
        ? "bg-zinc-900 text-white shadow-sm"
        : "text-zinc-400 hover:bg-zinc-100"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 bg-white border border-zinc-200 rounded-xl mb-4 shadow-sm sticky top-0 z-10">
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btnClass(editor.isActive("heading", { level: 1 }))}
        type="button"
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive("heading", { level: 2 }))}
        type="button"
      >
        <Heading2 size={16} />
      </button>
      <div className="w-px h-4 bg-zinc-200 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive("bold"))}
        type="button"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive("italic"))}
        type="button"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btnClass(editor.isActive("underline"))}
        type="button"
      >
        <UnderlineIcon size={16} />
      </button>
      <div className="w-px h-4 bg-zinc-200 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive("bulletList"))}
        type="button"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive("orderedList"))}
        type="button"
      >
        <ListOrdered size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive("blockquote"))}
        type="button"
      >
        <Quote size={16} />
      </button>
      <div className="w-px h-4 bg-zinc-200 mx-1" />
      <button
        className="p-2 text-zinc-300 cursor-help"
        title="Type 'Book.1.1' to create a link"
        type="button"
      >
        <Link2 size={16} />
      </button>
    </div>
  );
};

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  placeholder = "Begin your hiddush...",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      DrashLink,
      Placeholder.configure({ placeholder }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc prose-sm focus:outline-none min-h-[500px] max-w-none text-ink font-serif-paper selection:bg-amber-200",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="relative">
      <Toolbar editor={editor} />
      <div className="bg-paper min-h-[600px] rounded-2xl">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
