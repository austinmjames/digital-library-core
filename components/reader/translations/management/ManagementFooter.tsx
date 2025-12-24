"use client";

import { Info } from "lucide-react";

/**
 * components/reader/translations/management/ManagementFooter.tsx
 * High-level information regarding the Sovereignty Hierarchy.
 */
export function ManagementFooter() {
  return (
    <footer className="p-6 rounded-[2rem] bg-indigo-600/[0.03] border border-indigo-600/10 mt-8">
      <h5 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
        <Info className="w-3.5 h-3.5" /> Project Hierarchy
      </h5>
      <p className="text-[11px] text-indigo-800/70 leading-relaxed font-medium italic">
        Your interpretation projects act as high-priority layers in the reader.
        When active, your custom verses will replace the base translation in
        real-time.
      </p>
    </footer>
  );
}
