"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectCreationFormProps {
  name: string;
  setName: (val: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
  error?: string | null;
}

/**
 * ProjectCreationForm
 * Distraction-free input for starting a new translation project.
 * Features built-in error feedback and iOS-style input guarding.
 */
export function ProjectCreationForm({
  name,
  setName,
  onCancel,
  onSubmit,
  isProcessing,
  error,
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
          disabled={isProcessing}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., The Mystical Torah"
          className="w-full bg-white border border-gold/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-gold/5 font-serif shadow-sm disabled:opacity-50 transition-all placeholder:text-pencil/30"
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
      </div>

      {/* Inline Error Feedback */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <p className="text-[10px] font-bold uppercase tracking-tight leading-tight">
            {error}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="ghost"
          disabled={isProcessing}
          className="flex-1 h-10 text-[10px] font-bold uppercase tracking-widest text-pencil hover:bg-black/5"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 h-10 bg-gold hover:bg-gold/90 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gold/20 active:scale-95 transition-all"
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
