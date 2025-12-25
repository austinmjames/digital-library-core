"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Book, Quote, Loader2 } from "lucide-react";
import { MarketplaceItem, AuthorMetadata } from "@/lib/types/library";
import { fetchAuthorMetadata } from "@/app/actions/sovereignty";
import { MarketplaceBookCard } from "./shared/MarketplaceBookCard";

interface AuthorDetailViewProps {
  authorName: string;
  items: MarketplaceItem[];
  onBack: () => void;
  /**
   * Updated: Adjusted signature to accept the content type.
   * This allows the detail view to handle mixed lists of works.
   */
  onInstall: (id: string, type: "commentary" | "translation") => Promise<void>;
}

/**
 * AuthorDetailView
 * Comprehensive profile view for an author.
 * Fixed: Updated installation signature and removed unused 'History' icon.
 */
export function AuthorDetailView({
  authorName,
  items,
  onBack,
  onInstall,
}: AuthorDetailViewProps) {
  const [metadata, setMetadata] = useState<AuthorMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMeta() {
      setLoading(true);
      try {
        const data = await fetchAuthorMetadata(authorName);
        setMetadata(data);
      } catch (err) {
        console.error("Failed to load author metadata:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMeta();
  }, [authorName]);

  const authorWorks = items.filter((i) => i.author_name === authorName);

  return (
    <div className="flex-1 flex flex-col h-full bg-paper animate-in slide-in-from-right-4 duration-500 overflow-hidden font-sans">
      <header className="px-8 py-6 border-b border-pencil/5 bg-paper/95 backdrop-blur-md flex items-center gap-4 shrink-0 z-20">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-pencil/5 text-pencil transition-all active:scale-75 outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="text-xl font-serif font-bold text-ink tracking-tight">
            {authorName}
          </h3>
          {metadata && metadata.era && (
            <p className="text-[9px] text-gold font-black uppercase tracking-[0.2em] mt-0.5">
              {metadata.era} {metadata.died ? `• d. ${metadata.died}` : ""}
            </p>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-10 pb-32">
        {/* Background Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1 text-pencil/40">
            <Quote className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Author Background
            </span>
          </div>

          {loading ? (
            <div className="h-24 flex items-center justify-center bg-pencil/[0.02] rounded-[2rem] border border-dashed border-pencil/10">
              <Loader2 className="w-5 h-5 animate-spin text-pencil/20" />
            </div>
          ) : metadata && metadata.description_en ? (
            <div className="p-6 bg-white border border-pencil/10 rounded-[2rem] shadow-sm italic leading-relaxed text-sm text-pencil/80 font-serif">
              {metadata.description_en}
            </div>
          ) : (
            <div className="p-6 bg-pencil/[0.02] rounded-[2rem] border border-dashed border-pencil/10 text-center">
              <p className="text-xs text-pencil/40 italic uppercase tracking-wider">
                Biography unrolling...
              </p>
            </div>
          )}
        </section>

        {/* Works Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-pencil/40">
              <Book className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Published Works
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold text-pencil/20 uppercase">
              {authorWorks.length} Volumes
            </span>
          </div>

          <div className="space-y-4">
            {authorWorks.length === 0 ? (
              <p className="text-center py-10 text-xs text-pencil/30 italic">
                No public volumes found.
              </p>
            ) : (
              authorWorks.map((item) => (
                <MarketplaceBookCard
                  key={item.id}
                  item={item}
                  // Pass the item type dynamically from the mixed list
                  onInstall={(id) =>
                    onInstall(
                      id,
                      (item.type || "commentary") as
                        | "commentary"
                        | "translation"
                    )
                  }
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
