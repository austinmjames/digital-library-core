import { FileCode, FileText, Globe } from "lucide-react";
import React from "react";

/**
 * ExportMenu Component
 * Role: Phase 3 Manuscript Export.
 */

export const ExportMenu: React.FC<{ title: string; content: string }> = ({
  title,
  content,
}) => {
  const exportAsMarkdown = () => {
    // Basic HTML to MD conversion logic
    const markdown = `# ${title}\n\n${content.replace(/<[^>]*>/g, "")}`;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.md`;
    a.click();
  };

  return (
    <div className="p-2 bg-white border border-zinc-200 rounded-2xl shadow-xl w-56 animate-in slide-in-from-top-2">
      <p className="px-3 py-2 text-[9px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-50">
        Export Manuscript
      </p>
      <div className="mt-1">
        <button
          onClick={exportAsMarkdown}
          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl text-xs font-medium text-zinc-700 transition-all"
        >
          <FileCode size={14} className="text-zinc-400" />
          Markdown (.md)
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl text-xs font-medium text-zinc-700 transition-all">
          <FileText size={14} className="text-zinc-400" />
          Plain Text (.txt)
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl text-xs font-medium text-zinc-700 transition-all opacity-50 cursor-not-allowed">
          <Globe size={14} className="text-zinc-400" />
          Publish to Community
        </button>
      </div>
    </div>
  );
};
