import { createBrowserClient } from "@supabase/ssr";

/**
 * DrashX Supabase Browser Client
 * Role: Used for authentication and real-time features within Client Components.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
