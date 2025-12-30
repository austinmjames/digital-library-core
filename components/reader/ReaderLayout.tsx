// Filepath: src/components/reader/ReaderLayout.tsx

import { Theme } from "@/types/reader";
import React from "react";

interface ReaderLayoutProps {
  children: React.ReactNode;
  sideNav: React.ReactNode;
  header: React.ReactNode;
  sidePanel: React.ReactNode;
  theme: Theme;
}

export const ReaderLayout: React.FC<ReaderLayoutProps> = ({
  children,
  header,
  sidePanel,
  theme,
}) => {
  return (
    <div
      className={`flex h-screen w-full font-sans overflow-hidden transition-colors duration-500
      ${theme === "paper" ? "bg-[#faf9f6] text-zinc-900" : ""}
      ${theme === "sepia" ? "bg-[#f4ecd8] text-[#5b4636]" : ""}
      ${theme === "dark" ? "bg-zinc-950 text-zinc-200" : ""}
    `}
    >
      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col h-full relative">
        {header}

        {/* Scrollport Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar pb-20 relative">
          <div className="max-w-4xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* 3. Context Panel */}
      {sidePanel}

      {/* Mobile Nav Fallback Placeholder (Optional) */}
    </div>
  );
};
