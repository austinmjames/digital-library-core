"use client";

import React, { useEffect, useState } from "react";
import { X, User, Save, Loader2, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusFooter } from "@/components/ui/status-footer";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * components/reader/ProfilePanel.tsx
 * Slide-out profile management.
 * Updated: Resolved 'error' unused variable warnings and ensured backdrop interactivity.
 */
export function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function getProfile() {
      if (!user || !isOpen) return;
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("full_name, username")
          .eq("id", user.id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.warn("Profile load non-critical error:", fetchError.message);
        }

        if (data) {
          setFullName(data.full_name || "");
          setUsername(data.username || "");
        }
      } catch (err) {
        console.error("Critical failure during profile fetch:", err);
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
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        username,
        updated_at: new Date().toISOString(),
      });

      if (upsertError) throw upsertError;
    } catch (err) {
      console.error("Profile update failed:", err);
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-ink/5 z-[55] animate-in fade-in duration-500 md:hidden"
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-[400px] lg:w-[450px] bg-paper border-l border-pencil/10 z-[60] shadow-2xl flex flex-col transition-transform duration-500 ease-spring",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="h-20 border-b border-pencil/10 flex items-center justify-between px-8 bg-paper/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center imprint-sm">
              <User className="w-5 h-5 text-accent-foreground" />
            </div>
            <h2 className="text-2xl text-ink font-bold tracking-tight">
              Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-pencil/5 transition-all group active:scale-90"
          >
            <X className="w-6 h-6 text-pencil group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
          {loading && !authLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 opacity-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent" />
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-pencil/50 ml-1">
                  Account Email
                </Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-pencil/5 border-none imprint-sm"
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
                  placeholder="Your Name"
                  className="bg-white border-pencil/10 focus:ring-accent/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-[10px] font-black uppercase tracking-widest text-pencil/50 ml-1"
                >
                  Public Handle
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@username"
                  className="bg-white border-pencil/10 focus:ring-accent/20"
                />
              </div>

              <Button
                onClick={updateProfile}
                disabled={saving}
                className="w-full h-12 bg-ink text-paper rounded-2xl gap-2 shadow-lg hover:bg-charcoal"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Profile Changes
              </Button>

              <div className="pt-4 border-t border-pencil/5">
                <Button
                  variant="ghost"
                  onClick={() => {
                    signOut();
                    onClose();
                  }}
                  className="w-full h-12 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out of Sanctuary
                </Button>
              </div>
            </div>
          )}
        </div>

        <StatusFooter>
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-accent" />
            <span>Your data is encrypted and private.</span>
          </div>
        </StatusFooter>
      </aside>
    </>
  );
}
