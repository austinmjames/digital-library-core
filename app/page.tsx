"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, UserCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/context/auth-context";

/**
 * app/page.tsx
 * Updated Landing Page with restored navigation and auth-aware buttons.
 */
export default function LandingPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-paper relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent" />

      <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10">
        <div className="mx-auto w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-gold mb-6 border border-gold/20">
          <BookOpen className="w-8 h-8" />
        </div>

        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-ink">
          OpenTorah
        </h1>

        <p className="text-xl text-pencil leading-relaxed font-english">
          A digital sanctuary for Jewish texts. Experience the depth of
          tradition with the power of modern collaborative study and personal
          sovereignty.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/library">
            <Button
              size="lg"
              className="rounded-full px-8 h-12 text-base bg-ink text-paper hover:bg-charcoal shadow-lg hover:shadow-xl transition-all gap-2"
            >
              Browse Library
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          {!isLoading && !user ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-12 text-base border-pencil/30 hover:border-ink hover:bg-transparent bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full px-8 h-12 text-base text-gold hover:text-gold/80"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          ) : !isLoading && user ? (
            <Link href="/profile">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-12 text-base border-pencil/30 gap-2"
              >
                <UserCircle className="w-5 h-5" />
                My Profile
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      <footer className="absolute bottom-8 text-[10px] text-pencil/40 uppercase tracking-[0.2em] font-bold">
        Built for collaborative wisdom
      </footer>
    </div>
  );
}
