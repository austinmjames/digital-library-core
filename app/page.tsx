export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

/**
 * app/page.tsx
 * The root landing page.
 * Ensure it has an 'export default' function to resolve the /page error.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-paper relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent" />

      <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10">
        <div className="mx-auto w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-gold mb-6 border border-gold/20">
          <BookOpen className="w-8 h-8" />
        </div>

        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-ink">
          TorahPro
        </h1>

        <p className="text-xl text-pencil leading-relaxed font-english">
          A digital sanctuary for Jewish texts. Experience the depth of
          tradition with the power of modern collaborative study.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/library">
            <Button
              size="lg"
              className="rounded-full px-8 h-12 text-base bg-ink text-paper hover:bg-charcoal shadow-lg hover:shadow-xl transition-all"
            >
              Browse Library
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-12 text-base border-pencil/30 hover:border-ink hover:bg-transparent bg-transparent"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
