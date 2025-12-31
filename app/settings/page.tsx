"use client";

import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { PricingTable } from "@/components/shared/PricingTable";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Loader2,
  Palette,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Settings Dashboard Page (v1.4)
 * Filepath: app/settings/page.tsx
 * Role: Orchestrator for Profile, Billing, and Notifications.
 * PRD Alignment: Section 2.1 (Identity), 5.0 (Monetization).
 * Fix: Removed 'any' type cast by implementing ExtendedProfile interface.
 */

type SettingsTab = "profile" | "billing" | "appearance" | "notifications";

// Explicitly define the metadata fields expected from the public.users table
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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-paper">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-950 mb-4 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
          Syncing your Scriptorium...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12 max-w-6xl mx-auto animate-in fade-in duration-700 pb-20">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">
          Settings
        </h1>
        <p className="text-zinc-500 italic font-serif text-lg opacity-80">
          &ldquo;Set your heart to your tracks.&rdquo; — Configure your DrashX
          experience.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Navigation Rail */}
        <aside className="w-full lg:w-72 shrink-0 space-y-2">
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
                "w-full flex items-center justify-between px-6 py-4 rounded-[1.25rem] transition-all group",
                activeTab === tab.id
                  ? "bg-zinc-950 text-white shadow-2xl scale-[1.02]"
                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <div className="flex items-center gap-4">
                <tab.icon
                  size={18}
                  className={
                    activeTab === tab.id
                      ? "text-amber-400"
                      : "group-hover:text-zinc-950"
                  }
                />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {tab.label}
                </span>
              </div>
              <ChevronRight
                size={14}
                className={cn(
                  "transition-transform group-hover:translate-x-1",
                  activeTab === tab.id ? "text-zinc-600" : "text-zinc-200"
                )}
              />
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="flex-grow max-w-2xl">
          {activeTab === "profile" && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <section className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-10">
                <div className="flex items-center gap-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center text-3xl font-black text-zinc-300 overflow-hidden">
                      {localProfile.displayName.substring(0, 1).toUpperCase() ||
                        "?"}
                    </div>
                    {userProfile?.tier === "pro" && (
                      <button className="absolute -bottom-2 -right-2 p-2 bg-zinc-950 text-white rounded-xl shadow-xl hover:bg-zinc-800 transition-all border border-white/10">
                        <Upload size={14} />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">
                      Avatar
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-[200px] leading-relaxed">
                      {userProfile?.tier === "pro"
                        ? "Upload a custom symbol."
                        : "Custom avatars require Chaver tier."}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
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
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-8 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
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
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-8 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-zinc-50 flex justify-end">
                  <button
                    onClick={handleProfileSave}
                    disabled={isSaving}
                    className={cn(
                      "flex items-center gap-3 px-10 py-4 bg-zinc-950 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all shadow-2xl disabled:opacity-50",
                      saveSuccess && "bg-emerald-600"
                    )}
                  >
                    {isSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : saveSuccess ? (
                      <ShieldCheck size={16} />
                    ) : (
                      <Save size={16} className="text-amber-400" />
                    )}
                    {saveSuccess ? "Profile Synced" : "Sync Profile"}
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              {userProfile?.tier === "pro" ? (
                <div className="bg-zinc-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-3 text-amber-400">
                      <ShieldCheck size={24} />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                        Chaver Active
                      </span>
                    </div>
                    <h3 className="text-4xl font-black tracking-tighter uppercase mb-2">
                      Sage Pass
                    </h3>
                    <button className="px-8 py-3 bg-white text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all">
                      Manage via Stripe
                    </button>
                  </div>
                  <Sparkles className="absolute -bottom-10 -right-10 w-64 h-64 text-amber-500 opacity-5 -rotate-12 transition-transform group-hover:scale-110 duration-1000" />
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100 flex items-center gap-6">
                    <Zap size={24} className="text-amber-600" />
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">
                        Upgrade to Chaver
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium italic">
                        Unlock AI tools and support the Midrash.
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
            <div className="bg-white p-20 rounded-[2.5rem] border border-zinc-100 shadow-sm text-center animate-in slide-in-from-right-4 duration-500">
              <Bell className="w-12 h-12 text-zinc-100 mx-auto mb-6" />
              <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em]">
                Notification Center coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
