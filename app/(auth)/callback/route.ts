import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth Callback Handler (DrashX v1.0)
 * Filepath: app/auth/callback/route.ts
 * Role: Exchanges verification code for session and manages onboarding redirection.
 * PRD Reference: Section 2.2 (Authentication & Onboarding).
 */

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/library";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Fetch profile to verify onboarding completion per PRD requirements
      const { data: profile } = await supabase
        .from("users")
        .select("onboarding_complete")
        .eq("id", data.user.id)
        .single();

      // Redirect to Onboarding Wizard if profile is incomplete
      const redirectUrl = profile?.onboarding_complete ? next : "/onboarding";

      // Secure internal redirect
      const safeRedirect = redirectUrl.startsWith("/")
        ? `${origin}${redirectUrl}`
        : `${origin}/library`;

      return NextResponse.redirect(safeRedirect);
    }
  }

  // Fallback for verification failures
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
