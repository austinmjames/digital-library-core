"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LibrarySearchProps {
  onNavigate: () => void;
}

export function LibrarySearch({ onNavigate }: LibrarySearchProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Simple parser for "Book Chapter:Verse" or "Book Chapter"
    const parts = query.trim().split(" ");
    const lastPart = parts.pop();

    if (lastPart && /^\d+(:?\d+)?$/.test(lastPart)) {
      const bookName = parts.join(" ");
      const [chapter, verse] = lastPart.split(":");

      const cleanBook = bookName.toLowerCase().replace(/\s+/g, "-");
      const path = `/library/tanakh/${cleanBook}/${chapter}${
        verse ? `#verse-${verse}` : ""
      }`;
      router.push(path);
      onNavigate();
    } else {
      const cleanBook = query.toLowerCase().replace(/\s+/g, "-");
      router.push(`/library/tanakh/${cleanBook}/1`);
      onNavigate();
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative group w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pencil/40 group-focus-within:text-accent transition-colors" />
      <Input
        autoFocus
        placeholder="Jump to Book Chapter:Verse..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-12 pl-11 rounded-2xl bg-pencil/5 border-transparent focus:bg-white focus:border-accent/20 focus:shadow-sm transition-all text-base w-full"
      />
    </form>
  );
}
