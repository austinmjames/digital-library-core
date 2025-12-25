"use client";

import React, { useState, useEffect } from "react";
import { Download, Loader2, Plus, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Commentary,
  UserCommentary,
  CollectionMetadata,
  AuthorMetadata,
  ImportAction,
} from "@/lib/types/library";
import { fetchAuthorMetadata } from "@/app/actions";

export interface CommentaryMarketplaceViewProps {
  loading: boolean;
  groupedData: Record<string, Record<string, (Commentary | UserCommentary)[]>>;
  collections: CollectionMetadata[];
  onImport: ImportAction;
  myAuthors: string[];
  onToggleAuthor: (author: string) => void;
}

/**
 * CommentaryMarketplaceView
 * Handles the discovery of Sages and Community commentary collections.
 * Logic: If an author/collection is in 'myAuthors', it is hidden from here
 * to ensure the user only sees new things to discover.
 */
export function CommentaryMarketplaceView({
  loading,
  groupedData,
  myAuthors,
  onToggleAuthor,
  onImport,
}: CommentaryMarketplaceViewProps) {
  const [importCode, setImportCode] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [authorBios, setAuthorBios] = useState<Record<string, AuthorMetadata>>(
    {}
  );

  // Optimization: Fetch metadata (era, bio) for authors appearing in the list
  useEffect(() => {
    const authorsToFetch = Object.values(groupedData)
      .flatMap((group) => Object.keys(group))
      .filter(
        (name) => !authorBios[name] && name !== "Me" && !name.includes("@")
      );

    authorsToFetch.forEach(async (name) => {
      const meta = await fetchAuthorMetadata(name);
      if (meta) setAuthorBios((prev) => ({ ...prev, [name]: meta }));
    });
  }, [groupedData, authorBios]);

  const handleImportSubmit = async () => {
    if (!importCode.trim()) return;
    setIsImporting(true);
    try {
      await onImport(importCode);
      setImportCode("");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Quick Import via Share Code */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 group p-1 bg-pencil/5 rounded-full border border-pencil/10 transition-all focus-within:bg-white focus-within:border-gold/30">
          <div className="pl-3">
            <Download className="w-3.5 h-3.5 text-pencil/40 group-focus-within:text-gold" />
          </div>
          <input
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            placeholder="Paste share code..."
            className="flex-1 bg-transparent border-none outline-none text-[11px] font-medium py-1.5 text-ink placeholder:text-pencil/30"
            onKeyDown={(e) => e.key === "Enter" && handleImportSubmit()}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleImportSubmit}
            disabled={!importCode.trim() || isImporting}
            className="h-7 rounded-full text-[9px] font-black uppercase tracking-widest text-gold hover:bg-gold/5 px-4"
          >
            {isImporting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "Join"
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-pencil/40">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-widest">
            Searching the Archive...
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* We iterate through Personal (Shared), Classic, and Community groups */}
          {(["Classic", "Personal", "Community"] as const).map((groupName) => {
            const authorsInGroup = groupedData[groupName] || {};

            // FILTER: Only show authors that are NOT already in the user's library
            const discoverableAuthors = Object.keys(authorsInGroup).filter(
              (name) => !myAuthors.includes(name) && name !== "Me"
            );

            if (discoverableAuthors.length === 0) return null;

            return (
              <div key={groupName} className="space-y-4">
                <div className="flex items-center gap-2 px-1 border-b border-pencil/5 pb-2">
                  {groupName === "Classic" && (
                    <Sparkles className="w-3 h-3 text-gold fill-gold" />
                  )}
                  <span className="text-[10px] font-black text-pencil uppercase tracking-[0.2em]">
                    {groupName === "Classic"
                      ? "Classic Commentary"
                      : groupName === "Personal"
                      ? "Shared with You"
                      : "Community Layers"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {discoverableAuthors.map((author) => {
                    const bio = authorBios[author];
                    return (
                      <div
                        key={author}
                        className="p-5 bg-white rounded-[2rem] border border-pencil/10 shadow-sm hover:border-gold/30 hover:shadow-md transition-all flex flex-col gap-4 group/card"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-2xl bg-pencil/5 flex items-center justify-center text-pencil/30 group-hover/card:bg-gold/5 group-hover/card:text-gold transition-colors">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-serif font-bold text-base text-ink">
                                {author}
                              </span>
                              {bio?.era && (
                                <span className="text-[9px] font-black text-gold/60 uppercase tracking-widest mt-0.5">
                                  {bio.era} {bio.died ? `• d. ${bio.died}` : ""}
                                </span>
                              )}
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onToggleAuthor(author)}
                            className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-600 border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add
                          </Button>
                        </div>

                        {bio?.description_en && (
                          <div className="bg-pencil/[0.02] rounded-2xl p-4 border border-pencil/5">
                            <p className="text-[11px] text-pencil/70 leading-relaxed italic">
                              {bio.description_en}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Empty State within groups */}
          {Object.values(groupedData).every((g) =>
            Object.keys(g).every(
              (name) => myAuthors.includes(name) || name === "Me"
            )
          ) && (
            <div className="py-20 text-center opacity-30 italic text-sm">
              All available commentators are already in your library.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
