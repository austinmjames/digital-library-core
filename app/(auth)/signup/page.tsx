"use client";

import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

/**
 * DrashX Registration Page
 * Filepath: app/(auth)/signup/page.tsx
 * Role: Primary entry for the DrashX Creator Loop.
 * Design: Inverse Theme branding with Paper container.
 */

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGoogleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      setIsSuccess(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred during registration";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-500 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

          <div className="relative">
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-emerald-50 text-emerald-500 rounded-full ring-8 ring-emerald-50/50">
                <CheckCircle2
                  size={48}
                  strokeWidth={1.5}
                  className="animate-bounce"
                />
              </div>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-widest text-zinc-900 mb-4">
              Check Your Email
            </h2>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-10">
              A verification link is on its way to <br />
              <span className="text-zinc-900 font-bold underline decoration-zinc-200 underline-offset-4">
                {email}
              </span>
              .
            </p>

            <button
              onClick={() => router.push("/login")}
              className="w-full bg-zinc-950 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-[0.25em] hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
            >
              Return to Entrance
            </button>

            <p className="mt-8 text-[10px] text-zinc-400 font-bold uppercase tracking-widest opacity-50">
              The Digital Beit Midrash awaits.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 selection:bg-zinc-950 selection:text-white">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Brand Header: PRD Leather Binding Aesthetic */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="p-4 bg-zinc-950 text-white rounded-2xl mb-4 shadow-2xl border border-white/10 ring-4 ring-zinc-950/5">
            <BookOpen size={36} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-[0.3em] text-zinc-900">
            DrashX
          </h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">
            Create Your Scholarship Profile
          </p>
        </div>

        {/* Auth Modal Container: Standard DrashCard Token */}
        <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

          <div className="relative space-y-6">
            {/* Social Provider (Primary Action per PRD) */}
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-zinc-200 p-4 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all font-bold text-sm text-zinc-700 active:scale-[0.98] disabled:opacity-50 group"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:scale-110"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Join with Google
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-4">
              <div className="flex-grow h-[1px] bg-zinc-100"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                Or initialize manually
              </span>
              <div className="flex-grow h-[1px] bg-zinc-100"></div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {error}
                </div>
              )}

              {/* Full Name: DrashInput Implementation */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Public Display Name
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-900 transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950 outline-none transition-all text-sm font-medium"
                    placeholder="e.g. Seeker of Truth"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-900 transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950 outline-none transition-all text-sm font-medium"
                    placeholder="talmid@drashx.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Secure Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-900 transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950 outline-none transition-all text-sm font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Action: DrashButton Implementation */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-950 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl active:scale-[0.97] disabled:opacity-50 mt-4 group"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Initialize Account{" "}
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Transition Link */}
            <div className="pt-6 text-center">
              <p className="text-xs text-zinc-400 font-medium">
                Already a scholar?{" "}
                <button
                  onClick={() => router.push("/login")}
                  className="font-bold text-zinc-900 hover:underline underline-offset-4 decoration-2 transition-all"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-12 text-[10px] text-zinc-400 text-center uppercase tracking-widest leading-loose max-w-xs mx-auto opacity-50">
          The DrashX project is built for the <br /> persistence of eternal
          wisdom.
        </p>
      </div>
    </div>
  );
}
