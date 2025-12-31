import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase Browser Client Factory (v2.1 - Build Safe)
 * Filepath: lib/supabase/client.ts
 * Role: Provides a Supabase client for Client Components.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Client-side Supabase keys are missing.");
  }

  return createBrowserClient(supabaseUrl || "", supabaseKey || "");
}
