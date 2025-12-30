"use client";

import { cn } from "@/lib/utils/utils";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Flame,
  Grid,
  Languages,
  LucideIcon,
  MapPin,
  MessageSquare,
  Moon,
  Share2,
  ShieldCheck,
  Sword,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/**
 * Public Profile Page (v1.3 - Production Lint Fixed)
 * Filepath: app/u/[username]/page.tsx
 * Role: The public portfolio for DrashX scholars and creators.
 * Alignment: Social Identity PRD Section 2.2 & Gamification Section 2.2.
 */

interface UserProfile {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  is_verified_teacher: boolean;
  bio?: string;
  location?: string;
  website_url?: string;
  joined_at: string;
}

interface UserStats {
  xp: number;
  level: number;
  streak: number;
  words_translated: number;
  flame_score: number;
  xp_to_next: number;
  xp_max: number;
}

type ProfileTab = "content" | "activity" | "groups";

interface ProfileTabItem {
  id: ProfileTab;
  label: string;
  icon: LucideIcon;
}

// --- Specialized Components ---

const LevelBadge = ({ level }: { level: number }) => {
  const getTier = (lvl: number) => {
    if (lvl >= 100)
      return {
        title: "Luminary",
        color: "text-blue-500 bg-blue-50 border-blue-200",
      };
    if (lvl >= 50)
      return {
        title: "Sage",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      };
    if (lvl >= 25)
      return {
        title: "Guardian",
        color: "text-slate-500 bg-slate-50 border-slate-200",
      };
    if (lvl >= 10)
      return {
        title: "Builder",
        color: "text-amber-700 bg-amber-50 border-amber-200",
      };
    return {
      title: "Seeker",
      color: "text-zinc-500 bg-zinc-50 border-zinc-200",
    };
  };

  const tier = getTier(level);

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest",
        tier.color
      )}
    >
      <ShieldCheck size={12} />
      {tier.title} (LVL {level})
    </div>
  );
};

const ImpactStat = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
}) => (
  <div className="flex flex-col items-center p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
    <Icon className={cn("w-6 h-6 mb-3", color)} />
    <span className="text-xl font-bold text-zinc-900">{value}</span>
    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 text-center">
      {label}
    </span>
  </div>
);

const AchievementCard = ({
  icon: Icon,
  name,
  description,
  tier,
  unlocked,
}: {
  icon: LucideIcon;
  name: string;
  description: string;
  tier: "gold" | "silver" | "bronze" | "diamond";
  unlocked: boolean;
}) => (
  <div
    className={cn(
      "p-5 rounded-2xl border transition-all",
      unlocked
        ? "bg-white border-zinc-100 shadow-sm"
        : "bg-zinc-50 border-zinc-50 opacity-50 grayscale"
    )}
  >
    <div
      className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
        tier === "gold"
          ? "bg-yellow-50 text-yellow-600"
          : tier === "silver"
          ? "bg-slate-50 text-slate-500"
          : tier === "diamond"
          ? "bg-blue-50 text-blue-500"
          : "bg-amber-50 text-amber-700"
      )}
    >
      <Icon size={24} />
    </div>
    <h4 className="text-sm font-bold text-zinc-900">{name}</h4>
    <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
      {description}
    </p>
  </div>
);

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("content");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch based on PRD Section 2.2 & 2.4
    const fetchProfile = async () => {
      setProfile({
        id: "usr_1",
        display_name: "Joseph Ben-Avraham",
        username: username,
        is_verified_teacher: true,
        bio: "Scholar of Medieval Philosophy and Halakhic systems. Currently translating the &quot;Guide for the Perplexed&quot; into modern rhythmic English.",
        location: "Jerusalem, IL",
        website_url: "https://drashx.com/joseph",
        joined_at: "Teves 5784",
      });
      setStats({
        xp: 15482,
        level: 12,
        streak: 124,
        words_translated: 4500,
        flame_score: 1240,
        xp_to_next: 1440,
        xp_max: 1600,
      });
      setLoading(false);
    };
    fetchProfile();
  }, [username]);

  const activityData = useMemo(
    () => Array.from({ length: 364 }).map(() => Math.random()),
    []
  );

  const tabs: ProfileTabItem[] = [
    { id: "content", label: "Library Content", icon: Grid },
    { id: "activity", label: "Study History", icon: Clock },
    { id: "groups", label: "Learning Circles", icon: Users },
  ];

  if (loading || !profile || !stats)
    return (
      <div className="p-20 text-center text-zinc-400 font-bold uppercase tracking-widest">
        Loading Profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-paper pb-20">
      {/* 1. Profile Hero */}
      <section className="bg-zinc-950 text-white pt-24 pb-32 px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-end gap-10">
          {/* Avatar Container */}
          <div className="w-36 h-36 rounded-[2.5rem] bg-zinc-900 border-4 border-zinc-950 shadow-2xl flex items-center justify-center relative group">
            <span className="text-5xl font-bold">
              {profile.display_name[0]}
            </span>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 rounded-2xl border-4 border-zinc-950 flex items-center justify-center text-white shadow-lg">
              <Flame size={18} fill="currentColor" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center md:justify-start">
                <h1 className="text-4xl font-bold tracking-tight">
                  {profile.display_name}
                </h1>
                <LevelBadge level={stats.level} />
              </div>
              <p className="text-zinc-500 font-mono text-sm">
                @{profile.username}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-zinc-700" />{" "}
                  {profile.location}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Target size={14} className="text-zinc-700" /> {stats.streak}{" "}
                Day Streak
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-zinc-700" /> Joined{" "}
                {profile.joined_at}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-colors">
              <Share2 size={20} />
            </button>
            <button className="px-8 py-4 bg-white text-zinc-950 rounded-2xl font-bold text-sm hover:bg-orange-50 transition-colors shadow-lg">
              Follow Scholar
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-8 -mt-16 relative z-10 space-y-10">
        {/* 2. Global Impact Graph */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={16} className="text-orange-500" />
              Impact Graph
            </h3>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
              2,481 Contributions in 5785
            </span>
          </div>

          <div className="grid grid-cols-52 gap-1 h-24 overflow-hidden">
            {activityData.map((val, i) => (
              <div
                key={i}
                className={cn(
                  "w-full rounded-sm transition-all hover:scale-110 cursor-pointer",
                  val > 0.8
                    ? "bg-orange-500"
                    : val > 0.5
                    ? "bg-orange-200"
                    : "bg-zinc-100"
                )}
                title={`Contribution: ${Math.floor(val * 10)}`}
              />
            ))}
          </div>
          <div className="mt-6 flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
            <span>Tishrei</span>
            <span>Kislev</span>
            <span>Shevat</span>
            <span>Adar</span>
            <span>Nisan</span>
            <span>Sivan</span>
            <span>Av</span>
            <span>Elul</span>
          </div>
        </section>

        {/* 3. Core Stats & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Progress & Bio */}
          <div className="lg:col-span-4 space-y-8">
            {/* XP Rail */}
            <div className="bg-zinc-900 p-8 rounded-[2rem] text-white shadow-xl">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">
                Lifetime Progress
              </h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                    <span className="text-zinc-500">
                      XP to Level {stats.level + 1}
                    </span>
                    <span className="text-orange-400">
                      {stats.xp_to_next} / {stats.xp_max}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all duration-1000 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                      style={{
                        width: `${(stats.xp_to_next / stats.xp_max) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ImpactStat
                    icon={Flame}
                    label="The Flame"
                    value={stats.flame_score}
                    color="text-orange-500"
                  />
                  <ImpactStat
                    icon={Trophy}
                    label="Total XP"
                    value={stats.xp.toLocaleString()}
                    color="text-amber-500"
                  />
                </div>
                <div className="grid grid-cols-1">
                  <ImpactStat
                    icon={Languages}
                    label="Words Translated"
                    value={stats.words_translated.toLocaleString()}
                    color="text-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Scholarly Statement
              </h3>
              <p className="text-zinc-700 leading-relaxed italic text-sm border-l-2 border-orange-200 pl-4 py-2 bg-zinc-50/50 rounded-r-xl">
                {profile.bio}
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Trophy Case
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <AchievementCard
                  icon={Moon}
                  name="Night Watchman"
                  description="Study recorded between 2am and 5am."
                  tier="silver"
                  unlocked={true}
                />
                <AchievementCard
                  icon={Sword}
                  name="Daf Yomi Warrior"
                  description="30 consecutive days of Gemara study."
                  tier="gold"
                  unlocked={true}
                />
              </div>
              <button className="w-full py-4 bg-white border border-zinc-200 rounded-2xl flex items-center justify-between px-6 group hover:border-orange-500 transition-all">
                <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                  <Trophy size={14} className="text-amber-500" />
                  Global Leaderboard
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-orange-500" />
              </button>
            </div>
          </div>

          {/* Right: Content Tabs */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-8 border-b border-zinc-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 py-4 text-[11px] font-bold uppercase tracking-widest relative transition-all",
                    activeTab === tab.id
                      ? "text-zinc-900"
                      : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  <tab.icon size={14} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {activeTab === "content" && (
                <div className="grid gap-4">
                  {[
                    {
                      id: "n1",
                      type: "NOTEBOOK",
                      title: "Maimonides on the Limits of Reason",
                      ref_anchor: "Guide.1.1",
                      updated_at: "2 days ago",
                    },
                    {
                      id: "t1",
                      type: "TRANSLATION",
                      title: "Tehillim: A Poetic Reconstruction",
                      ref_anchor: "Psalms.1",
                      updated_at: "1 week ago",
                    },
                  ].map((res) => (
                    <div
                      key={res.id}
                      className="bg-white p-8 rounded-[2rem] border border-zinc-100 flex items-center justify-between group cursor-pointer hover:shadow-xl hover:border-orange-200 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                          {res.type === "NOTEBOOK" ? (
                            <MessageSquare size={24} />
                          ) : (
                            <BookOpen size={24} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 text-lg">
                            {res.title}
                          </h4>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight mt-1">
                            {res.type} &bull; Linked to {res.ref_anchor}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-zinc-200 group-hover:text-orange-500 transition-all" />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "activity" && (
                <div className="bg-zinc-50 rounded-[2rem] p-20 text-center border-2 border-dashed border-zinc-200">
                  <Clock className="w-16 h-16 text-zinc-200 mx-auto mb-6" />
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                    History Heatmap Coming Soon
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
