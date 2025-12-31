import { ArrowRight, LucideIcon } from "lucide-react";
import Link from "next/link";

interface ActivityItemProps {
  title: string;
  subtitle: string;
  time: string;
  icon: LucideIcon;
  href?: string;
}

/**
 * DrashX ActivityItem
 * Role: Represents a single entry in the 'Continue Reading' or activity rails.
 * PRD Ref: Section 2.2 (Library & Marketplace - user_history).
 */
export const ActivityItem = ({
  title,
  subtitle,
  time,
  icon: Icon,
  href = "#",
}: ActivityItemProps) => (
  <Link
    href={href}
    className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 transition-all cursor-pointer group"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-white border border-zinc-100 rounded-xl flex items-center justify-center font-bold text-zinc-900 shadow-sm group-hover:shadow-md transition-all">
        <Icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900" />
      </div>
      <div>
        <h4 className="font-bold text-zinc-900 leading-none group-hover:text-blue-600 transition-colors">
          {title}
        </h4>
        <p className="text-[10px] text-zinc-400 font-mono uppercase mt-1.5 tracking-tighter">
          {subtitle}
        </p>
      </div>
    </div>
    <div className="text-right flex flex-col items-end">
      <p className="text-[10px] text-zinc-400 font-medium">{time}</p>
      <ArrowRight
        size={18}
        className="text-zinc-200 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all mt-1 opacity-0 group-hover:opacity-100"
      />
    </div>
  </Link>
);
