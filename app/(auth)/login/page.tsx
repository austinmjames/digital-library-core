export const dynamic = "force-dynamic";

// ... rest of your file
import LoginForm from "@/components/auth/login-form";

/**
 * app/(auth)/login/page.tsx
 * Uses the default import for LoginForm to resolve the exported member error.
 */
export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-ink">Welcome Back</h1>
        <p className="text-sm text-pencil">
          Enter your credentials to access your library
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
