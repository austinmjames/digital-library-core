"use client";

import { Avatar, AvatarConfig } from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import { AtSign, Loader2, Save, User } from "lucide-react";
import { useState } from "react";

/**
 * ProfileEditor Component (v3.1 - Type Safe)
 * Filepath: components/profile/ProfileEditor.tsx
 * Role: Form for updating public metadata and custom Avatar Engine.
 * Fix: Replaced 'any' types with strict Profile and Prop interfaces.
 */

interface Profile {
  id: string;
  display_name: string;
  username: string;
  bio: string;
  avatar_config: AvatarConfig;
}

interface ProfileEditorProps {
  profile: Profile;
  onSave: (data: Partial<Profile>) => void;
}

const BG_COLORS = [
  "bg-zinc-950",
  "bg-zinc-800",
  "bg-blue-600",
  "bg-green-600",
  "bg-red-600",
  "bg-amber-600",
  "bg-violet-600",
  "bg-indigo-600",
  "bg-rose-600",
  "bg-zinc-100",
];

const FG_COLORS = [
  "text-white",
  "text-zinc-400",
  "text-blue-400",
  "text-green-400",
  "text-red-400",
  "text-amber-400",
  "text-violet-400",
  "text-indigo-400",
  "text-rose-400",
  "text-zinc-950",
];

const ICONS = [
  "book",
  "scroll",
  "pen",
  "flame",
  "sparkles",
  "hash",
  "shield",
  "grad",
  "lab",
  "library",
];

export const ProfileEditor = ({ profile, onSave }: ProfileEditorProps) => {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile.display_name,
    username: profile.username,
    bio: profile.bio || "",
    avatar_config: profile.avatar_config || {
      type: "icon",
      value: "book",
      color: "text-white",
      bg: "bg-zinc-950",
    },
  });

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("users")
      .update({
        display_name: formData.display_name,
        username: formData.username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
        bio: formData.bio.substring(0, 1000),
        avatar_config: formData.avatar_config,
      })
      .eq("id", profile.id);

    if (!error) onSave(formData);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* --- AVATAR ENGINE --- */}
      <div className="lg:col-span-5 space-y-8">
        <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl space-y-10">
          <div className="flex flex-col items-center gap-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
              Identity Seal
            </h3>
            <Avatar config={formData.avatar_config as AvatarConfig} size="xl" />
            <div className="flex bg-zinc-100 p-1.5 rounded-2xl w-full">
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    avatar_config: {
                      ...formData.avatar_config,
                      type: "icon",
                      value: "book",
                    } as AvatarConfig,
                  })
                }
                className={cn(
                  "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  formData.avatar_config.type === "icon"
                    ? "bg-white text-zinc-900 shadow-md"
                    : "text-zinc-400"
                )}
              >
                Icon Mode
              </button>
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    avatar_config: {
                      ...formData.avatar_config,
                      type: "text",
                      value: "DX",
                    } as AvatarConfig,
                  })
                }
                className={cn(
                  "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  formData.avatar_config.type === "text"
                    ? "bg-white text-zinc-900 shadow-md"
                    : "text-zinc-400"
                )}
              >
                Text Mode
              </button>
            </div>
          </div>

          <div className="space-y-10 pt-6">
            {/* Input Logic */}
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                {formData.avatar_config.type === "icon"
                  ? "Select Symbol"
                  : "Enter Monogram"}
              </p>
              {formData.avatar_config.type === "icon" ? (
                <div className="grid grid-cols-5 gap-3">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          avatar_config: {
                            ...formData.avatar_config,
                            value: icon,
                          } as AvatarConfig,
                        })
                      }
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all",
                        formData.avatar_config.value === icon
                          ? "border-blue-500 bg-blue-50"
                          : "border-zinc-50 bg-zinc-50 hover:border-zinc-200"
                      )}
                    >
                      <Avatar
                        config={
                          {
                            ...formData.avatar_config,
                            value: icon,
                            bg: "bg-transparent",
                            color: "text-zinc-900",
                          } as AvatarConfig
                        }
                        size="sm"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  maxLength={2}
                  value={formData.avatar_config.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      avatar_config: {
                        ...formData.avatar_config,
                        value: e.target.value,
                      } as AvatarConfig,
                    })
                  }
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-center text-2xl font-black uppercase focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              )}
            </div>

            {/* Color Palettes */}
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Foreground Tint
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {FG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          avatar_config: {
                            ...formData.avatar_config,
                            color: c,
                          } as AvatarConfig,
                        })
                      }
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        c.replace("text", "bg"),
                        formData.avatar_config.color === c
                          ? "ring-4 ring-blue-500/20 border-white scale-110"
                          : "border-transparent"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Background Field
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {BG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          avatar_config: {
                            ...formData.avatar_config,
                            bg: c,
                          } as AvatarConfig,
                        })
                      }
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        c,
                        formData.avatar_config.bg === c
                          ? "ring-4 ring-blue-500/20 border-white scale-110"
                          : "border-transparent"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* --- PUBLIC FORMS --- */}
      <div className="lg:col-span-7 space-y-8">
        <section className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl space-y-8">
          <h3 className="text-xl font-black uppercase tracking-tighter italic">
            Public Manuscript
          </h3>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-1">
                Display Name
              </label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300"
                  size={18}
                />
                <input
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData({ ...formData, display_name: e.target.value })
                  }
                  className="w-full pl-12 pr-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-zinc-950 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-1">
                Unique Handle
              </label>
              <div className="relative group">
                <AtSign
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300"
                  size={18}
                />
                <input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full pl-12 pr-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-mono focus:outline-none focus:border-zinc-950 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  Scholar Biography
                </label>
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-widest",
                    formData.bio.length > 900
                      ? "text-rose-500"
                      : "text-zinc-300"
                  )}
                >
                  {formData.bio.length} / 1000
                </span>
              </div>
              <textarea
                rows={6}
                maxLength={1000}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Share your scholarship journey..."
                className="w-full p-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-sm font-medium italic font-serif leading-relaxed focus:outline-none focus:border-zinc-950 transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-50 flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex items-center gap-3 px-10 py-5 bg-zinc-950 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} className="text-blue-500" />
              )}
              Synchronize Identity
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
