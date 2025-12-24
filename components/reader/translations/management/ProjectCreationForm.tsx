"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectCreationFormProps {
  name: string;
  setName: (val: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

/**
 * components/reader/translations/management/ProjectCreationForm.tsx
 * Isolated form for starting a new interpretation project.
 */
export function ProjectCreationForm({
  name,
  setName,
  onCancel,
  onSubmit,
  isProcessing,
}: ProjectCreationFormProps) {
  return (
    <div className="p-5 rounded-[1.8rem] bg-gold/5 border border-gold/10 animate-in zoom-in-95 duration-300 space-y-4 shadow-inner">
      <div className="space-y-2">
        <label className="text-[9px] font-black text-gold uppercase tracking-[0.2em] ml-1">
          Project Title
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., The Mystical Torah"
          className="w-full bg-white border border-gold/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-gold/5 font-serif shadow-sm"
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          className="flex-1 h-10 text-[10px] font-bold uppercase tracking-widest text-pencil"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 h-10 bg-gold hover:bg-gold/90 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gold/20"
          onClick={onSubmit}
          disabled={isProcessing || !name.trim()}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Start Project"
          )}
        </Button>
      </div>
    </div>
  );
}
