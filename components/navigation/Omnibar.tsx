"use client";

import {
  Book,
  BookOpen,
  Command,
  Flame,
  LucideIcon,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/**
 * Omnibar Component (v1.3 - Type Refinement)
 * Filepath: components/navigation/Omnibar.tsx
 * Role: The global "Cmd+K" palette for jumping across the DrashX canon.
 * Alignment: PRD Section 4.2 (Discovery) & Technical Manifest Section 5 (Ref Format).
 */

interface OmnibarItem {
  id: string;
  title: string;
  type: "book" | "command" | "recent";
  icon: LucideIcon;
  targetRef?: string;
}

export const Omnibar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // 1. Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2. Navigation Logic
  const handleSelect = useCallback(
    (item: OmnibarItem) => {
      if (item.type === "book") {
        // Default to start of book if no specific segment provided
        const slug = item.targetRef || `${item.title}.1.1`;
        router.push(`/read/${slug.replace(/\s+/g, ".")}`);
      } else if (item.id === "daf") {
        router.push("/read/Berakhot.2a");
      } else if (item.id === "set") {
        router.push("/settings");
      }

      setIsOpen(false);
      setQuery("");
    },
    [router]
  );

  // 3. Filtered Results (Aligned with DrashX Library Schema)
  // Fix: Explicitly typing the array to resolve union type inference issues
  const suggestions: OmnibarItem[] = (
    [
      { id: "gen", title: "Genesis", type: "book", icon: Book },
      { id: "exo", title: "Exodus", type: "book", icon: Book },
      { id: "ber", title: "Berakhot", type: "book", icon: BookOpen },
      {
        id: "daf",
        title: "Today&apos;s Daf Yomi",
        type: "command",
        icon: Flame,
      },
      { id: "set", title: "Open Settings", type: "command", icon: Settings },
    ] as OmnibarItem[]
  ).filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search Input Area */}
        <div className="flex items-center px-6 py-5 border-b border-zinc-100 bg-zinc-50/30">
          <Search className="w-5 h-5 text-zinc-400 mr-4" />
          <input
            autoFocus
            className="flex-grow bg-transparent border-none outline-none text-zinc-900 placeholder:text-zinc-400 text-lg font-medium"
            placeholder="Jump to book, verse, or command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-200/50 rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-200">
          {suggestions.length > 0 ? (
            <div className="space-y-1">
              <p className="px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                Archives &amp; Commands
              </p>
              {suggestions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-zinc-50 rounded-xl transition-all group border border-transparent hover:border-zinc-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white border border-zinc-100 rounded-xl flex items-center justify-center shadow-sm group-hover:border-orange-200 transition-colors">
                        <Icon className="w-5 h-5 text-zinc-500 group-hover:text-orange-600" />
                      </div>
                      <span className="font-bold text-zinc-700 group-hover:text-zinc-900">
                        {item.title}
                      </span>
                    </div>
                    {item.type === "command" && (
                      <Sparkles className="w-4 h-4 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto border border-zinc-100">
                <Search className="text-zinc-200 w-6 h-6" />
              </div>
              <div className="max-w-xs mx-auto">
                <p className="text-sm font-bold text-zinc-500">
                  No matches for &quot;{query}&quot;
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                  Search the archives by typing a book name like
                  &quot;Genesis&quot; or a system command.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="p-4 bg-zinc-50/50 border-t border-zinc-100 flex justify-between items-center px-6">
          <div className="flex gap-6 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-zinc-200 text-zinc-600 rounded">
                ↑↓
              </span>
              Navigate
            </span>
            <span className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-zinc-200 text-zinc-600 rounded">
                ↵
              </span>
              Select
            </span>
          </div>
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter opacity-50">
            DrashX Global Command v1.2
          </span>
        </div>
      </div>
    </div>
  );
};
