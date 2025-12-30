import { Loader2 } from "lucide-react";

/**
 * Global Loading Page
 * Filepath: app/loading.tsx
 * Role: Phase 1 Bedrock - UX.
 * Purpose: Provides a smooth, themed transition during initial data hydration.
 */

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full bg-paper">
      <div className="relative">
        {/* Animated Rings */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-100 animate-ping opacity-25"></div>
        <div className="relative bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      </div>

      <div className="mt-8 text-center space-y-2">
        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">
          Opening the Scroll
        </h2>
        <p className="text-[10px] text-zinc-400 font-medium italic">
          Preparing your digital Beit Midrash...
        </p>
      </div>
    </div>
  );
}
