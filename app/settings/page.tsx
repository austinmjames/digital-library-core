"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Columns,
  CreditCard,
  Key,
  Loader2,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Rows,
  Save,
  Shield,
  Sun,
  Trash2,
  Type,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Settings Orchestrator (v2.9 - Dark Mode Optimized & Adaptive Layout)
 * Filepath: app/settings/page.tsx
 * Role: Primary dashboard for Membership, Visual Preferences, and Authentication.
 * Features: Stack vs Side-by-Side, 1.5x Hebrew scaling, Live Theme syncing.
 * Fixes: Dark mode contrast for selectors, compact grid re-ordering.
 */

type ThemeMode = "system" | "light" | "dark";
type TranslationMode = "en" | "mixed" | "he";
type LayoutMode = "stack" | "side-by-side";
type SettingsTab = "billing" | "appearance" | "notifications" | "security";

interface ProfileWithPreferences {
  theme?: string;
  translation_mode?: string;
  font_size?: number;
  layout?: string;
  tier?: string;
  username?: string;
}

interface PasswordBuffer {
  new: string;
  confirm: string;
}

export default function App() {
  const router = useRouter();
  const { isLoading: authLoading, profile: userProfile, user } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Appearance & Reader State
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [translationMode, setTranslationMode] =
    useState<TranslationMode>("mixed");
  const [fontSize, setFontSize] = useState<number>(18);
  const [layout, setLayout] = useState<LayoutMode>("stack");

  // Security State
  const [passwordBuffer, setPasswordBuffer] = useState<PasswordBuffer>({
    new: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Synchronize local state with the user's registry profile
  useEffect(() => {
    if (userProfile) {
      const profile = userProfile as ProfileWithPreferences;
      if (profile.theme) setTheme(profile.theme as ThemeMode);
      if (profile.translation_mode)
        setTranslationMode(profile.translation_mode as TranslationMode);
      if (profile.font_size) setFontSize(profile.font_size);
      if (profile.layout) setLayout(profile.layout as LayoutMode);
    }
  }, [userProfile]);

  // Apply Theme to Document Root Protocol
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }, [theme]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handlePreferenceUpdate = async (updates: {
    theme?: ThemeMode;
    translation_mode?: TranslationMode;
    font_size?: number;
    layout?: LayoutMode;
  }) => {
    if (!user) return;

    // Optimistic UI updates
    if (updates.theme) setTheme(updates.theme);
    if (updates.translation_mode) setTranslationMode(updates.translation_mode);
    if (updates.font_size) setFontSize(updates.font_size);
    if (updates.layout) setLayout(updates.layout);

    const { error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("δ Registry Error: Preference sync failed.", error);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!user) return;
    if (passwordBuffer.new !== passwordBuffer.confirm) {
      setPasswordError("Confirm password mismatch.");
      return;
    }
    if (passwordBuffer.new.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setIsSaving(true);
    setPasswordError(null);

    const { error } = await supabase.auth.updateUser({
      password: passwordBuffer.new,
    });

    if (error) {
      setPasswordError(error.message);
    } else {
      setSaveSuccess(true);
      setPasswordBuffer({ new: "", confirm: "" });
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error: profileError } = await supabase
      .from("users")
      .delete()
      .eq("id", user.id);

    if (!profileError) {
      await supabase.auth.signOut();
      router.push("/");
    } else {
      console.error("δ Critical: Account deletion failed.", profileError);
      setIsSaving(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[var(--paper)] gap-4 text-center">
        <Loader2
          className="w-10 h-10 animate-spin text-[var(--accent-primary)]"
          strokeWidth={2}
        />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ink-muted)]">
          Synchronizing Registry...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] selection:bg-blue-100 selection:text-blue-900 pb-32 transition-colors duration-500">
      {/* 1. Account Deletion Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--ink)]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-3xl border-2 border-rose-600 animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-5 bg-rose-50 rounded-3xl text-rose-600">
                <AlertTriangle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-rose-900">
                  Delete Account?
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed px-4 font-sans">
                  This action is permanent. Your profile and access credentials
                  will be expunged. Scholarly works will be archived without an
                  author link.
                </p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isSaving}
                  className="w-full py-4 bg-rose-600 text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-rose-700 active:scale-95 transition-all"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin mx-auto" />
                  ) : (
                    "Expunge My Identity"
                  )}
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-4 text-zinc-400 text-[11px] font-black uppercase tracking-[0.3em] hover:text-zinc-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 pt-16 space-y-12 animate-in fade-in duration-1000">
        <header className="space-y-4 border-b border-[var(--border-subtle)] pb-10">
          <h1 className="text-4xl font-bold text-[var(--ink)] tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-[var(--ink-muted)] font-normal leading-relaxed max-w-xl border-l-2 border-[var(--accent-primary)]/20 pl-6 font-sans">
            Refine your digital scholarship environment. Configure visual
            themes, translation logic, and security protocols.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar Nav with Integrated Sign Out */}
          <aside className="w-full lg:w-72 shrink-0 flex flex-col">
            <div className="space-y-1.5 flex-grow">
              {[
                { id: "appearance", label: "Display", icon: Palette },
                { id: "billing", label: "Membership", icon: CreditCard },
                { id: "notifications", label: "Alerts", icon: Bell },
                { id: "security", label: "Security", icon: Shield },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-4 rounded-full transition-all group active:scale-95",
                    activeTab === tab.id
                      ? "bg-[var(--accent-primary)] text-white shadow-lg shadow-blue-500/20"
                      : "text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <tab.icon
                      size={18}
                      strokeWidth={activeTab === tab.id ? 2.5 : 2}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-widest">
                      {tab.label}
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className={cn(
                      "transition-transform group-hover:translate-x-1",
                      activeTab === tab.id ? "opacity-40" : "opacity-0"
                    )}
                  />
                </button>
              ))}

              {/* Sign Out directly below items */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-95 group mt-4 border-t border-[var(--border-subtle)] pt-6"
              >
                <LogOut
                  size={18}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Sign Out
                </span>
              </button>
            </div>
          </aside>

          {/* 4. Content Area */}
          <div className="flex-grow max-w-2xl">
            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                {/* Theme Protocol - Compact Darkmode-Aware Tiles */}
                <section className="paper-card p-6 space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <Palette
                      size={16}
                      className="text-[var(--accent-primary)]"
                    />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                      Visual Environment
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "light", label: "Light", icon: Sun },
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "system", label: "System", icon: Monitor },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() =>
                          handlePreferenceUpdate({
                            theme: option.id as ThemeMode,
                          })
                        }
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group active:scale-95",
                          theme === option.id
                            ? "border-[var(--accent-primary)] bg-blue-50/30 dark:bg-zinc-800 dark:border-[var(--accent-primary)]"
                            : "border-[var(--border-subtle)] bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700"
                        )}
                      >
                        <option.icon
                          size={18}
                          className={cn(
                            theme === option.id
                              ? "text-[var(--accent-primary)]"
                              : "text-zinc-300 group-hover:text-zinc-500 dark:group-hover:text-zinc-400"
                          )}
                        />
                        <span
                          className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            theme === option.id
                              ? "text-[var(--ink)]"
                              : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                          )}
                        >
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Reader Logic Grid (Translation + Layout) */}
                <section className="paper-card p-6 space-y-8">
                  <div className="flex items-center gap-3 px-2">
                    <Type size={16} className="text-[var(--accent-primary)]" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                      Reader Logic
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Translation Toggle */}
                    <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        Translation Layer
                      </label>
                      <div className="bg-zinc-50 dark:bg-zinc-900 p-1 rounded-[1.5rem] flex gap-1 border border-zinc-100 dark:border-zinc-800">
                        {[
                          { id: "en", symbol: "A" },
                          { id: "mixed", symbol: "A/א" },
                          { id: "he", symbol: "א" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() =>
                              handlePreferenceUpdate({
                                translation_mode: opt.id as TranslationMode,
                              })
                            }
                            className={cn(
                              "flex-1 py-3 rounded-2xl flex items-center justify-center transition-all active:scale-95",
                              translationMode === opt.id
                                ? "bg-white dark:bg-zinc-800 text-[var(--ink)] shadow-md border border-zinc-200 dark:border-zinc-700"
                                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            )}
                          >
                            <span
                              className={cn(
                                "font-black tracking-tight",
                                opt.id === "he" ||
                                  (opt.id === "mixed" &&
                                    opt.symbol.includes("א"))
                                  ? "text-2xl"
                                  : "text-sm"
                              )}
                            >
                              {opt.symbol}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layout Toggle */}
                    <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        Spatial Layout
                      </label>
                      <div className="bg-zinc-50 dark:bg-zinc-900 p-1 rounded-[1.5rem] flex gap-1 border border-zinc-100 dark:border-zinc-800">
                        {[
                          { id: "stack", icon: Rows },
                          { id: "side-by-side", icon: Columns },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() =>
                              handlePreferenceUpdate({
                                layout: opt.id as LayoutMode,
                              })
                            }
                            className={cn(
                              "flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95",
                              layout === opt.id
                                ? "bg-white dark:bg-zinc-800 text-[var(--ink)] shadow-md border border-zinc-200 dark:border-zinc-700"
                                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            )}
                          >
                            <opt.icon size={14} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Typography Sizer - Isolated Row */}
                  <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        Typography Scale
                      </label>
                      <span className="text-[11px] font-black text-[var(--accent-primary)]">
                        {fontSize}px
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-[9px] font-black uppercase text-zinc-400">
                        Min
                      </span>
                      <input
                        type="range"
                        min="12"
                        max="32"
                        step="1"
                        value={fontSize}
                        onChange={(e) =>
                          handlePreferenceUpdate({
                            font_size: parseInt(e.target.value),
                          })
                        }
                        className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[var(--accent-primary)]"
                      />
                      <span className="text-[9px] font-black uppercase text-zinc-400">
                        Max
                      </span>
                    </div>
                  </div>

                  {/* Registry Preview Container (Fixed Container Size) */}
                  <div className="h-[320px] bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-inner overflow-hidden flex flex-col">
                    <header className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        Registry Snapshot: Genesis 1:1-2
                      </span>
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                      <div
                        className={cn(
                          "transition-all duration-500 gap-10",
                          layout === "side-by-side"
                            ? "flex items-start"
                            : "flex flex-col"
                        )}
                      >
                        {/* Hebrew Sample (1.5x) */}
                        {(translationMode === "he" ||
                          translationMode === "mixed") && (
                          <div
                            dir="rtl"
                            className="font-serif leading-snug text-zinc-900 dark:text-zinc-100 flex-1 text-right"
                            style={{ fontSize: `${fontSize * 1.5}px` }}
                          >
                            בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת
                            הַאָרֶץ׃ וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ
                            עַל־פְּנֵי תְהוֹם׃
                          </div>
                        )}

                        {/* English Sample */}
                        {(translationMode === "en" ||
                          translationMode === "mixed") && (
                          <div
                            className="font-sans leading-relaxed text-zinc-600 dark:text-zinc-400 flex-1"
                            style={{ fontSize: `${fontSize}px` }}
                          >
                            In the beginning God created the heaven and the
                            earth. And the earth was without form, and void; and
                            darkness was upon the face of the deep.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <section className="paper-card p-10 space-y-10">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-3xl text-amber-600 shadow-inner">
                      <Key size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight uppercase text-zinc-900 dark:text-zinc-100">
                        Access Protocol
                      </h3>
                      <p className="text-xs text-zinc-500 font-sans">
                        Update your scholar registry credentials.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6 font-sans">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest ml-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="architect-input w-full dark:bg-zinc-900 dark:border-zinc-800"
                        value={passwordBuffer.new}
                        onChange={(e) =>
                          setPasswordBuffer({
                            ...passwordBuffer,
                            new: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest ml-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        className="architect-input w-full dark:bg-zinc-900 dark:border-zinc-800"
                        value={passwordBuffer.confirm}
                        onChange={(e) =>
                          setPasswordBuffer({
                            ...passwordBuffer,
                            confirm: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                      />
                    </div>

                    {passwordError && (
                      <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-2xl text-[10px] font-bold uppercase animate-in slide-in-from-top-2">
                        <AlertCircle size={14} /> {passwordError}
                      </div>
                    )}
                  </div>

                  <div className="pt-8 border-t dark:border-zinc-800 flex justify-end">
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={isSaving || !passwordBuffer.new}
                      className={cn(
                        "btn-primary px-10 py-5 shadow-2xl transition-all active:scale-95 font-sans",
                        saveSuccess && "bg-emerald-600"
                      )}
                    >
                      {isSaving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : saveSuccess ? (
                        <Check size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      {saveSuccess ? "PROTOCOL UPDATED" : "UPDATE CREDENTIALS"}
                    </button>
                  </div>
                </section>

                <section className="bg-rose-50 dark:bg-rose-950/20 p-10 rounded-[3rem] border-2 border-dashed border-rose-200 dark:border-rose-900/30 flex items-center justify-between gap-10">
                  <div className="space-y-1">
                    <h4 className="text-rose-900 dark:text-rose-500 font-bold uppercase tracking-widest text-[11px]">
                      Danger Zone
                    </h4>
                    <p className="text-rose-600/80 text-xs max-w-xs leading-relaxed font-sans italic">
                      Permanently remove your identity and authentication
                      credentials from the DrashX registry.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-8 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-rose-700 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Delete Account
                  </button>
                </section>
              </div>
            )}

            {/* Other tabs remain consistent with logic... */}
            {activeTab === "billing" && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                {(userProfile as ProfileWithPreferences)?.tier === "pro" ? (
                  <div className="bg-[var(--accent-primary)] p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 space-y-10">
                      <div className="flex items-center gap-3 text-white/60">
                        <CheckCircle2 size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                          Sage Pass Active
                        </span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                          Chaver Tier
                        </h3>
                        <p className="text-white/80 text-sm font-normal max-w-sm font-sans leading-relaxed">
                          Full access to semantic AI and canonical artifacts is
                          currently synchronized.
                        </p>
                      </div>
                      <button className="px-10 py-4 bg-white text-[var(--accent-primary)] text-[10px] font-black uppercase tracking-widest rounded-full hover:shadow-xl transition-all">
                        Stripe Management
                      </button>
                    </div>
                    <Zap
                      size={240}
                      className="absolute -bottom-20 -right-20 text-white opacity-5 rotate-12"
                    />
                  </div>
                ) : (
                  <div className="paper-card p-12 space-y-10 text-center">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] flex items-center justify-center mx-auto text-[var(--accent-primary)] shadow-inner">
                      <Zap size={32} fill="currentColor" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold tracking-tight uppercase text-zinc-900 dark:text-zinc-100">
                        Elevate Status
                      </h3>
                      <p className="text-sm text-[var(--ink-muted)] max-w-sm mx-auto leading-relaxed font-sans">
                        Unlock neural synthesis and canonical exports by joining
                        the Chaver registry.
                      </p>
                    </div>
                    <div className="p-12 border-2 border-dashed border-[var(--border-subtle)] rounded-[3rem] text-[var(--ink-muted)] opacity-50 italic text-sm font-sans">
                      Billing gateway is initializing...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
