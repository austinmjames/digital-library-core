"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Commentary,
  UserCommentary,
  CollectionMetadata,
  ImportAction,
  AuthorMetadata,
} from "@/lib/types/library";
import { fetchAuthorMetadata } from "@/app/actions";

interface MarketplaceViewProps {
  loading: boolean;
  groupedData: Record<string, Record<string, (Commentary | UserCommentary)[]>>;
  collections: CollectionMetadata[];
  onImport: ImportAction;
  myAuthors: string[];
  onToggleAuthor: (author: string) => void;
}

export function MarketplaceView({
  loading,
  groupedData,
  myAuthors,
  onToggleAuthor,
  onImport,
}: MarketplaceViewProps) {
  const [importCode, setImportCode] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "invalid"
  >("idle");
  const [authorBios, setAuthorBios] = useState<Record<string, AuthorMetadata>>(
    {}
  );

  // Fetch bios for visible authors
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
    const success = await onImport(importCode);
    setImportStatus(success ? "success" : "invalid");
    if (success) setImportCode("");
    setIsImporting(false);
    setTimeout(() => setImportStatus("idle"), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Quick Import Bar */}
      <div className="space-y-2">
        <div
          className={cn(
            "flex items-center gap-2 group p-1 bg-pencil/5 rounded-full border transition-all",
            importStatus === "success"
              ? "border-emerald-500/30 bg-emerald-50/50"
              : importStatus === "invalid"
              ? "border-red-500/30 bg-red-50/50"
              : "border-pencil/10 focus-within:bg-white focus-within:border-gold/30 focus-within:shadow-sm"
          )}
        >
          <div className="pl-3">
            <Download
              className={cn(
                "w-3.5 h-3.5 transition-colors",
                importStatus === "success"
                  ? "text-emerald-500"
                  : importStatus === "invalid"
                  ? "text-red-500"
                  : "text-pencil/40 group-focus-within:text-gold"
              )}
            />
          </div>
          <input
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            placeholder="Enter share code to import..."
            className="flex-1 bg-transparent border-none outline-none text-[11px] font-medium py-1.5 placeholder:text-pencil/50 text-ink"
            onKeyDown={(e) => e.key === "Enter" && handleImportSubmit()}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleImportSubmit}
            disabled={!importCode.trim() || isImporting}
            className="h-7 rounded-full text-[9px] font-bold text-gold uppercase tracking-[0.1em] hover:bg-gold/5"
          >
            {isImporting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "Import"
            )}
          </Button>
        </div>
        {importStatus !== "idle" && (
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 animate-in fade-in slide-in-from-top-1",
              importStatus === "success" ? "text-emerald-600" : "text-red-600"
            )}
          >
            {importStatus === "success" ? (
              <>
                <CheckCircle2 className="w-3 h-3" />{" "}
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Book Imported
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />{" "}
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Invalid Code
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-48 space-y-3 text-pencil/50">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest">
            Browsing Library...
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedData).map(([groupName, authors]) => {
            const authorKeys = Object.keys(authors);
            if (authorKeys.length === 0) return null;

            return (
              <div key={groupName} className="space-y-4">
                <div className="flex items-center gap-2 px-1 border-b border-pencil/5 pb-2">
                  <span className="text-[10px] font-bold text-pencil uppercase tracking-[0.2em]">
                    {groupName === "Classic"
                      ? "Classic Commentaries"
                      : groupName === "Personal"
                      ? "Shared Study Books"
                      : groupName}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {authorKeys.map((author) => {
                    const isAdded = myAuthors.includes(author);
                    const bio = authorBios[author];

                    return (
                      <div
                        key={author}
                        className="p-5 bg-white rounded-2xl border border-pencil/10 shadow-sm hover:border-gold/20 transition-all flex flex-col gap-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-pencil/5 flex items-center justify-center text-pencil/30">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-ink">
                                {author}
                              </span>
                              {bio?.era && (
                                <span className="text-[9px] font-bold text-gold/60 uppercase tracking-widest">
                                  {bio.era} •{" "}
                                  {bio.died ? `d. ${bio.died}` : "Unknown Era"}
                                </span>
                              )}
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant={isAdded ? "ghost" : "outline"}
                            onClick={() => onToggleAuthor(author)}
                            className={cn(
                              "h-8 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                              isAdded
                                ? "text-red-500 hover:bg-red-50 px-2"
                                : "text-emerald-600 border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 px-3"
                            )}
                          >
                            {isAdded ? (
                              <>
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add
                              </>
                            )}
                          </Button>
                        </div>

                        {bio?.description_en && (
                          <div className="bg-pencil/[0.02] rounded-xl p-3 border border-pencil/5">
                            <div className="flex items-center gap-1.5 mb-1 opacity-40">
                              <Info className="w-3 h-3" />
                              <span className="text-[9px] font-bold uppercase tracking-tighter">
                                About the Author
                              </span>
                            </div>
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
        </div>
      )}
    </div>
  );
}
