"use client";

import { PricingTable } from "@/components/shared/PricingTable";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Loader2,
  Palette,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";

/**
 * Settings Dashboard Page (v1.1 - Lint Fixed)
 * Filepath: app/settings/page.tsx
 * Role: Phase 6 - User Management Hub.
 * Fixes: Resolved 'user' unused and 'loading' property mismatch with useAuth.
 */

type SettingsTab = "profile" | "billing" | "appearance" | "notifications";

export default function SettingsPage() {
  // Fix: useAuth returns isLoading, not loading. user removed as it was unused.
  const { isLoading: authLoading, profile: userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isSaving, setIsSaving] = useState(false);

  const [localProfile, setLocalProfile] = useState({
    fullName: userProfile?.display_name || "Joseph Davidson",
    bio: "Seeker of the Pardes. Focusing on early 20th-century Responsa.",
    tier: userProfile?.tier || "free",
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulation of sync logic
    setTimeout(() => setIsSaving(false), 800);
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-paper">
        <Loader2 className="w-10 h-10 animate-spin text-orange-600 mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          Syncing Preferences...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
          Settings
        </h1>
        <p className="text-zinc-500 italic">
          Configure your digital Beit Midrash experience.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Navigation Rail */}
        <aside className="w-full lg:w-64 shrink-0 space-y-1">
          {[
            { id: "profile", label: "My Profile", icon: User },
            { id: "billing", label: "Subscription", icon: CreditCard },
            { id: "appearance", label: "Appearance", icon: Palette },
            { id: "notifications", label: "Notifications", icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                activeTab === tab.id
                  ? "bg-zinc-900 text-white shadow-lg"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {tab.label}
                </span>
              </div>
              <ChevronRight
                size={14}
                className={
                  activeTab === tab.id ? "text-zinc-400" : "text-zinc-300"
                }
              />
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="flex-grow space-y-8">
          {activeTab === "profile" && (
            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-zinc-100 flex items-center justify-center text-2xl font-bold text-zinc-400 border-2 border-dashed border-zinc-200">
                  {localProfile.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 mb-1 uppercase tracking-widest">
                    Avatar
                  </h3>
                  <button className="mt-3 px-4 py-1.5 border border-zinc-200 rounded-xl text-[10px] font-bold uppercase hover:bg-zinc-50 transition-colors">
                    Upload New
                  </button>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={localProfile.fullName}
                    onChange={(e) =>
                      setLocalProfile({
                        ...localProfile,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                    Scholarly Bio
                  </label>
                  <textarea
                    value={localProfile.bio}
                    onChange={(e) =>
                      setLocalProfile({ ...localProfile, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-50 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Sync Profile
                </button>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-8">
              {localProfile.tier === "pro" ? (
                <div className="bg-zinc-950 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3 text-orange-500">
                      <ShieldCheck size={20} />
                      <span className="text-xs font-bold uppercase tracking-[0.3em]">
                        Pro Access Active
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold">Sage Subscription</h3>
                    <button className="px-6 py-2.5 bg-white text-black text-[10px] font-bold uppercase rounded-xl hover:bg-orange-50 transition-colors">
                      Manage in Stripe
                    </button>
                  </div>
                  <Sparkles className="absolute -bottom-6 -right-6 w-32 h-32 text-orange-500 opacity-10 -rotate-12" />
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 flex items-center gap-3">
                    <Zap size={16} className="text-orange-600" />
                    <h3 className="text-sm font-bold text-orange-900 uppercase tracking-widest">
                      Upgrade to Sage for AI Features
                    </h3>
                  </div>
                  <PricingTable />
                </div>
              )}
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm text-center py-20">
              <Palette className="w-12 h-12 text-zinc-100 mx-auto mb-4" />
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Theming Engine coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
