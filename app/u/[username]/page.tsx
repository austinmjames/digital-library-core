"use client";

import { Avatar, AvatarConfig } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/utils";
import {
  Anchor,
  Award,
  Bell,
  Book,
  BookMarked,
  Box,
  Check,
  Cloud,
  Coffee,
  Compass,
  Cpu,
  Crown,
  Diamond,
  Edit3,
  Eye,
  Eye as EyeIcon,
  EyeOff,
  Feather,
  FileText,
  Flag,
  Flame,
  FlaskConical,
  Ghost,
  Gift,
  Globe,
  GraduationCap,
  Hammer,
  Heart,
  HelpCircle,
  Key,
  Leaf,
  Library,
  Lightbulb,
  Loader2,
  Lock,
  Map,
  MapPin,
  Moon,
  Music,
  Navigation,
  Package,
  Palette,
  Paperclip,
  PenTool,
  PieChart,
  Printer,
  Rocket,
  Scroll,
  Search,
  ShieldAlert,
  ShieldX,
  Star,
  Sun,
  Sunrise,
  Target,
  TrendingUp,
  Type,
  Umbrella,
  UserCheck,
  Waves,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

/**
 * Public Profile Orchestrator (v15.1 - Type-Safe Inline Editing)
 * Filepath: app/u/[username]/page.tsx
 * Role: Master view for Scholar Identity.
 * Design: No global edit mode; individual field controls for display name, bio, and communal data.
 * Fixes: Removed unused imports and resolved all 'any' type warnings.
 */

// Registry shape for DB persistence
interface RegistryAvatarConfig {
  type: "image" | "text" | "icon";
  value: string;
  icon?: string;
  initials?: string;
  url?: string;
  color?: string;
  bg?: string;
}

interface ProfileData {
  id: string;
  display_name: string;
  username: string;
  bio: string;
  tier: "free" | "pro";
  rank: string;
  location: string;
  tradition: string;
  observance: string;
  avatar_config: RegistryAvatarConfig;
  created_at: string;
  is_shadow_banned: boolean;
  is_permanently_banned: boolean;
  is_private: boolean;
  show_location: boolean;
  show_tradition: boolean;
  show_observance: boolean;
}

interface StatsData {
  current_xp: number;
  current_level: number;
  current_streak: number;
  total_notes: number;
}

interface PublicWork {
  id: string;
  title: string;
  type: "notebook" | "study_guide" | "commentary";
  created_at: string;
}

interface MetadataItem {
  key: "location" | "tradition" | "observance";
  label: string;
  icon: React.ElementType;
  color: string;
  showKey: "show_location" | "show_tradition" | "show_observance";
  options: string[] | null;
}

const TRADITIONS = ["Ashkenazi", "Sefardi", "Mizrahi", "Ethiopian", "Other"];
const OBSERVANCES = [
  "Orthodox",
  "Haredi",
  "Chabad",
  "Satmar",
  "Modern Orthodox",
  "Conservative",
  "Reform",
  "Other",
];

const STUDIO_ICONS = [
  { name: "book", icon: Book },
  { name: "scroll", icon: Scroll },
  { name: "award", icon: Award },
  { name: "globe", icon: Globe },
  { name: "compass", icon: Compass },
  { name: "star", icon: Star },
  { name: "zap", icon: Zap },
  { name: "shield", icon: UserCheck },
  { name: "flame", icon: Flame },
  { name: "sunrise", icon: Sunrise },
  { name: "moon", icon: Moon },
  { name: "library", icon: Library },
  { name: "pen", icon: PenTool },
  { name: "anchor", icon: Anchor },
  { name: "bell", icon: Bell },
  { name: "box", icon: Box },
  { name: "cloud", icon: Cloud },
  { name: "coffee", icon: Coffee },
  { name: "cpu", icon: Cpu },
  { name: "crown", icon: Crown },
  { name: "diamond", icon: Diamond },
  { name: "eye", icon: EyeIcon },
  { name: "feather", icon: Feather },
  { name: "gift", icon: Gift },
  { name: "heart", icon: Heart },
  { name: "key", icon: Key },
  { name: "leaf", icon: Leaf },
  { name: "lightbulb", icon: Lightbulb },
  { name: "lock", icon: Lock },
  { name: "map", icon: Map },
  { name: "music", icon: Music },
  { name: "navigation", icon: Navigation },
  { name: "package", icon: Package },
  { name: "paperclip", icon: Paperclip },
  { name: "piechart", icon: PieChart },
  { name: "printer", icon: Printer },
  { name: "rocket", icon: Rocket },
  { name: "search", icon: Search },
  { name: "sun", icon: Sun },
  { name: "target", icon: Target },
  { name: "ghost", icon: Ghost },
  { name: "umbrella", icon: Umbrella },
  { name: "wind", icon: Wind },
  { name: "waves", icon: Waves },
  { name: "flask", icon: FlaskConical },
  { name: "graduation", icon: GraduationCap },
  { name: "hammer", icon: Hammer },
  { name: "help", icon: HelpCircle },
];

const BG_PALETTE = [
  { label: "Ink", value: "bg-zinc-900" },
  { label: "Slate", value: "bg-slate-700" },
  { label: "Stone", value: "bg-stone-600" },
  { label: "Azure", value: "bg-blue-600" },
  { label: "Ocean", value: "bg-sky-600" },
  { label: "Teal", value: "bg-teal-600" },
  { label: "Emerald", value: "bg-emerald-600" },
  { label: "Forest", value: "bg-green-700" },
  { label: "Amber", value: "bg-amber-500" },
  { label: "Orange", value: "bg-orange-600" },
  { label: "Ruby", value: "bg-rose-600" },
  { label: "Crimson", value: "bg-red-700" },
  { label: "Amethyst", value: "bg-purple-600" },
  { label: "Indigo", value: "bg-indigo-600" },
  { label: "Plum", value: "bg-fuchsia-800" },
  { label: "Sinai", value: "bg-gradient-to-br from-orange-400 to-rose-600" },
  {
    label: "Jerusalem",
    value: "bg-gradient-to-br from-yellow-200 via-amber-400 to-orange-500",
  },
  { label: "Midnight", value: "bg-gradient-to-br from-zinc-900 to-indigo-950" },
  {
    label: "Borealis",
    value: "bg-gradient-to-br from-emerald-400 to-cyan-500",
  },
  { label: "Nebula", value: "bg-gradient-to-br from-purple-500 to-pink-500" },
  { label: "Oceanic", value: "bg-gradient-to-br from-blue-400 to-emerald-400" },
  { label: "Eternal", value: "bg-gradient-to-br from-zinc-100 to-zinc-400" },
  {
    label: "Twilight",
    value: "bg-gradient-to-br from-indigo-500 to-purple-800",
  },
  { label: "Desert", value: "bg-gradient-to-br from-stone-400 to-orange-300" },
  { label: "Royal", value: "bg-gradient-to-br from-zinc-700 to-zinc-950" },
  { label: "Lush", value: "bg-gradient-to-br from-green-300 to-emerald-700" },
  { label: "Ethereal", value: "bg-gradient-to-br from-sky-300 to-indigo-400" },
  { label: "Volcanic", value: "bg-gradient-to-br from-red-500 to-zinc-900" },
  { label: "Sky", value: "bg-gradient-to-br from-cyan-300 to-blue-500" },
  { label: "Shadow", value: "bg-gradient-to-br from-zinc-400 to-zinc-800" },
];

const FG_PALETTE = [
  { label: "White", value: "text-white", swatch: "bg-white" },
  { label: "Zinc-100", value: "text-zinc-100", swatch: "bg-zinc-100" },
  { label: "Zinc-300", value: "text-zinc-300", swatch: "bg-zinc-300" },
  { label: "Zinc-500", value: "text-zinc-500", swatch: "bg-zinc-500" },
  { label: "Zinc-900", value: "text-zinc-900", swatch: "bg-zinc-900" },
  { label: "Red-100", value: "text-red-100", swatch: "bg-red-100" },
  { label: "Red-300", value: "text-red-300", swatch: "bg-red-300" },
  { label: "Red-500", value: "text-red-500", swatch: "bg-red-500" },
  { label: "Orange-200", value: "text-orange-200", swatch: "bg-orange-200" },
  { label: "Orange-400", value: "text-orange-400", swatch: "bg-orange-400" },
  { label: "Orange-600", value: "text-orange-600", swatch: "bg-orange-600" },
  { label: "Amber-300", value: "text-amber-300", swatch: "bg-amber-300" },
  { label: "Amber-500", value: "text-amber-500", swatch: "bg-amber-500" },
  { label: "Yellow-200", value: "text-yellow-200", swatch: "bg-yellow-200" },
  { label: "Yellow-400", value: "text-yellow-400", swatch: "bg-yellow-400" },
  { label: "Lime-400", value: "text-lime-400", swatch: "bg-lime-400" },
  { label: "Green-300", value: "text-green-300", swatch: "bg-green-300" },
  { label: "Green-500", value: "text-green-500", swatch: "bg-green-500" },
  { label: "Emerald-400", value: "text-emerald-400", swatch: "bg-emerald-400" },
  { label: "Teal-300", value: "text-teal-300", swatch: "bg-teal-300" },
  { label: "Teal-500", value: "text-teal-500", swatch: "bg-teal-500" },
  { label: "Cyan-400", value: "text-cyan-400", swatch: "bg-cyan-400" },
  { label: "Sky-400", value: "text-sky-400", swatch: "bg-sky-400" },
  { label: "Blue-300", value: "text-blue-300", swatch: "bg-blue-300" },
  { label: "Blue-500", value: "text-blue-500", swatch: "bg-blue-500" },
  { label: "Indigo-400", value: "text-indigo-400", swatch: "bg-indigo-400" },
  { label: "Violet-400", value: "text-violet-400", swatch: "bg-violet-400" },
  { label: "Purple-500", value: "text-purple-500", swatch: "bg-purple-500" },
  { label: "Fuchsia-400", value: "text-fuchsia-400", swatch: "bg-fuchsia-400" },
  { label: "Pink-400", value: "text-pink-400", swatch: "bg-pink-400" },
];

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const usernameParam =
    typeof params?.username === "string" ? params.username : "";
  const supabase = createClient();
  const { user: authUser, profile: authProfile } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [works, setWorks] = useState<PublicWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Track which field is currently being edited
  const [editingField, setEditingField] = useState<string | null>(null);

  const [modConfirmation, setModConfirmation] = useState<{
    isOpen: boolean;
    type: "shadow" | "permanent" | null;
  }>({ isOpen: false, type: null });
  const [editBuffer, setEditBuffer] = useState<Partial<ProfileData>>({});

  const isOwner = authUser?.id === profile?.id;
  const isViewerAdmin = authProfile?.tier === "pro";

  const xpMetrics = useMemo(() => {
    if (!stats) return { progress: 0, currentLevelXp: 0, nextLevelXp: 1000 };
    const xpPerLevel = 1000;
    const currentLevelBase = (stats.current_level - 1) * xpPerLevel;
    const currentVal = stats.current_xp - currentLevelBase;
    return {
      progress: Math.min(100, Math.max(0, (currentVal / xpPerLevel) * 100)),
      currentLevelXp: currentVal,
      nextLevelXp: xpPerLevel,
    };
  }, [stats]);

  useEffect(() => {
    async function loadProfile() {
      if (!usernameParam) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", usernameParam)
        .single();
      if (!error && data) {
        setProfile(data as ProfileData);
        setEditBuffer(data as ProfileData);
        const { data: statData } = await supabase
          .from("dashboard_user_stats")
          .select("*")
          .eq("user_id", data.id)
          .single();
        if (statData) setStats(statData as StatsData);
        const { data: worksData } = await supabase
          .from("public_works")
          .select("*")
          .eq("author_id", data.id)
          .eq("is_published", true);
        if (worksData) setWorks(worksData as PublicWork[]);
      }
      setLoading(false);
    }
    loadProfile();
  }, [usernameParam, supabase]);

  const handleFieldSave = async <K extends keyof ProfileData>(
    field: K,
    value: ProfileData[K]
  ) => {
    if (!profile) return;
    setSavingField(String(field));
    setUsernameError(null);

    // Special logic for username validation
    if (field === "username") {
      const updatedUsername = String(value).toLowerCase();
      if (updatedUsername !== profile.username.toLowerCase()) {
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("username", updatedUsername)
          .maybeSingle();
        if (existing) {
          setUsernameError("Identity already claimed.");
          setSavingField(null);
          return;
        }
      }
    }

    const { error } = await supabase
      .from("users")
      .update({ [field]: value })
      .eq("id", profile.id);
    if (!error) {
      const updatedProfile = { ...profile, [field]: value };
      setProfile(updatedProfile);
      setEditBuffer(updatedProfile);
      setEditingField(null);

      // Handle redirect if username changed
      if (
        field === "username" &&
        String(value).toLowerCase() !== usernameParam
      ) {
        router.push(`/u/${String(value).toLowerCase()}`);
      }
    } else {
      setUsernameError("Registry update failed.");
    }
    setSavingField(null);
  };

  const handleModerationExecution = async () => {
    if (!profile || !modConfirmation.type || !isViewerAdmin) return;
    setSavingField("moderation");
    const update =
      modConfirmation.type === "shadow"
        ? { is_shadow_banned: !profile.is_shadow_banned }
        : { is_permanently_banned: !profile.is_permanently_banned };
    const { error } = await supabase
      .from("users")
      .update(update)
      .eq("id", profile.id);
    if (!error) setProfile({ ...profile, ...update });
    setModConfirmation({ isOpen: false, type: null });
    setSavingField(null);
  };

  const handleReport = async () => {
    if (!profile || !authUser) return;
    await supabase
      .from("user_reports")
      .insert({
        reporter_id: authUser.id,
        reported_id: profile.id,
        reason: "User reported via profile interface.",
      });
  };

  const metadataItems: MetadataItem[] = [
    {
      key: "location",
      label: "Origin",
      icon: MapPin,
      color: "text-blue-500",
      showKey: "show_location",
      options: null,
    },
    {
      key: "tradition",
      label: "Tradition",
      icon: Globe,
      color: "text-emerald-500",
      showKey: "show_tradition",
      options: TRADITIONS,
    },
    {
      key: "observance",
      label: "Observance",
      icon: Scroll,
      color: "text-purple-500",
      showKey: "show_observance",
      options: OBSERVANCES,
    },
  ];

  const currentAvatarConfig = (editBuffer.avatar_config ||
    profile?.avatar_config) as RegistryAvatarConfig;
  const initialsLength = currentAvatarConfig?.initials?.length || 0;
  const initialsSizeClass =
    initialsLength === 1 ? "[&_span]:text-6xl" : "[&_span]:text-4xl";

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[var(--paper)] gap-6">
        <Loader2
          className="animate-spin text-[var(--accent-primary)]"
          size={48}
          strokeWidth={2}
        />
        <p className="text-[11px] font-black uppercase tracking-[1em] text-[var(--ink-muted)] animate-pulse">
          Summoning Identity
        </p>
      </div>
    );

  if (!profile || (profile.is_permanently_banned && !isViewerAdmin))
    return (
      <div className="h-screen flex flex-col items-center justify-center p-12 text-center bg-[var(--paper)]">
        <ShieldX size={64} className="text-rose-500 mb-8 opacity-20" />
        <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)] mb-4 uppercase">
          Registry Access Denied
        </h2>
        <p className="text-[var(--ink-muted)] mb-10 max-w-md mx-auto leading-relaxed">
          This profile has been removed from the ecosystem.
        </p>
        <button
          onClick={() => router.push("/library")}
          className="btn-primary px-10"
        >
          Return to Catalog
        </button>
      </div>
    );

  const showPrivacyScreen = profile.is_private && !isOwner && !isViewerAdmin;

  return (
    <div className="min-h-screen bg-[var(--paper)] selection:bg-blue-100 pb-40 relative transition-all">
      {/* Moderation Confirmation Modal */}
      {modConfirmation.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--ink)]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-3xl border-2 border-rose-600">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-5 bg-rose-50 rounded-3xl text-rose-600">
                <ShieldAlert size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-rose-900">
                  Confirm Protocol
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Confirm{" "}
                  <span className="font-bold text-rose-600">
                    {modConfirmation.type}
                  </span>{" "}
                  ban protocol?
                </p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleModerationExecution}
                  disabled={!!savingField}
                  className="w-full py-4 bg-rose-600 text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-rose-700 active:scale-95 transition-all"
                >
                  Confirm
                </button>
                <button
                  onClick={() =>
                    setModConfirmation({ isOpen: false, type: null })
                  }
                  className="w-full py-4 text-zinc-400 text-[11px] font-black uppercase tracking-[0.3em]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Studio Modal */}
      {isStudioOpen && isOwner && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[var(--ink)]/60 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-[3rem] shadow-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 max-h-[95vh]">
            <header className="p-6 sm:p-8 border-b flex items-center justify-between bg-zinc-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl text-[var(--accent-primary)] shadow-sm border border-zinc-100">
                  <Palette size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">
                    Avatar Studio
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">
                    Configure Identity Artifact
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStudioOpen(false)}
                className="p-3 hover:bg-zinc-100 rounded-full transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-12 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                <div className="flex flex-col items-center justify-center p-12 bg-[var(--surface-hover)] rounded-[3.5rem] border-2 border-dashed border-zinc-200">
                  <Avatar
                    config={
                      (editBuffer.avatar_config ||
                        profile.avatar_config) as AvatarConfig
                    }
                    size="xl"
                    className={cn(
                      "border-8 border-white shadow-2xl scale-125 mb-8",
                      initialsSizeClass
                    )}
                  />
                  <div className="text-center">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.25em]">
                      Artifact Preview
                    </span>
                    <p className="text-[9px] text-zinc-300 uppercase mt-1">
                      Live Visual Sync
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                      Identity Mode
                    </label>
                    <div className="bg-zinc-100 p-1.5 rounded-2xl flex gap-1 border border-zinc-200 shadow-inner">
                      {[
                        { id: "icon", label: "Symbol", icon: Scroll },
                        { id: "text", label: "Initials", icon: Type },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() =>
                            setEditBuffer({
                              ...editBuffer,
                              avatar_config: {
                                ...(editBuffer.avatar_config ||
                                  profile.avatar_config),
                                type: mode.id as "icon" | "text",
                                value:
                                  mode.id === "icon"
                                    ? (
                                        editBuffer.avatar_config ||
                                        profile.avatar_config
                                      ).icon || "book"
                                    : (
                                        editBuffer.avatar_config ||
                                        profile.avatar_config
                                      ).initials || "DX",
                                initials:
                                  mode.id === "icon"
                                    ? undefined
                                    : (
                                        editBuffer.avatar_config ||
                                        profile.avatar_config
                                      ).initials,
                              },
                            })
                          }
                          className={cn(
                            "flex-1 py-4 px-4 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all",
                            (editBuffer.avatar_config || profile.avatar_config)
                              .type === mode.id
                              ? "bg-white text-[var(--ink)] shadow-md border border-zinc-100"
                              : "text-zinc-400 hover:text-zinc-600"
                          )}
                        >
                          <mode.icon size={16} />
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t border-zinc-100 min-h-[180px]">
                    {(editBuffer.avatar_config || profile.avatar_config)
                      .type === "icon" ? (
                      <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                          Canonical Icon (Double Row Scroll)
                        </label>
                        <div className="grid grid-rows-2 grid-flow-col gap-2 overflow-x-auto pb-4 px-8 custom-scrollbar pr-10">
                          {STUDIO_ICONS.map((item) => (
                            <button
                              key={item.name}
                              onClick={() =>
                                setEditBuffer({
                                  ...editBuffer,
                                  avatar_config: {
                                    ...(editBuffer.avatar_config ||
                                      profile.avatar_config),
                                    type: "icon",
                                    icon: item.name,
                                    value: item.name,
                                    initials: undefined,
                                  },
                                })
                              }
                              className={cn(
                                "w-12 h-12 shrink-0 flex items-center justify-center rounded-xl border-2 transition-all",
                                (
                                  editBuffer.avatar_config ||
                                  profile.avatar_config
                                ).icon === item.name
                                  ? "bg-[var(--ink)] text-white border-[var(--ink)] shadow-lg"
                                  : "bg-zinc-50 border-transparent hover:bg-white hover:border-zinc-200"
                              )}
                            >
                              <item.icon size={18} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                          Scholar Initials (1-2 Characters)
                        </label>
                        <input
                          maxLength={2}
                          className="architect-input w-full text-center text-5xl font-black uppercase tracking-[0.5em] py-10 bg-zinc-50/50 border-zinc-200 rounded-[2rem]"
                          value={
                            (editBuffer.avatar_config || profile.avatar_config)
                              .initials || ""
                          }
                          onChange={(e) =>
                            setEditBuffer({
                              ...editBuffer,
                              avatar_config: {
                                ...(editBuffer.avatar_config ||
                                  profile.avatar_config),
                                type: "text",
                                initials: e.target.value.toUpperCase(),
                                value: e.target.value.toUpperCase(),
                                icon: undefined,
                              },
                            })
                          }
                          placeholder="DX"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-12 py-12 border-y border-zinc-100">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--ink-muted)] flex items-center justify-between">
                    Foreground Hue <span>30 Tints</span>
                  </label>
                  <div className="flex gap-4 overflow-x-auto py-6 px-8 custom-scrollbar no-scrollbar pr-10">
                    {FG_PALETTE.map((color) => (
                      <button
                        key={color.label}
                        onClick={() =>
                          setEditBuffer({
                            ...editBuffer,
                            avatar_config: {
                              ...(editBuffer.avatar_config ||
                                profile.avatar_config),
                              color: color.value,
                            },
                          })
                        }
                        className={cn(
                          "shrink-0 w-14 h-14 rounded-full transition-all border-4 shadow-sm relative",
                          color.swatch,
                          (editBuffer.avatar_config || profile.avatar_config)
                            .color === color.value
                            ? "border-[var(--accent-primary)] scale-110 shadow-lg z-10"
                            : "border-white hover:scale-105"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--ink-muted)] flex items-center justify-between">
                    Surface Aesthetic <span>30 Variations</span>
                  </label>
                  <div className="flex gap-4 overflow-x-auto py-6 px-8 custom-scrollbar no-scrollbar pr-10">
                    {BG_PALETTE.map((color) => (
                      <button
                        key={color.value}
                        onClick={() =>
                          setEditBuffer({
                            ...editBuffer,
                            avatar_config: {
                              ...(editBuffer.avatar_config ||
                                profile.avatar_config),
                              bg: color.value,
                            },
                          })
                        }
                        className={cn(
                          "shrink-0 w-14 h-14 rounded-full transition-all border-4 shadow-sm relative",
                          color.value,
                          (editBuffer.avatar_config || profile.avatar_config)
                            .bg === color.value
                            ? "border-emerald-500 scale-110 shadow-lg z-10"
                            : "border-white hover:scale-105"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <footer className="p-8 bg-zinc-50 border-t flex gap-4 shrink-0">
              <button
                onClick={() => setIsStudioOpen(false)}
                className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-200 rounded-3xl transition-all"
              >
                Discard
              </button>
              <button
                onClick={() =>
                  handleFieldSave(
                    "avatar_config",
                    editBuffer.avatar_config as RegistryAvatarConfig
                  ).then(() => setIsStudioOpen(false))
                }
                disabled={!!savingField}
                className="flex-1 py-5 bg-[var(--ink)] text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all"
              >
                {savingField === "avatar_config" ? (
                  <Loader2 className="animate-spin mx-auto" size={16} />
                ) : (
                  "Save Avatar"
                )}
              </button>
            </footer>
          </div>
        </div>
      )}

      <main className={cn("max-w-6xl mx-auto px-8 py-16 pt-24")}>
        {showPrivacyScreen ? (
          <div className="py-40 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="flex justify-center">
              <div className="p-10 bg-zinc-50 rounded-[4rem] border-2 border-dashed border-zinc-200">
                <Lock size={48} className="text-zinc-300" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">
                Registry Restricted
              </h2>
              <p className="text-[var(--ink-muted)] font-serif italic text-lg opacity-60">
                This profile is private.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Left Column: Identity Stack */}
            <div className="lg:col-span-4 space-y-10">
              <div className="flex flex-col items-center lg:items-start space-y-8">
                <div className="relative group">
                  <Avatar
                    config={profile.avatar_config as AvatarConfig}
                    size="xl"
                    className="border-4 border-white shadow-3xl ring-1 ring-[var(--border-subtle)]"
                  />
                  {isOwner && (
                    <button
                      onClick={() => setIsStudioOpen(true)}
                      className="absolute -bottom-2 -right-2 p-3 bg-[var(--accent-primary)] text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all animate-in zoom-in-50"
                    >
                      <Palette size={16} />
                    </button>
                  )}
                </div>

                <div className="space-y-6 text-center lg:text-left w-full">
                  <div className="space-y-4">
                    {/* Display Name */}
                    <div className="group/field relative">
                      {editingField === "display_name" ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            className="architect-input text-2xl font-bold p-2"
                            value={editBuffer.display_name ?? ""}
                            onChange={(e) =>
                              setEditBuffer({
                                ...editBuffer,
                                display_name: e.target.value,
                              })
                            }
                          />
                          <button
                            onClick={() =>
                              handleFieldSave(
                                "display_name",
                                editBuffer.display_name as string
                              )
                            }
                            className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => setEditingField(null)}
                            className="p-2 bg-zinc-100 text-zinc-400 rounded-lg"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center lg:justify-start gap-4">
                          <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)] leading-none">
                            {profile.display_name}
                          </h1>
                          {isOwner && (
                            <button
                              onClick={() => setEditingField("display_name")}
                              className="opacity-0 group-hover/field:opacity-100 transition-opacity p-2 text-zinc-300 hover:text-[var(--accent-primary)]"
                            >
                              <Edit3 size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Username */}
                    <div className="group/field relative">
                      {editingField === "username" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400 font-bold">@</span>
                            <input
                              autoFocus
                              className="architect-input text-sm font-bold p-2"
                              value={editBuffer.username ?? ""}
                              onChange={(e) =>
                                setEditBuffer({
                                  ...editBuffer,
                                  username: e.target.value,
                                })
                              }
                            />
                            <button
                              onClick={() =>
                                handleFieldSave(
                                  "username",
                                  editBuffer.username as string
                                )
                              }
                              className="p-2 bg-emerald-500 text-white rounded-lg"
                            >
                              <Check size={16} />
                            </button>
                          </div>
                          {usernameError && (
                            <p className="text-[9px] font-black uppercase text-rose-500">
                              {usernameError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center lg:justify-start gap-4">
                          <p className="text-xl text-[var(--ink-muted)] opacity-60 font-medium">
                            @{profile.username}
                          </p>
                          {isOwner && (
                            <button
                              onClick={() => setEditingField("username")}
                              className="opacity-0 group-hover/field:opacity-100 transition-opacity p-1 text-zinc-300 hover:text-[var(--accent-primary)]"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
                      <Award size={12} className="text-amber-600" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">
                        {profile.rank}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                      <TrendingUp size={12} className="text-blue-600" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-700">
                        Level {stats?.current_level || 1}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--ink-muted)]">
                    <span>XP Progress</span>
                    <span>
                      {xpMetrics.currentLevelXp} / {xpMetrics.nextLevelXp}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-[var(--surface-hover)] rounded-full border border-[var(--border-subtle)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent-primary)] transition-all duration-1000 ease-out"
                      style={{ width: `${xpMetrics.progress}%` }}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="w-full space-y-4 group/bio relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--ink-muted)]">
                      <FileText size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Scholar&apos;s Narrative
                      </span>
                    </div>
                    {isOwner && editingField !== "bio" && (
                      <button
                        onClick={() => setEditingField("bio")}
                        className="opacity-0 group-hover/bio:opacity-100 transition-opacity text-[var(--accent-primary)]"
                      >
                        <Edit3 size={14} />
                      </button>
                    )}
                  </div>
                  {editingField === "bio" ? (
                    <div className="space-y-3">
                      <textarea
                        autoFocus
                        className="architect-input w-full min-h-[120px] text-sm leading-relaxed p-4"
                        value={editBuffer.bio ?? ""}
                        onChange={(e) =>
                          setEditBuffer({ ...editBuffer, bio: e.target.value })
                        }
                        placeholder="Describe your scholarly journey..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingField(null)}
                          className="btn-secondary px-4 py-2 text-[10px]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            handleFieldSave("bio", editBuffer.bio as string)
                          }
                          className="btn-primary px-6 py-2 text-[10px]"
                        >
                          Save Bio
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-[var(--ink-muted)] font-serif italic">
                      {profile.bio ||
                        "Maintaining the tradition of scholarly silence."}
                    </p>
                  )}
                </div>

                {isOwner && (
                  <div className="w-full pt-4 border-t border-zinc-100">
                    <button
                      onClick={() =>
                        handleFieldSave("is_private", !profile.is_private)
                      }
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                        profile.is_private
                          ? "bg-amber-50 border-amber-200 text-amber-900"
                          : "bg-white border-zinc-100 text-zinc-500"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Lock
                          size={16}
                          className={
                            profile.is_private
                              ? "text-amber-500"
                              : "text-zinc-300"
                          }
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Private Identity Protocol
                        </span>
                      </div>
                      <div
                        className={cn(
                          "w-10 h-5 rounded-full relative transition-all",
                          profile.is_private ? "bg-amber-500" : "bg-zinc-200"
                        )}
                      >
                        <div
                          className={cn(
                            "absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm",
                            profile.is_private ? "right-1" : "left-1"
                          )}
                        />
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Individualized Metadata Anchors */}
              <div className="paper-card p-6 bg-zinc-50/50 border-2 border-[var(--border-subtle)] space-y-6 w-full">
                {metadataItems.map((item) => {
                  const isVisible = profile[item.showKey] || isOwner;
                  if (!isVisible) return null;
                  const isBeingEdited = editingField === item.key;
                  const currentVal = profile[item.key];
                  const bufferVal = editBuffer[item.key] || "";

                  return (
                    <div
                      key={item.key}
                      className="group/meta relative flex items-start gap-4"
                    >
                      <item.icon
                        size={18}
                        className={cn(
                          item.color,
                          !profile[item.showKey] && "opacity-30"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[9px] font-black uppercase tracking-tighter text-[var(--ink-muted)]">
                            {item.label}
                          </p>
                          <div className="flex items-center gap-2">
                            {isOwner && (
                              <button
                                onClick={() =>
                                  handleFieldSave(
                                    item.showKey,
                                    !profile[item.showKey]
                                  )
                                }
                                className="p-1 text-zinc-300 hover:text-blue-500 transition-colors"
                              >
                                {profile[item.showKey] ? (
                                  <Eye size={12} />
                                ) : (
                                  <EyeOff size={12} />
                                )}
                              </button>
                            )}
                            {isOwner && !isBeingEdited && (
                              <button
                                onClick={() => setEditingField(item.key)}
                                className="opacity-0 group-hover/meta:opacity-100 transition-opacity p-1 text-zinc-300 hover:text-[var(--accent-primary)]"
                              >
                                <Edit3 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {isBeingEdited ? (
                          <div className="flex gap-2">
                            {item.options ? (
                              <select
                                autoFocus
                                className="architect-input py-1 text-xs flex-1"
                                value={bufferVal}
                                onChange={(e) =>
                                  setEditBuffer({
                                    ...editBuffer,
                                    [item.key]: e.target.value,
                                  })
                                }
                              >
                                <option value="">None</option>
                                {item.options.map((o) => (
                                  <option key={o} value={o}>
                                    {o}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                autoFocus
                                className="architect-input py-1 text-xs flex-1"
                                value={bufferVal}
                                onChange={(e) =>
                                  setEditBuffer({
                                    ...editBuffer,
                                    [item.key]: e.target.value,
                                  })
                                }
                                placeholder={`Enter ${item.label}...`}
                              />
                            )}
                            <button
                              onClick={() =>
                                handleFieldSave(
                                  item.key as keyof ProfileData,
                                  bufferVal as ProfileData[typeof item.key]
                                )
                              }
                              className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingField(null)}
                              className="p-1 bg-zinc-200 text-zinc-500 rounded"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm font-bold truncate">
                            {currentVal || "Undefined"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isOwner && (
                <div className="flex gap-2 pt-4">
                  <button className="flex-1 btn-primary py-4 text-[10px] font-bold tracking-widest uppercase rounded-[1.5rem]">
                    Follow Scholar
                  </button>
                  <button
                    onClick={handleReport}
                    className="p-4 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 hover:text-rose-600 transition-all"
                  >
                    <Flag size={20} />
                  </button>
                  {isViewerAdmin && (
                    <button
                      onClick={() =>
                        setModConfirmation({ isOpen: true, type: "shadow" })
                      }
                      className="p-4 bg-rose-50 text-rose-600 rounded-[1.5rem] border border-rose-100"
                    >
                      <ShieldAlert size={20} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Registry Feed */}
            <div className="lg:col-span-8 space-y-12">
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                  <h2 className="text-2xl font-normal tracking-tight text-[var(--ink)]">
                    Public Registry
                  </h2>
                  <div className="flex items-center gap-2 text-[var(--ink-muted)]">
                    <BookMarked size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {works.length} Artifacts
                    </span>
                  </div>
                </div>
                {works.length === 0 ? (
                  <div className="p-20 text-center bg-[var(--surface-hover)] rounded-[3rem] border-2 border-dashed border-[var(--border-subtle)]">
                    <p className="text-[var(--ink-muted)] font-serif italic text-lg opacity-40">
                      No public manuscripts summarized.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {works.map((work) => (
                      <div
                        key={work.id}
                        className="paper-card p-8 group hover:shadow-xl transition-all border-2"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            {work.type === "notebook" ? (
                              <BookMarked size={20} />
                            ) : (
                              <FileText size={20} />
                            )}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-zinc-100 rounded-md">
                            {work.type}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
                          {work.title}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">
                          Canonical Work •{" "}
                          {new Date(work.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="paper-card p-10 bg-[var(--ink)] text-white overflow-hidden relative">
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3 opacity-60">
                    <UserCheck size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                      Scholar Status
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                      {profile.rank}
                    </h3>
                    <p className="text-lg opacity-40 uppercase tracking-widest font-bold">
                      Registry Merit Tier
                    </p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Globe size={240} strokeWidth={1} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {isOwner && isViewerAdmin && (
        <div className="max-w-6xl mx-auto px-8 mt-12 pt-12 border-t border-rose-100 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-rose-50 p-10 rounded-[3rem] border-2 border-dashed border-rose-200 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-2 text-center md:text-left">
              <h4 className="text-rose-900 font-bold text-xl tracking-tight">
                Expunge Identity
              </h4>
              <p className="text-rose-600 text-sm max-w-sm">
                This permanently removes all scholarly artifacts from the DrashX
                registry.
              </p>
            </div>
            <button
              onClick={() =>
                setModConfirmation({ isOpen: true, type: "permanent" })
              }
              className="px-10 py-5 bg-rose-600 text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-rose-700 active:scale-95 transition-all"
            >
              Terminate Protocol
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
