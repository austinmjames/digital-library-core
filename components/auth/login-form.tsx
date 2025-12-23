"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, MailCheck } from "lucide-react";

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  initialEmail?: string;
  initialPassword?: string;
}

/**
 * components/auth/login-form.tsx
 * Updated to handle unconfirmed emails by offering a resend option.
 */
export default function LoginForm({
  className,
  initialEmail = "",
  initialPassword = "",
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setEmail(initialEmail);
    setPassword(initialPassword);
  }, [initialEmail, initialPassword]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setShowResend(false);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      router.push("/library");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);

      // If error indicates email needs confirmation, show the resend option
      if (
        message.toLowerCase().includes("confirm") ||
        message.toLowerCase().includes("verified")
      ) {
        setShowResend(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) return;
    setIsResending(true);
    setError(null);

    const supabase = createClient();
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (resendError) throw resendError;
      setResendSuccess(true);
      setShowResend(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend confirmation email"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-pencil/10 shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Login</CardTitle>
          <CardDescription>
            {resendSuccess
              ? "Confirmation link sent! Please check your inbox."
              : "Use your email to access your personal library."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resendSuccess ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <MailCheck className="w-6 h-6" />
              </div>
              <p className="text-sm text-pencil max-w-[240px]">
                We sent a new verification link to{" "}
                <span className="text-ink font-bold">{email}</span>.
              </p>
              <Button
                variant="ghost"
                onClick={() => setResendSuccess(false)}
                className="text-xs font-bold text-gold uppercase tracking-widest"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2 text-left">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-paper"
                  />
                </div>
                <div className="grid gap-2 text-left">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="ml-auto inline-block text-sm text-gold hover:underline underline-offset-4"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-paper"
                  />
                </div>
                {error && (
                  <div className="space-y-3">
                    <p className="text-xs text-destructive bg-destructive/5 p-2 rounded border border-destructive/10 text-center animate-in fade-in slide-in-from-top-1">
                      {error}
                    </p>
                    {showResend && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendConfirmation}
                        disabled={isResending}
                        className="w-full text-xs border-gold/20 text-gold hover:bg-gold/5"
                      >
                        {isResending ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-2" />
                        ) : null}
                        Resend Confirmation Email
                      </Button>
                    )}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-ink text-paper hover:bg-charcoal transition-all active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Open Sanctuary"}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm text-pencil">
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  className="text-gold font-bold hover:underline underline-offset-4"
                >
                  Create Account
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
