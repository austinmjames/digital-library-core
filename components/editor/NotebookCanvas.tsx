"use client";

import { TipTapEditor } from "@/components/editor/TipTapEditor";

interface NotebookCanvasProps {
  content: string;
  onChange: (html: string) => void;
}

/**
 * NotebookCanvas
 * Filepath: components/editor/NotebookCanvas.tsx
 * Role: The free-form Rich Text editor for drash projects.
 */
export const NotebookCanvas = ({ content, onChange }: NotebookCanvasProps) => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-12 animate-in fade-in duration-700">
      <TipTapEditor
        content={content}
        onChange={onChange}
        placeholder="Start typing your drash..."
      />
    </div>
  );
};
