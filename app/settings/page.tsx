"use client";

import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { PricingTable } from "@/components/shared/PricingTable";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Loader2,
  Palette,
  Save,
  Sparkles,
  Upload,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Settings Dashboard Page (v1.5 - Material Edition)
 * Filepath: app/settings/page.tsx
 * Role: Orchestrator for Profile, Membership, and Display.
 * Aesthetic: Modern Google (Material 3). Clean, non-italic, high-clarity surfaces.
 */

type SettingsTab = "profile" | "billing" | "appearance" | "notifications";

interface ExtendedProfile {
  display_name?: string;
  bio?: string;
  tier?: "free" | "pro";
}

export default function SettingsPage() {
  const { isLoading: authLoading, profile: userProfile, user } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local state for profile edits
  const [localProfile, setLocalProfile] = useState({
    displayName: "",
    bio: "",
  });

  // Sync local state when profile loads from useAuth
  useEffect(() => {
    if (userProfile) {
      const profile = userProfile as ExtendedProfile;
      setLocalProfile({
        displayName: profile.display_name || "",
        bio: profile.bio || "",
      });
    }
  }, [userProfile]);

  const handleProfileSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("users")
      .update({
        display_name: localProfile.displayName,
        bio: localProfile.bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }

    setIsSaving(false);
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[var(--paper)] gap-4">
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
    <div className="min-h-screen bg-[var(--paper)] selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300 pb-32">
      <div className="max-w-6xl mx-auto px-6 pt-12 space-y-12 animate-in fade-in duration-700">
        {/* 1. Header Area */}
        <header className="space-y-4 border-b border-[var(--border-subtle)] pb-10">
          <h1 className="text-4xl font-bold text-[var(--ink)] tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-[var(--ink-muted)] font-normal leading-relaxed max-w-xl border-l-2 border-[var(--accent-primary)]/20 pl-6">
            Configure your personal scholarship environment, membership tiers,
            and visual preferences.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* 2. Navigation Sidebar: Material Rail Style */}
          <aside className="w-full lg:w-72 shrink-0 space-y-1.5">
            {[
              { id: "profile", label: "Identity", icon: User },
              { id: "billing", label: "Membership", icon: CreditCard },
              { id: "appearance", label: "Display", icon: Palette },
              { id: "notifications", label: "Alerts", icon: Bell },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={cn(
                  "w-full flex items-center justify-between px-6 py-4 rounded-full transition-all group active:scale-95",
                  activeTab === tab.id
                    ? "bg-[var(--accent-primary)] text-white shadow-md shadow-blue-500/20"
                    : "text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                )}
              >
                <div className="flex items-center gap-4">
                  <tab.icon
                    size={18}
                    strokeWidth={activeTab === tab.id ? 2.5 : 2}
                    className={cn(
                      activeTab === tab.id
                        ? "text-white"
                        : "group-hover:text-[var(--accent-primary)]"
                    )}
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
          </aside>

          {/* 3. Content Area */}
          <div className="flex-grow max-w-2xl">
            {activeTab === "profile" && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                <section className="paper-card p-10 space-y-10">
                  <div className="flex items-center gap-8">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-[var(--surface-hover)] border-2 border-dashed border-[var(--border-subtle)] flex items-center justify-center text-3xl font-bold text-[var(--ink-muted)] overflow-hidden shadow-inner">
                        {localProfile.displayName
                          .substring(0, 1)
                          .toUpperCase() || "?"}
                      </div>
                      {userProfile?.tier === "pro" && (
                        <button className="absolute -bottom-1 -right-1 p-2 bg-[var(--accent-primary)] text-white rounded-full shadow-lg hover:brightness-110 transition-all border border-white/20">
                          <Upload size={14} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[11px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em]">
                        Avatar Identity
                      </h3>
                      <p className="text-xs text-[var(--ink-muted)] max-w-[220px] leading-relaxed">
                        {userProfile?.tier === "pro"
                          ? "Upload a custom scholarly symbol."
                          : "Custom icons require Chaver membership."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest ml-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={localProfile.displayName}
                        onChange={(e) =>
                          setLocalProfile({
                            ...localProfile,
                            displayName: e.target.value,
                          })
                        }
                        className="architect-input w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest ml-1">
                        Biography
                      </label>
                      <textarea
                        value={localProfile.bio}
                        onChange={(e) =>
                          setLocalProfile({
                            ...localProfile,
                            bio: e.target.value,
                          })
                        }
                        rows={4}
                        className="architect-input w-full resize-none rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-[var(--border-subtle)] flex justify-end">
                    <button
                      onClick={handleProfileSave}
                      disabled={isSaving}
                      className={cn(
                        "btn-primary px-10 py-4 shadow-lg",
                        saveSuccess && "bg-[var(--accent-success)]"
                      )}
                    >
                      {isSaving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : saveSuccess ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      {saveSuccess ? "SYNCHRONIZED" : "SAVE PROFILE"}
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                {userProfile?.tier === "pro" ? (
                  <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                    <div className="relative z-10 space-y-8">
                      <div className="flex items-center gap-3 text-blue-200">
                        <CheckCircle2 size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                          Chaver Tier Active
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-4xl font-bold tracking-tight uppercase">
                          Sage Pass
                        </h3>
                        <p className="text-blue-100/80 text-sm font-normal">
                          Full access to AI semantic tools and canonical
                          archives.
                        </p>
                      </div>
                      <button className="px-8 py-3 bg-white text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-blue-50 transition-all shadow-sm">
                        Manage via Stripe
                      </button>
                    </div>
                    <Sparkles className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-10 -rotate-12 transition-transform group-hover:scale-105 duration-1000" />
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 flex items-center gap-6">
                      <Zap size={24} className="text-blue-600" />
                      <div>
                        <h3 className="text-sm font-bold text-[var(--ink)] uppercase tracking-widest">
                          Upgrade to Chaver Status
                        </h3>
                        <p className="text-xs text-[var(--ink-muted)] font-normal">
                          Unlock neural synthesis and support the digital
                          Midrash.
                        </p>
                      </div>
                    </div>
                    <PricingTable />
                  </div>
                )}
              </div>
            )}

            {activeTab === "appearance" && <AppearanceSettings />}

            {activeTab === "notifications" && (
              <div className="paper-card p-20 text-center animate-in slide-in-from-right-4 duration-500">
                <div className="w-16 h-16 bg-[var(--surface-hover)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--border-subtle)] shadow-inner">
                  <Bell className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[var(--ink)] uppercase tracking-tight">
                    Alert Center
                  </h3>
                  <p className="text-sm text-[var(--ink-muted)] font-normal">
                    Neural notifications and collaboration alerts are being
                    finalized.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
