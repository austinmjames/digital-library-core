export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

/**
 * app/not-found.tsx
 * Standard Next.js component for handling 404 errors.
 */
export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-6 text-center bg-paper animate-in fade-in duration-700">
      <div className="max-w-md space-y-6">
        <div className="mx-auto w-16 h-16 bg-pencil/5 rounded-full flex items-center justify-center text-pencil/40 mb-2">
          <SearchX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-bold text-ink">
            Text Not Found
          </h1>
          <p className="text-pencil font-english leading-relaxed">
            The passage or page you are looking for does not exist in our
            library or has been moved to a new collection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/library">
            <Button className="w-full sm:w-auto rounded-full bg-ink text-paper hover:bg-charcoal px-8">
              Open Library
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full sm:w-auto rounded-full text-pencil hover:text-ink"
            >
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
