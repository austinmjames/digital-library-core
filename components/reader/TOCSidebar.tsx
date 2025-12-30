"use client";

import { cn } from "@/lib/utils/utils";
import {
  Book as BookIcon,
  ChevronDown,
  ChevronRight,
  Hash,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";

/**
 * TOCSidebar Component (v1.2 - Type Safe)
 * Filepath: components/reader/TOCSidebar.tsx
 * Role: Provides hierarchical navigation for the current book being read.
 * Alignment: PRD Section 2.1 (The Reader Engine).
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
  const [isOpen, setIsOpen] = useState(depth < 1); // Expand first level by default
  const hasChildren = node.children && node.children.length > 0;
  const isActive = activeRef.startsWith(node.ref);

  return (
    <div className="w-full">
      <div
        className={cn(
          "group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-all",
          isActive
            ? "bg-orange-50 text-orange-900"
            : "hover:bg-zinc-50 text-zinc-600"
        )}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen);
          } else {
            onSelectRef(node.ref);
          }
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {hasChildren ? (
            isOpen ? (
              <ChevronDown size={14} className="shrink-0 text-zinc-400" />
            ) : (
              <ChevronRight size={14} className="shrink-0 text-zinc-400" />
            )
          ) : (
            <Hash size={12} className="shrink-0 text-zinc-300" />
          )}
          <div className="flex flex-col truncate">
            <span
              className={cn(
                "text-xs truncate transition-all",
                isActive ? "font-bold" : "font-medium"
              )}
            >
              {node.title}
            </span>
            {node.heTitle && (
              <span className="text-[10px] font-hebrew text-zinc-400" dir="rtl">
                {node.heTitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="mt-1">
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

  // Simple recursive filter logic
  const filteredToc = toc.filter(
    (node) =>
      node.title.toLowerCase().includes(filter.toLowerCase()) ||
      (node.heTitle && node.heTitle.includes(filter))
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200 w-72 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-zinc-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookIcon size={18} className="text-orange-600" />
            <h2 className="text-sm font-bold text-zinc-900 truncate max-w-[180px]">
              {bookTitle}
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-zinc-100 rounded-md transition-colors"
            >
              <X size={16} className="text-zinc-400" />
            </button>
          )}
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search chapters..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-orange-200 outline-none transition-all"
          />
        </div>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
        {filteredToc.length > 0 ? (
          filteredToc.map((node) => (
            <TOCItem
              key={node.id}
              node={node}
              activeRef={activeRef}
              onSelectRef={onSelectRef}
            />
          ))
        ) : (
          <div className="py-10 text-center">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              No sections found
            </p>
          </div>
        )}
      </div>

      {/* Footer / Context Info */}
      <div className="p-4 bg-zinc-50 border-t border-zinc-100">
        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
          <span>Current Ref</span>
          <span className="text-zinc-900">{activeRef}</span>
        </div>
      </div>
    </div>
  );
}
