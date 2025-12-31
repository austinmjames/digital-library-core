"use client";

import {
  Hash,
  History,
  LucideIcon,
  Plus,
  PlusCircle,
  Users,
} from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

/**
 * WorkspaceSidebar
 * Design: Inverse Theme (zinc-950) with high-contrast text.
 */
export const WorkspaceSidebar = () => {
  return (
    <aside className="w-72 bg-zinc-950 border-r border-white/5 flex flex-col shrink-0 text-white z-20">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
          Workspace Tree
        </h3>
        <button className="text-zinc-500 hover:text-white transition-all">
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-1">
        <SidebarItem icon={Hash} label="Main Manuscript" active />
        <SidebarItem icon={History} label="Version History" />
        <SidebarItem icon={Users} label="Collaborators (0)" />
      </div>

      <div className="p-8 bg-zinc-900/50 border-t border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <PlusCircle size={14} className="text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Smart Links
          </span>
        </div>
        <p className="text-[10px] text-zinc-500 leading-relaxed italic">
          Type <span className="text-white font-mono font-bold">Book.1.1</span>{" "}
          to instantly anchor this insight to the canonical library.
        </p>
      </div>
    </aside>
  );
};

const SidebarItem = ({
  icon: Icon,
  label,
  active = false,
}: SidebarItemProps) => (
  <button
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold transition-all ${
      active
        ? "bg-white/10 text-white shadow-xl"
        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
    }`}
  >
    <Icon size={14} className={active ? "text-amber-500" : ""} />
    {label}
  </button>
);
