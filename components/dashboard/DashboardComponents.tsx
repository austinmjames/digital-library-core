"use client";

import { cn } from "@/lib/utils/utils";
import { ArrowRight, BookOpen, LucideIcon } from "lucide-react";
import Link from "next/link";

/**
 * Dashboard UI Components (v1.0)
 * Filepath: components/dashboard/DashboardComponents.tsx
 * Role: Presentational components for the Home Dashboard.
 */

interface DailyStudyItem {
  id: string;
  type: "Daf Yomi" | "Parashah" | "Mishnah Yomi";
  ref: string;
  heRef: string;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}) => (
  <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:border-orange-100">
    <div className={cn("p-3 rounded-2xl bg-opacity-10", color)}>
      <Icon className={cn("w-6 h-6", color.replace("bg-", "text-"))} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-xl font-bold text-zinc-900">{value}</p>
    </div>
  </div>
);

export const ActivityItem = ({
  title,
  subtitle,
  time,
  icon: Icon,
  href,
}: {
  title: string;
  subtitle: string;
  time: string;
  icon: LucideIcon;
  href: string;
}) => (
  <Link
    href={href}
    className="w-full flex items-center justify-between py-5 border-b border-zinc-50 last:border-0 group transition-colors text-left px-6 hover:bg-zinc-50/50"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-white border border-zinc-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
        <Icon className="w-5 h-5 text-zinc-400 group-hover:text-orange-600" />
      </div>
      <div>
        <p className="text-sm font-bold text-zinc-800">{title}</p>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
        {time}
      </span>
      <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
    </div>
  </Link>
);

export const DailyStudyCard = ({ item }: { item: DailyStudyItem }) => (
  <Link
    href={`/read/${item.ref.replace(/\s+/g, ".")}`}
    className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all group"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          {item.type}
        </span>
        <h3 className="text-lg font-bold text-zinc-900 group-hover:text-orange-600 transition-colors">
          {item.ref}
        </h3>
      </div>
      <div className="p-2.5 bg-zinc-50 rounded-xl group-hover:bg-orange-50 transition-colors">
        <BookOpen className="w-5 h-5 text-zinc-400 group-hover:text-orange-600" />
      </div>
    </div>

    <div className="flex items-center justify-between">
      <p className="font-hebrew text-lg text-zinc-500" dir="rtl">
        {item.heRef}
      </p>
      <div className="flex items-center gap-1 text-zinc-900 font-bold text-[10px] uppercase tracking-wider">
        Study <ArrowRight size={12} />
      </div>
    </div>
  </Link>
);
