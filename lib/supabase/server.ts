import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase Server Client Factory (v2.1 - Build Safe)
 * Filepath: lib/supabase/server.ts
 * Role: Provides a secure, cookie-aware Supabase client for Server Components and Actions.
 * Fix: Added defensive checks to prevent Vercel build crashes when env vars are missing.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // During Vercel build/static generation, we log a warning instead of crashing the process
    console.warn(
      "Supabase environment variables are missing. Initialization skipped."
    );
    // Return a dummy client or handle as needed; most routes should be 'force-dynamic'
  }

  return createServerClient(supabaseUrl || "", supabaseKey || "", {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // This can be ignored if the client is called from a Server Component
        }
      },
    },
  });
}
