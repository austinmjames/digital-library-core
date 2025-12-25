"use client";

import React from "react";

/**
 * components/reader/commentary/CommentaryFooter.tsx
 * Stateless informational footer for the Commentary Sidebar.
 */
export function CommentaryFooter() {
  return (
    <footer className="absolute bottom-0 left-0 right-0 p-6 border-t border-pencil/5 bg-paper/90 backdrop-blur-xl z-20 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-[10px] text-pencil/50 uppercase font-black tracking-widest">
          Verse Context
        </p>
        <p className="text-[9px] text-gold font-bold uppercase tracking-tighter italic">
          Sovereignty & Commentary
        </p>
      </div>
      <div className="text-right">
        <span className="text-[9px] font-bold text-pencil/30 uppercase tracking-widest">
          Synced Layers
        </span>
      </div>
    </footer>
  );
}
