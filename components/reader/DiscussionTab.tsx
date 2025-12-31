"use client";

import { cn } from "@/lib/utils/utils";
import { Verse } from "@/types/reader";
import {
  AtSign,
  Hash,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Send,
  Users,
} from "lucide-react";
import { useState } from "react";

interface DiscussionTabProps {
  context: "GLOBAL" | "GROUP" | "PRIVATE";
  activeVerse: Verse;
}

/**
 * DiscussionTab (v2.0)
 * Filepath: components/reader/DiscussionTab.tsx
 * Role: Community insights feed and chavruta composer.
 * PRD Alignment: Section 2.2 (Social Identity/Community).
 */

// Mock data representing the scholarship feed
const MOCK_INSIGHTS = [
  {
    id: "cmt_1",
    user: "Joseph B.",
    avatar: "JB",
    content:
      "Notice the repetition of the 'vav' here. In the midrashic tradition, this often signals a link between the mundane and the celestial.",
    likes: 12,
    time: "2h ago",
    isPro: true,
  },
  {
    id: "cmt_2",
    user: "Sarah L.",
    avatar: "SL",
    content:
      "Has anyone compared this to the Ramban's interpretation of the previous verse? There seems to be a conflict in the logic of time.",
    likes: 5,
    time: "5h ago",
    isPro: false,
  },
];

export const DiscussionTab = ({ context, activeVerse }: DiscussionTabProps) => {
  const [comment, setComment] = useState("");

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-2 duration-500 overflow-hidden">
      {/* 1. Feed Header */}
      <div className="flex items-center justify-between px-2 mb-6">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
          <Users size={12} className="text-amber-500" />
          {context} Layer • 14 Scholars
        </div>
      </div>

      {/* 2. Insights Feed */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
        {MOCK_INSIGHTS.map((item) => (
          <div key={item.id} className="group space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border",
                    item.isPro
                      ? "bg-zinc-950 text-white border-zinc-900"
                      : "bg-zinc-50 text-zinc-400 border-zinc-100"
                  )}
                >
                  {item.avatar}
                </div>
                <div>
                  <p className="text-[11px] font-black text-zinc-950 uppercase tracking-tight">
                    {item.user}{" "}
                    {item.isPro && (
                      <span className="text-amber-500 ml-1">★</span>
                    )}
                  </p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                    {item.time}
                  </p>
                </div>
              </div>
              <button className="p-1 text-zinc-300 hover:text-zinc-950 transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>

            <div className="p-5 bg-zinc-50/50 rounded-2xl border border-zinc-100/50 relative">
              <p className="text-xs text-zinc-700 leading-relaxed italic">
                &ldquo;{item.content}&rdquo;
              </p>

              <div className="flex items-center gap-4 mt-4">
                <button className="flex items-center gap-1.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-rose-500 transition-colors">
                  <Heart size={10} /> {item.likes}
                </button>
                <button className="text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-950 transition-colors">
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state hint if feed was empty */}
        {MOCK_INSIGHTS.length === 0 && (
          <div className="py-20 text-center opacity-30">
            <MessageSquare size={32} className="mx-auto mb-4 text-zinc-200" />
            <p className="text-[10px] font-black uppercase tracking-widest">
              The Scriptorium is Quiet
            </p>
          </div>
        )}
      </div>

      {/* 3. Chavruta Composer (PRD 2.2) */}
      <div className="mt-8 pt-6 border-t border-zinc-100">
        <div className="p-5 bg-white border border-zinc-200 rounded-[1.5rem] shadow-2xl shadow-zinc-200/50 focus-within:border-zinc-950 transition-all">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Share an insight on ${activeVerse.ref}...`}
            className="w-full bg-transparent border-none text-xs font-medium outline-none resize-none min-h-[80px] placeholder:text-zinc-300 leading-relaxed"
          />

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-50">
            <div className="flex gap-2">
              <button
                title="Mention Scholar"
                className="p-2 bg-zinc-50 hover:bg-zinc-950 hover:text-white rounded-lg text-zinc-400 transition-all"
              >
                <AtSign size={14} />
              </button>
              <button
                title="Cite Reference"
                className="p-2 bg-zinc-50 hover:bg-zinc-950 hover:text-white rounded-lg text-zinc-400 transition-all"
              >
                <Hash size={14} />
              </button>
            </div>

            <button
              disabled={!comment.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-zinc-950 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-800 disabled:opacity-20 active:scale-95 transition-all shadow-xl"
            >
              Post <Send size={12} className="text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
