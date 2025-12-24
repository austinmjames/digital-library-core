export const dynamic = "force-dynamic";

import SignUpForm from "@/components/auth/sign-up-form";

/**
 * app/(auth)/sign-up/page.tsx
 * Added force-dynamic to prevent Vercel build-time Supabase errors.
 */
export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-ink">
          Create Account
        </h1>
        <p className="text-sm text-pencil">
          Join the collaborative study community
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
