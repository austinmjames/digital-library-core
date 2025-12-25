"use client";

import React from "react";
import { LogIn, UserPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AuthPromptProps {
  title?: string;
  description?: string;
  className?: string;
  ctaLabel?: string;
}

/**
 * components/auth/AuthPrompt.tsx
 * A standardized UI component for prompting guests to authenticate.
 * Features a tactile, premium design consistent with the DrashX aesthetic.
 */
export function AuthPrompt({
  title = "Unlock Personal Wisdom",
  description = "Sign in to capture your own insights, create commentary books, and collaborate with the community.",
  ctaLabel = "Sign In to Open Sanctuary",
  className,
}: AuthPromptProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-[2.5rem] bg-pencil/[0.02] border-2 border-dashed border-pencil/10 space-y-6 animate-in fade-in zoom-in-95 duration-500",
        className
      )}
    >
      <div className="w-16 h-16 rounded-[2rem] bg-paper shadow-sm border border-pencil/5 flex items-center justify-center relative">
        <LogIn className="w-7 h-7 text-pencil/40" />
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow-lg animate-pulse">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-serif font-bold text-xl text-ink leading-tight">
          {title}
        </h3>
        <p className="text-sm text-pencil/60 max-w-[240px] mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Button
          onClick={() => router.push("/login")}
          className="w-full h-12 bg-ink text-paper rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl active:scale-[0.98] transition-all"
        >
          {ctaLabel}
        </Button>

        <button
          onClick={() => router.push("/sign-up")}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-pencil/40 hover:text-ink transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Establish Account
        </button>
      </div>
    </div>
  );
}
