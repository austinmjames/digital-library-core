"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/context/auth-context";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    async function getProfile() {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, username, website, avatar_url")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.warn("Error loading profile:", error);
        }

        if (data) {
          setFullName(data.full_name || "");
          setUsername(data.username || "");
          setWebsite(data.website || "");
          setAvatarUrl(data.avatar_url || "");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      getProfile();
    } else if (!authLoading) {
      // Not logged in, redirect
      router.push("/auth/login");
    }
  }, [user, authLoading, router, supabase]);

  async function updateProfile() {
    try {
      setSaving(true);
      const { error } = await supabase.from("profiles").upsert({
        id: user?.id as string,
        full_name: fullName,
        username,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      alert("Profile updated!");
    } catch (error) {
      console.error("Error updating the data:", error);
      alert("Error updating profile!");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper p-6 flex flex-col items-center">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            className="p-2 rounded-full hover:bg-pencil/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-pencil" />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-ink">
            Edit Profile
          </h1>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-pencil/10 shadow-sm space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="text"
              value={user?.email}
              disabled
              className="bg-pencil/5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <Button
            onClick={updateProfile}
            disabled={saving}
            className="w-full bg-ink text-paper hover:bg-charcoal"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
