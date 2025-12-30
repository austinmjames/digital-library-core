"use client";

import { createClient } from "@/lib/supabase/client";
import { ArrowRight, BookOpen, Loader2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

/**
 * DrashX Login Page
 * Filepath: src/app/(auth)/login/page.tsx
 * Role: Authentication entry point with redirection to registration.
 */

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient(); // Initialize the browser client

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      router.push("/library");
      router.refresh();
    } catch (err) {
      // Type-safe error message extraction
      const errorMessage =
        err instanceof Error ? err.message : "Invalid login credentials";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
            The Digital Beit Midrash
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                {error}
              </div>
            )}

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
                  placeholder="admin@drashx.com"
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
                  Access Library <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-500">
              Need an account?{" "}
              <button
                onClick={() => router.push("/signup")}
                className="font-bold text-zinc-900 hover:underline transition-all"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
