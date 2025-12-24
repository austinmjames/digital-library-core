"use client";

import * as React from "react";
import {
  Globe,
  ChevronRight,
  Check,
  Settings,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/auth-context";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface TranslationSelectorProps {
  onOpenAdvanced: () => void;
  activeVersionId: string; // Changed to required string to match activeLayer state
  onSelectVersion: (id: string) => void;
}

interface TranslationVersion {
  id: string;
  title: string;
  is_primary: boolean;
  language_code: string;
}

/**
 * TranslationSelector
 * Dynamically fetches and displays primary versions and user-created Sovereignty projects.
 * This component acts as the switcher for the "In-line Translation Layer."
 */
export function TranslationSelector({
  onOpenAdvanced,
  activeVersionId,
  onSelectVersion,
}: TranslationSelectorProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [versions, setVersions] = React.useState<TranslationVersion[]>([]);
  const [userProjects, setUserProjects] = React.useState<TranslationVersion[]>(
    []
  );
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch Available Layers (Public & Private)
  React.useEffect(() => {
    const fetchLayers = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Primary Versions (JPS, etc.)
        const { data: primaryData } = await supabase
          .from("text_versions")
          .select("version_title, language_code")
          .eq("is_primary", true);

        // Map to unique version titles
        const primaryMapped = Array.from(
          new Set(primaryData?.map((d) => d.version_title))
        ).map((title) => ({
          id:
            title === "Tanakh: The Holy Scriptures, published by JPS"
              ? "jps-1985"
              : title,
          title: title.replace("Tanakh: ", ""),
          is_primary: true,
          language_code: "en",
        }));

        // Ensure JPS 1985 is always at the top
        const sortedPrimary = primaryMapped.sort((a) =>
          a.id === "jps-1985" ? -1 : 1
        );
        setVersions(sortedPrimary);

        // 2. Fetch User Sovereignty Projects
        if (user) {
          const { data: projectData } = await supabase
            .from("translation_versions")
            .select("id, name")
            .eq("owner_id", user.id);

          if (projectData) {
            setUserProjects(
              projectData.map((p) => ({
                id: p.id,
                title: p.name,
                is_primary: false,
                language_code: "en",
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch translation layers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLayers();
  }, [user, supabase]);

  // Derived current label for the trigger button
  const currentLabel = React.useMemo(() => {
    const all = [...versions, ...userProjects];
    const match = all.find((v) => v.id === activeVersionId);
    if (match) return match.title;

    // Fallback logic for map keys
    if (activeVersionId === "jps-1985") return "JPS 1985";
    return activeVersionId;
  }, [activeVersionId, versions, userProjects]);

  return (
    <div className="px-1 mb-4">
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="w-full flex items-center justify-between px-2 py-2 rounded-xl text-[10px] font-bold text-pencil uppercase tracking-wider hover:bg-pencil/10 transition-colors cursor-pointer outline-none data-[state=open]:bg-pencil/10">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 opacity-60" />
            <span>Translation</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gold opacity-80 truncate max-w-[80px]">
              {currentLabel.toUpperCase()}
            </span>
            <ChevronRight className="w-3 h-3 opacity-30" />
          </div>
        </DropdownMenuSubTrigger>

        <DropdownMenuPortal>
          <DropdownMenuSubContent className="w-64 rounded-2xl p-1.5 shadow-xl bg-paper/95 backdrop-blur-xl border-pencil/10">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-pencil/40" />
              </div>
            ) : (
              <>
                <div className="px-2 py-1.5 text-[9px] font-bold text-pencil/40 uppercase tracking-[0.2em]">
                  Library Versions
                </div>
                {versions.map((v) => (
                  <DropdownMenuItem
                    key={v.id}
                    onClick={() => onSelectVersion(v.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors",
                      activeVersionId === v.id
                        ? "bg-pencil/10 text-ink"
                        : "text-pencil/70 hover:bg-pencil/5"
                    )}
                  >
                    {v.title}
                    {activeVersionId === v.id && (
                      <Check className="w-3.5 h-3.5 text-gold" />
                    )}
                  </DropdownMenuItem>
                ))}

                {userProjects.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-pencil/10 my-1.5" />
                    <div className="px-2 py-1.5 text-[9px] font-bold text-gold/60 uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <Sparkles className="w-2.5 h-2.5" /> My Sovereignty
                      Projects
                    </div>
                    {userProjects.map((p) => (
                      <DropdownMenuItem
                        key={p.id}
                        onClick={() => onSelectVersion(p.id)}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-bold cursor-pointer transition-colors",
                          activeVersionId === p.id
                            ? "bg-gold/5 text-gold"
                            : "text-pencil/70 hover:bg-pencil/5"
                        )}
                      >
                        {p.title}
                        {activeVersionId === p.id && (
                          <Check className="w-3.5 h-3.5 text-gold" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                <DropdownMenuSeparator className="bg-pencil/10 my-1.5" />

                <DropdownMenuItem
                  onClick={onOpenAdvanced}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-pencil hover:text-ink cursor-pointer transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 opacity-60" />
                  <span>Manage Translations</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </div>
  );
}
