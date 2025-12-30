import {
  ArrowRight,
  BookOpen,
  Clock,
  Flame,
  LucideIcon,
  MessageSquare,
  TrendingUp,
  Trophy,
} from "lucide-react";

/**
 * Dashboard Page
 * Filepath: app/(dashboard)/page.tsx
 * Role: The central "Home" feed for the DrashX Beit Midrash.
 * Design: Minimalist "Paper" theme with functional, high-density widgets.
 */

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-xl font-bold text-zinc-900">{value}</p>
    </div>
  </div>
);

interface ActivityItemProps {
  title: string;
  subtitle: string;
  time: string;
  icon: LucideIcon;
}

const ActivityItem = ({
  title,
  subtitle,
  time,
  icon: Icon,
}: ActivityItemProps) => (
  <div className="flex items-center justify-between py-4 border-b border-zinc-50 last:border-0 group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-white transition-colors">
        <Icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-800">{title}</p>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-[10px] text-zinc-400 font-medium">{time}</p>
      <ArrowRight className="w-3 h-3 text-zinc-300 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-all" />
    </div>
  </div>
);

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      {/* 1. Header & Welcome */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Shalom, Joseph</h1>
          <p className="text-zinc-500 mt-1">
            &quot;Turn it and turn it, for everything is in it.&quot; — Ben Bag
            Bag
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm">
          <Clock className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-bold text-zinc-600 uppercase tracking-tight">
            Next Zman: Mincha (1:45 PM)
          </span>
        </div>
      </header>

      {/* 2. Gamification Stats (XP / Flame / Level) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Flame}
          label="Contribution Score"
          value="1,240"
          color="bg-orange-500"
        />
        <StatCard
          icon={Trophy}
          label="Current Level"
          value="12 (Builder)"
          color="bg-amber-600"
        />
        <StatCard
          icon={BookOpen}
          label="Verses Studied"
          value="4,821"
          color="bg-blue-600"
        />
      </section>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle Columns: Activity & Feed */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Reading Section */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-zinc-400" />
                Continue Reading
              </h3>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>
            <div className="p-2">
              <ActivityItem
                title="Berakhot 24b"
                subtitle="Chapter 3: Tephillin and Recitation of the Shema"
                time="2 hours ago"
                icon={BookOpen}
              />
              <ActivityItem
                title="Mishneh Torah, Hilkhot Yesodei HaTorah"
                subtitle="Chapter 1: The Foundations of Knowledge"
                time="Yesterday"
                icon={BookOpen}
              />
            </div>
          </div>

          {/* Community Insights / Feed */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-zinc-400" />
                Community Insights
              </h3>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-zinc-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  Your study groups are quiet today.
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Start a discussion in the &quot;Daf Yomi&quot; circle to earn
                  +25 XP.
                </p>
              </div>
              <button className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors">
                Post an Insight
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Trending / Side Info */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Weekly Goal
              </h4>
              <p className="text-2xl font-bold mt-2">85% Complete</p>
              <div className="mt-4 h-2 w-full bg-zinc-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
              </div>
              <p className="text-[10px] text-zinc-400 mt-4 leading-relaxed">
                You&apos;ve studied 6 out of 7 days this week. Complete tomorrow
                to achieve a &quot;Sabbath Scholar&quot; badge.
              </p>
            </div>
            <Flame className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-5 rotate-12" />
          </div>

          {/* Trending Topics */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <h3 className="font-bold text-zinc-900 text-sm mb-4">
              Trending in Market
            </h3>
            <div className="space-y-4">
              {[
                "Koren English Translation",
                "Rabbi Sacks Insights",
                "Chassidic Stories",
              ].map((tag) => (
                <div
                  key={tag}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-900 transition-colors">
                    #{tag}
                  </span>
                  <ArrowRight className="w-3 h-3 text-zinc-200 group-hover:text-zinc-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
