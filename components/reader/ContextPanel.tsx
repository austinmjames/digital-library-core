// Filepath: src/components/reader/ContextPanel.tsx

import { CommentaryData, ReaderContext, Verse } from "@/lib/types/reader";
import { MessageSquare, NotebookPen, Sparkles, X } from "lucide-react";
import React, { useState } from "react";

// --- Mock Data (Ideally fetched via React Query in a real app) ---
const MOCK_COMMENTARY: CommentaryData = {
  global: [
    {
      id: 1,
      author: "Rashi",
      text: 'In the beginning: Said Rabbi Isaac: The Torah need not have started here, but from "This month shall be unto you..."',
    },
    {
      id: 2,
      author: "Ramban",
      text: "The act of creation is a deep mystery, hidden in the foundation of the world.",
    },
  ],
  dafyomi: [
    {
      id: 3,
      author: "Rav Cohen",
      text: "Notice how the creation of light precedes the creation of the luminaries. This is a spiritual light.",
    },
    {
      id: 4,
      author: "Sarah (Mod)",
      text: 'Reminder: We are discussing the philosophical implications of "Tohu vaVohu" on Zoom at 8pm.',
    },
  ],
  private: [
    {
      id: 5,
      author: "My Notes",
      text: "Idea for sermon: Chaos precedes order. The darkness is a canvas, not an enemy.",
    },
  ],
};

type PanelTab = "discuss" | "notes" | "ai";

interface ContextPanelProps {
  isOpen: boolean;
  activeVerse: Verse | null;
  onClose: () => void;
  context: ReaderContext;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  isOpen,
  activeVerse,
  onClose,
  context,
}) => {
  const [activeTab, setActiveTab] = useState<PanelTab>("discuss");

  // Filter commentary based on context
  const comments = MOCK_COMMENTARY[context] || [];

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 border-l border-zinc-200 transform transition-transform duration-300 ease-in-out flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-zinc-100">
        {(["discuss", "notes", "ai"] as PanelTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
                flex-1 py-4 flex flex-col items-center gap-1 transition-all relative
                ${
                  activeTab === tab
                    ? "text-orange-600 bg-orange-50/30"
                    : "text-zinc-400 hover:text-zinc-600"
                }
              `}
          >
            {tab === "discuss" && <MessageSquare size={16} />}
            {tab === "notes" && <NotebookPen size={16} />}
            {tab === "ai" && <Sparkles size={16} />}
            <span className="text-[9px] font-bold uppercase tracking-widest">
              {tab}
            </span>
            {activeTab === tab && (
              <div className="absolute bottom-0 w-full h-0.5 bg-orange-500" />
            )}
          </button>
        ))}
      </div>

      <div className="h-12 border-b border-zinc-100 flex items-center justify-between px-4 bg-zinc-50">
        <h3 className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
          {activeVerse ? activeVerse.ref : "Select Verse"}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-zinc-200 rounded text-zinc-500"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-zinc-50/50">
        {!activeVerse ? (
          <div className="text-center text-zinc-400 mt-20">
            <p>Select a verse to see {context} context.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Context Badge */}
            <div className="flex justify-center mb-4">
              <span className="bg-zinc-200 text-zinc-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Showing: {context}
              </span>
            </div>

            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-zinc-100"
              >
                <h4 className="font-bold text-sm text-zinc-800 mb-2 border-b border-zinc-50 pb-2 flex justify-between">
                  {comment.author}
                  <span className="text-[10px] text-zinc-400 font-normal">
                    2m ago
                  </span>
                </h4>
                <p className="text-sm text-zinc-600 font-serif leading-relaxed">
                  {comment.text}
                </p>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-center p-8 text-zinc-400">
                <p>No comments in this context yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-200 bg-white">
        <input
          type="text"
          placeholder={`Reply to ${context}...`}
          className="w-full bg-zinc-100 border-none rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>
    </aside>
  );
};
