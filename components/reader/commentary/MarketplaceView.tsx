"use client";

import { useState } from "react";
import {
  Download,
  Loader2,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Commentary,
  UserCommentary,
  CollectionMetadata,
  ImportAction,
} from "@/lib/types/library";
import { CommentaryEntry } from "./CommentaryEntry";

interface MarketplaceViewProps {
  loading: boolean;
  groupedData: Record<string, Record<string, (Commentary | UserCommentary)[]>>;
  collections: CollectionMetadata[];
  onImport: ImportAction; // Updated to use ImportAction from Canvas
  languageMode: "en" | "he" | "bilingual";
  showFootnotes: boolean;
}

export function MarketplaceView({
  loading,
  groupedData,
  collections,
  onImport,
  languageMode,
  showFootnotes,
}: MarketplaceViewProps) {
  const [importCode, setImportCode] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "invalid"
  >("idle");
  const [expandedCommentators, setExpandedCommentators] = useState<
    Record<string, boolean>
  >({});

  const handleImportSubmit = async () => {
    if (!importCode.trim()) return;
    setIsImporting(true);
    setImportStatus("idle");

    // Parent handleImportCollection returns boolean
    const success = await onImport(importCode);

    if (success) {
      setImportStatus("success");
      setImportCode("");
    } else {
      setImportStatus("invalid");
    }

    setIsImporting(false);

    setTimeout(() => setImportStatus("idle"), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
            onChange={(e) => {
              setImportCode(e.target.value);
              if (importStatus !== "idle") setImportStatus("idle");
            }}
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
              "flex items-center gap-1.5 px-3 animate-in fade-in slide-in-from-top-1 duration-200",
              importStatus === "success" ? "text-emerald-600" : "text-red-600"
            )}
          >
            {importStatus === "success" ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Book Imported Successfully
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Invalid Share Code
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
                <div className="flex items-center gap-2 px-1">
                  <div
                    className={cn(
                      "w-1 h-3 rounded-full",
                      groupName === "Personal"
                        ? "bg-emerald-500"
                        : groupName === "Classic"
                        ? "bg-gold"
                        : "bg-indigo-500"
                    )}
                  />
                  <span className="text-[10px] font-bold text-pencil uppercase tracking-[0.2em]">
                    {groupName}{" "}
                    {groupName === "Personal" ? "Shared Books" : "Commentaries"}
                  </span>
                </div>

                <div className="space-y-3">
                  {authorKeys.map((author) => {
                    const isExpanded = expandedCommentators[author];
                    const collMeta = collections.find((c) => c.name === author);

                    return (
                      <div
                        key={author}
                        className="bg-white rounded-xl border border-pencil/10 shadow-sm hover:border-gold/30 transition-all overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedCommentators((p) => ({
                              ...p,
                              [author]: !p[author],
                            }))
                          }
                          className="w-full p-4 flex items-center justify-between hover:bg-pencil/[0.01]"
                        >
                          <div className="flex items-center gap-2">
                            <ChevronRight
                              className={cn(
                                "w-3 h-3 text-pencil transition-transform",
                                isExpanded && "rotate-90"
                              )}
                            />
                            <div className="flex flex-col items-start text-left">
                              <div className="flex items-center gap-2 text-left font-bold text-sm text-ink/80">
                                {author}
                              </div>
                              <span className="text-[9px] text-pencil/40 font-medium uppercase">
                                {authors[author].length} Entries Available
                              </span>
                            </div>
                          </div>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 text-pencil/20 transition-transform",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-pencil/5 pt-3 divide-y divide-pencil/5">
                            {authors[author].map((item) => (
                              <CommentaryEntry
                                key={item.id}
                                id={item.id}
                                textHe={
                                  "text_he" in item ? item.text_he : undefined
                                }
                                textEn={
                                  "text_en" in item
                                    ? item.text_en
                                    : (item as UserCommentary).content
                                }
                                isUserNote={"content" in item}
                                date={
                                  "created_at" in item
                                    ? item.created_at
                                    : undefined
                                }
                                authorDisplayName={
                                  "user_name" in item
                                    ? (item as UserCommentary).user_name
                                    : "unnamed"
                                }
                                isCollaborative={
                                  !!collMeta?.is_collaborative ||
                                  collMeta?.permission !== "owner"
                                }
                                authorName={author}
                                languageMode={languageMode}
                                showFootnotes={showFootnotes}
                              />
                            ))}
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
