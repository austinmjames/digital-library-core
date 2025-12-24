import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * lib/supabase/server.ts
 * Bypasses strict URL/Key validation during Vercel's build workers.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-key";

  return createServerClient(url, key, {
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
          // This catch is actually intended for build-time safety
        }
      },
    },
  });
}
