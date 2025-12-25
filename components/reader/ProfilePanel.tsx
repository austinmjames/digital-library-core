"use client";

import React, { useEffect, useState } from "react";
import { User, Save, Loader2, LogOut, Settings2 } from "lucide-react";
import { useAuth } from "@/components/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/segmented-control";

import { DisplayModeGrid } from "./header/DisplayModeGrid";
import { AppearanceSettings } from "./header/AppearanceSettings";
import { TranslationSelector } from "./header/TranslationSelector";

interface ProfilePanelProps {
  isOpen: boolean;
  activeVersionId?: string;
  onSelectVersion?: (id: string) => void;
  onOpenTranslations?: () => void;
}

type AccountTab = "IDENTITY" | "SETTINGS";

/**
 * components/reader/ProfilePanel.tsx
 * Updated: Removed StatusFooter.
 */
export function ProfilePanel({
  isOpen,
  activeVersionId = "jps-1985",
  onSelectVersion = () => {},
  onOpenTranslations = () => {},
}: ProfilePanelProps) {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<AccountTab>("IDENTITY");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function getProfile() {
      if (!user || !isOpen) return;
      try {
        setLoading(true);
        const { data } = await supabase
          .from("profiles")
          .select("full_name, username")
          .eq("id", user.id)
          .single();

        if (data) {
          setFullName(data.full_name || "");
          setUsername(data.username || "");
        }
      } finally {
        setLoading(false);
      }
    }
    getProfile();
  }, [user, isOpen, supabase]);

  async function updateProfile() {
    if (!user) return;
    try {
      setSaving(true);
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        username,
        updated_at: new Date().toISOString(),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-paper animate-in fade-in duration-300">
      <header className="h-20 border-b border-pencil/10 flex items-center px-8 bg-paper/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
            {activeTab === "IDENTITY" ? (
              <User className="w-5 h-5 text-accent" />
            ) : (
              <Settings2 className="w-5 h-5 text-accent" />
            )}
          </div>
          <h2 className="text-2xl text-ink font-bold tracking-tight">
            {activeTab === "IDENTITY" ? "Account" : "Settings"}
          </h2>
        </div>
      </header>

      <div className="px-8 py-4 bg-paper border-b border-pencil/[0.03]">
        <SegmentedControl
          value={activeTab}
          onChange={(val) => setActiveTab(val as AccountTab)}
          options={[
            { value: "IDENTITY", label: "Identity", icon: User },
            { value: "SETTINGS", label: "Settings", icon: Settings2 },
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8">
        {activeTab === "IDENTITY" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading && !authLoading ? (
              <div className="flex flex-col items-center justify-center py-24 opacity-20">
                <Loader2 className="w-10 h-10 animate-spin text-accent" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-pencil/50 ml-1">
                    Credentials
                  </Label>
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="bg-pencil/5 border-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="fullName"
                    className="text-[10px] font-black uppercase tracking-widest text-pencil/50 ml-1"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Name"
                    className="bg-white border-pencil/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-[10px] font-black uppercase tracking-widest text-pencil/50 ml-1"
                  >
                    Author Handle
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@handle"
                    className="bg-white border-pencil/10"
                  />
                </div>

                <Button
                  onClick={updateProfile}
                  disabled={saving}
                  className="w-full h-12 bg-ink text-paper rounded-2xl gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Update Identity
                </Button>

                <div className="pt-4 border-t border-pencil/5">
                  <Button
                    variant="ghost"
                    onClick={() => signOut()}
                    className="w-full h-12 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl gap-2 font-bold uppercase tracking-widest text-[10px]"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-pencil/40 uppercase tracking-[0.25em] px-1">
                Rendering Mode
              </h3>
              <DisplayModeGrid />
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-pencil/40 uppercase tracking-[0.25em] px-1">
                Active Translation
              </h3>
              <div className="bg-white border border-pencil/10 rounded-[2rem] p-4">
                <TranslationSelector
                  activeVersionId={activeVersionId}
                  onSelectVersion={onSelectVersion}
                  onOpenAdvanced={onOpenTranslations}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-pencil/40 uppercase tracking-[0.25em] px-1">
                Environment
              </h3>
              <div className="p-6 bg-white border border-pencil/10 rounded-[2rem]">
                <AppearanceSettings />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
