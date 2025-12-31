import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * DrashX Auth Callback Handler
 * Role: Exchanges auth code for session and handles Onboarding vs. Library redirection.
 * PRD Reference: Authentication & Onboarding (Section 2.2)
 */

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/library";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check for onboarding completion to satisfy PRD Onboarding Wizard requirement
      const { data: profile } = await supabase
        .from("users")
        .select("onboarding_complete")
        .eq("id", data.user.id)
        .single();

      // If onboarding isn't complete, override 'next' to the wizard
      const redirectUrl = profile?.onboarding_complete ? next : "/onboarding";

      // Ensure the redirect is internal to prevent open-redirect vulnerabilities
      const safeRedirect = redirectUrl.startsWith("/")
        ? `${origin}${redirectUrl}`
        : `${origin}/library`;

      return NextResponse.redirect(safeRedirect);
    }
  }

  // Fallback for failed verification
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
