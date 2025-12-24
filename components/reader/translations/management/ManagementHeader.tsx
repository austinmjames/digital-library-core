"use client";

import { Plus, ChevronLeft } from "lucide-react";

interface ManagementHeaderProps {
  onBack?: () => void;
  isCreating: boolean;
  onCreateClick: () => void;
}

export function ManagementHeader({
  onBack,
  isCreating,
  onCreateClick,
}: ManagementHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-4 px-1">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-pencil/5 rounded-full transition-all active:scale-75"
          >
            <ChevronLeft className="w-5 h-5 text-pencil" />
          </button>
        )}
        <h4 className="font-serif font-bold text-xl text-ink tracking-tight">
          My Projects
        </h4>
      </div>

      {!isCreating && (
        <button
          onClick={onCreateClick}
          className="p-2 rounded-full bg-ink text-paper shadow-xl hover:bg-charcoal transition-all active:scale-75 ml-1"
          title="New Project"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </header>
  );
}
