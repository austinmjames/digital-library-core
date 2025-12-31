"use client";

import { cn } from "@/lib/utils/utils";
import {
  ChevronDown,
  ChevronRight,
  Hash,
  Layers,
  Library,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";

/**
 * TOCSidebar Component (v2.1)
 * Filepath: components/reader/TOCSidebar.tsx
 * Role: Hierarchical navigation tree for the current manuscript.
 * PRD Alignment: Section 2.1 (The Reader Engine) & 3.2 (Navigation).
 * Fix: Removed unused 'BookIcon' import.
 */

export interface TOCNode {
  id: string;
  title: string;
  heTitle?: string;
  ref: string;
  level: number;
  children?: TOCNode[];
}

interface TOCSidebarProps {
  toc: TOCNode[];
  activeRef: string;
  onSelectRef: (ref: string) => void;
  onClose?: () => void;
  bookTitle: string;
}

const TOCItem = ({
  node,
  activeRef,
  onSelectRef,
  depth = 0,
}: {
  node: TOCNode;
  activeRef: string;
  onSelectRef: (ref: string) => void;
  depth?: number;
}) => {
  const [isOpen, setIsOpen] = useState(depth < 1); // Auto-expand first level for "Scholar Orientation"
  const hasChildren = node.children && node.children.length > 0;
  const isActive = activeRef.startsWith(node.ref);

  return (
    <div className="w-full relative">
      {/* Visual Thread for Nested Items */}
      {depth > 0 && (
        <div
          className="absolute left-[18px] top-0 bottom-0 w-px bg-zinc-100 z-0"
          style={{ left: `${(depth - 1) * 16 + 22}px` }}
        />
      )}

      <button
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen);
          } else {
            onSelectRef(node.ref);
          }
        }}
        className={cn(
          "w-full group flex items-center justify-between py-2.5 px-4 rounded-xl cursor-pointer transition-all relative z-10 text-left mb-0.5",
          isActive
            ? "bg-zinc-950 text-white shadow-xl scale-[1.02]"
            : "hover:bg-zinc-50 text-zinc-500 hover:text-zinc-950"
        )}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="shrink-0 w-4 flex justify-center">
            {hasChildren ? (
              isOpen ? (
                <ChevronDown
                  size={14}
                  className={isActive ? "text-amber-400" : "text-zinc-400"}
                />
              ) : (
                <ChevronRight
                  size={14}
                  className={isActive ? "text-amber-400" : "text-zinc-400"}
                />
              )
            ) : (
              <Hash
                size={12}
                className={
                  isActive
                    ? "text-amber-500"
                    : "text-zinc-200 group-hover:text-zinc-400"
                }
              />
            )}
          </div>

          <div className="flex flex-col truncate">
            <span
              className={cn(
                "text-[11px] truncate tracking-tight transition-all",
                isActive ? "font-black uppercase" : "font-semibold"
              )}
            >
              {node.title}
            </span>
            {node.heTitle && (
              <span
                className={cn(
                  "text-[10px] font-serif-hebrew leading-none mt-0.5",
                  isActive ? "text-zinc-400" : "text-zinc-300"
                )}
                dir="rtl"
              >
                {node.heTitle}
              </span>
            )}
          </div>
        </div>

        {isActive && <div className="w-1 h-1 rounded-full bg-amber-500" />}
      </button>

      {hasChildren && isOpen && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          {node.children?.map((child: TOCNode) => (
            <TOCItem
              key={child.id}
              node={child}
              activeRef={activeRef}
              onSelectRef={onSelectRef}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function TOCSidebar({
  toc,
  activeRef,
  onSelectRef,
  onClose,
  bookTitle,
}: TOCSidebarProps) {
  const [filter, setFilter] = useState("");

  const filteredToc = toc.filter(
    (node) =>
      node.title.toLowerCase().includes(filter.toLowerCase()) ||
      (node.heTitle && node.heTitle.includes(filter))
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200/60 w-80 shadow-2xl z-40">
      {/* 1. Header (Premium Scriptorium Identity) */}
      <header className="p-6 border-b border-zinc-100 bg-zinc-50/30 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-950 text-white rounded-xl shadow-lg">
              <Library size={18} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                Manuscript Tree
              </h2>
              <p className="text-xs font-black text-zinc-900 truncate max-w-[160px] uppercase tracking-tighter">
                {bookTitle}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 rounded-xl transition-all text-zinc-400 hover:text-zinc-950"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Improved Search (Aligned with ResourceTab) */}
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-950 transition-colors"
            size={14}
          />
          <input
            type="text"
            placeholder="Quick search sections..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-[11px] font-bold focus:ring-8 focus:ring-zinc-950/5 focus:border-zinc-950 outline-none transition-all placeholder:text-zinc-200"
          />
        </div>
      </header>

      {/* 2. Hierarchical Navigation Tree */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {filteredToc.length > 0 ? (
          <div className="space-y-1">
            {filteredToc.map((node) => (
              <TOCItem
                key={node.id}
                node={node}
                activeRef={activeRef}
                onSelectRef={onSelectRef}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 opacity-30">
            <Layers size={32} className="mx-auto text-zinc-200" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              No matching sections
            </p>
          </div>
        )}
      </div>

      {/* 3. Status Footer */}
      <footer className="p-5 bg-zinc-50 border-t border-zinc-100">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">
            Scholar Position
          </span>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-black text-zinc-900 tracking-tighter uppercase">
              {activeRef}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
