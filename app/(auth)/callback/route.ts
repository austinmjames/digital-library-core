import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * DrashX Auth Callback Handler
 * Role: Exchanges the auth code for a session and redirects the user.
 * Fix: Added 'await' to createClient() to resolve the Promise-based client error.
 */

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // 'next' allows dynamic redirection after successful verification
  const next = searchParams.get("next") ?? "/library";

  if (code) {
    // Because createClient in server.ts is async, we must await it here.
    const supabase = await createClient();

    // Exchange the code for a permanent session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there is an error or no code, redirect to an error page or login
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
