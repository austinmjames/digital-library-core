"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateClick: () => void;
}

/**
 * components/reader/translations/management/EmptyState.tsx
 * Visual feedback for users with no active Sovereignty projects.
 */
export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="py-16 text-center border-2 border-dashed border-pencil/10 rounded-[2.5rem] bg-pencil/[0.01] px-8">
      <Sparkles className="w-10 h-10 text-pencil/10 mx-auto mb-4" />
      <h5 className="font-serif font-bold text-ink mb-1">No Projects Found</h5>
      <p className="text-xs text-pencil/60 leading-relaxed mb-6">
        Sovereignty starts with a single word. Create your first translation
        project to begin interpretation.
      </p>
      <Button
        onClick={onCreateClick}
        className="rounded-full bg-ink text-paper px-8 h-11 font-bold text-xs uppercase tracking-widest shadow-xl"
      >
        Start Your First Project
      </Button>
    </div>
  );
}
