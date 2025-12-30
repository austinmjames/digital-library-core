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
 * Filepath: src/app/(auth)/signup/page.tsx
 * Theme: Paper (Minimalist, Sophisticated)
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
          // Ensure the user is redirected to the callback handler after clicking the email link
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
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-10 shadow-sm animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-900 mb-4">
            Check Your Email
          </h2>
          <p className="text-zinc-500 mb-8 leading-relaxed">
            We&rsquo;ve sent a verification link to{" "}
            <span className="font-bold text-zinc-900">{email}</span>. Please
            confirm your account to access the library.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-zinc-950 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="p-4 bg-zinc-950 text-white rounded-2xl mb-4 shadow-xl">
            <BookOpen size={32} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-zinc-900">
            DrashX
          </h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-tighter mt-1">
            Join the Digital Beit Midrash
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300"
                  size={18}
                />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 outline-none transition-all"
                  placeholder="Yisrael ben Avraham"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 outline-none transition-all"
                  placeholder="talmid@drashx.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300"
                  size={18}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-950 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Initialize Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-500">
              Already a scholar?{" "}
              <button
                onClick={() => router.push("/login")}
                className="font-bold text-zinc-900 hover:underline transition-all"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
