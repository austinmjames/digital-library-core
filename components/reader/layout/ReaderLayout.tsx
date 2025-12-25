import React from "react";
import { cn } from "@/lib/utils";

interface ReaderLayoutProps {
  children: React.ReactNode;
  isPanelOpen: boolean;
  header: React.ReactNode;
  sidePanels: React.ReactNode;
}

/**
 * ReaderLayout
 * The structural shell for the Interactive Reader.
 * Handles the responsive sliding transition when side panels are toggled.
 */
export function ReaderLayout({
  children,
  isPanelOpen,
  header,
  sidePanels,
}: ReaderLayoutProps) {
  // Calculate margins to shift content when panels open on desktop
  // Matches new widths in MasterPanel: md:w-[480px] lg:w-[550px]
  const slideClass = isPanelOpen ? "md:mr-[480px] lg:mr-[550px]" : "";

  return (
    <div className="min-h-screen bg-paper transition-colors duration-500 overflow-x-hidden relative">
      {sidePanels}

      {/* Fixed Header with transition */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-spring",
          slideClass
        )}
      >
        {header}
      </div>

      {/* Main Content with transition */}
      <main
        className={cn(
          "transition-all duration-300 ease-spring pt-14",
          slideClass
        )}
      >
        {children}
      </main>
    </div>
  );
}
