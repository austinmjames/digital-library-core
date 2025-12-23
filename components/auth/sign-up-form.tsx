"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

/**
 * components/auth/sign-up-form.tsx
 * Path corrected to /login to avoid 404 from route group.
 */
export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 animate-in fade-in duration-500">
        <h2 className="text-xl font-serif font-bold text-ink border-b border-gold/20 pb-2">
          Verify your Email
        </h2>
        <p className="text-sm text-pencil">
          We&apos;ve sent a magic link to{" "}
          <span className="text-ink font-medium">{email}</span>. Please check
          your inbox to complete your registration.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSignUp}>
        <div className="grid gap-4">
          <div className="grid gap-2 text-left">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white"
            />
          </div>
          <div className="grid gap-2 text-left">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white"
            />
          </div>
          {error && (
            <p className="text-xs text-destructive bg-destructive/5 p-2 rounded border border-destructive/10 text-center">
              {error}
            </p>
          )}
          <Button
            disabled={loading}
            className="w-full bg-ink text-paper hover:bg-charcoal transition-all"
          >
            {loading ? "Creating Sanctuary..." : "Join TorahPro"}
          </Button>
        </div>
      </form>
      <div className="text-center text-sm text-pencil">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-gold font-medium hover:underline decoration-gold/30 underline-offset-4"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
