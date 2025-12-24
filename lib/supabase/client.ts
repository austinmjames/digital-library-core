import { createBrowserClient } from "@supabase/ssr";

/**
 * lib/supabase/client.ts
 * "Nuclear Option" for Vercel Builds.
 * Guaranteed to return a valid-looking object to the compiler even if ENV is missing.
 */
export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-key";

  return createBrowserClient(url, key);
}
