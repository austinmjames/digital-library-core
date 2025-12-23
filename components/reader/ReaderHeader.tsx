"use client";

import {
  Library,
  ChevronDown,
  Rows,
  Columns,
  Type,
  Settings2,
  Globe,
  Check,
  Settings,
  Calendar,
  LogOut,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  useTextSettings,
  DisplayMode,
} from "@/components/context/text-settings-context";
import { useAuth } from "@/components/context/auth-context";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TodayMenu } from "./TodayMenu";

interface ReaderHeaderProps {
  activeBook: string;
  activeChapter: number;
  onOpenNav: () => void;
}

export function ReaderHeader({
  activeBook,
  activeChapter,
  onOpenNav,
}: ReaderHeaderProps) {
  const router = useRouter();
  const { displayMode, fontSize, setDisplayMode, setFontSize } =
    useTextSettings();
  const { user, signOut } = useAuth();

  const [activeTranslation, setActiveTranslation] = useState("jps");
  const [isTodayOpen, setIsTodayOpen] = useState(false);

  const modes: { id: DisplayMode; label: string; icon: LucideIcon | string }[] =
    [
      { id: "hebrew", label: "Hebrew", icon: "אב" },
      { id: "english", label: "English", icon: "Aa" },
      { id: "bilingual-stacked", label: "Stacked", icon: Rows },
      { id: "bilingual-parallel", label: "Parallel", icon: Columns },
    ];

  const translations = [
    { id: "jps", label: "JPS 1985" },
    { id: "koren", label: "Koren (Coming Soon)", disabled: true },
  ];

  return (
    <>
      <TodayMenu isOpen={isTodayOpen} onClose={() => setIsTodayOpen(false)} />

      <header className="sticky top-0 z-40 w-full bg-paper/80 backdrop-blur-xl border-b border-pencil/10 px-4 h-14 flex items-center justify-between transition-colors duration-500">
        <div className="flex items-center gap-1">
          {/* Navigation Button */}
          <Button
            variant="ghost"
            onClick={onOpenNav}
            className="h-9 px-3 text-ink hover:bg-black/5 dark:hover:bg-white/10 gap-2 font-serif text-lg"
          >
            <Library className="w-4 h-4 text-pencil" />
            <span className="font-bold hidden sm:inline">{activeBook}</span>
            <span className="font-bold sm:hidden">
              {activeBook} {activeChapter}
            </span>
            <span className="text-pencil text-base font-sans hidden sm:inline">
              {activeChapter}
            </span>
            <ChevronDown className="w-3 h-3 text-pencil/50 ml-1" />
          </Button>

          {/* Today Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsTodayOpen(true)}
            className="w-9 h-9 rounded-full text-pencil hover:text-gold hover:bg-gold/10 transition-colors"
            title="Today's Study"
          >
            <Calendar className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {/* Auth Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 rounded-full text-pencil hover:text-ink"
                >
                  <UserIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs leading-none text-pencil truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-red-500 focus:text-red-500 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              // Updated route from /auth/login to /login assuming (auth) is a route group
              onClick={() => router.push("/login")}
              className="text-xs font-bold text-pencil hover:text-ink uppercase tracking-wider"
            >
              Log In
            </Button>
          )}

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full text-ink hover:bg-black/5 dark:hover:bg-white/10 transition-transform active:scale-95"
              >
                <Settings2 className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-60 p-3 rounded-[2.2rem] border-pencil/10 shadow-2xl bg-paper/90 backdrop-blur-2xl"
            >
              {/* Display Modes */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {modes.map((mode) => {
                  const isActive = displayMode === mode.id;
                  const Icon = mode.icon;

                  return (
                    <button
                      key={mode.id}
                      onClick={() => setDisplayMode(mode.id)}
                      title={mode.label}
                      className={cn(
                        "flex items-center justify-center py-3 rounded-[1.2rem] transition-all duration-300",
                        isActive
                          ? "bg-gold text-white shadow-md shadow-gold/25"
                          : "bg-pencil/15 text-pencil/80 hover:text-ink hover:bg-pencil/25"
                      )}
                    >
                      {typeof Icon === "string" ? (
                        <span
                          className={cn(
                            "text-[16px] font-bold leading-none",
                            mode.id === "hebrew"
                              ? "font-hebrew pt-0.5"
                              : "font-serif"
                          )}
                        >
                          {Icon}
                        </span>
                      ) : (
                        <Icon className="w-4.5 h-4.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              <DropdownMenuSeparator className="bg-pencil/10 mb-4 mx-1" />

              {/* Translation Submenu */}
              <div className="px-1 mb-4">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="w-full flex items-center justify-between px-2 py-2 rounded-xl text-[10px] font-bold text-pencil uppercase tracking-wider hover:bg-pencil/10 transition-colors cursor-pointer outline-none data-[state=open]:bg-pencil/10">
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 opacity-60" />
                      <span>Translation</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gold opacity-80">
                        {activeTranslation.toUpperCase()}
                      </span>
                      <ChevronDown className="w-3 h-3 opacity-30 -rotate-90" />
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-52 rounded-2xl p-1.5 shadow-xl bg-paper/95 backdrop-blur-xl border-pencil/10">
                      {translations.map((t) => (
                        <DropdownMenuItem
                          key={t.id}
                          disabled={t.disabled}
                          onClick={() => setActiveTranslation(t.id)}
                          className={cn(
                            "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors",
                            activeTranslation === t.id
                              ? "bg-pencil/10 text-ink"
                              : "text-pencil/70 hover:bg-pencil/5"
                          )}
                        >
                          {t.label}
                          {activeTranslation === t.id && (
                            <Check className="w-3.5 h-3.5 text-gold" />
                          )}
                        </DropdownMenuItem>
                      ))}

                      <DropdownMenuSeparator className="bg-pencil/10 my-1.5" />

                      <DropdownMenuItem
                        onClick={() => router.push("/library/translations")}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-pencil hover:text-ink cursor-pointer transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 opacity-60" />
                        <span>Manage Translations</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </div>

              <DropdownMenuSeparator className="bg-pencil/10 mb-4 mx-1" />

              {/* iOS Font Slider */}
              <div className="px-1 pt-1 pb-1">
                <div className="flex items-center gap-3">
                  <Type className="w-3 h-3 text-pencil/50" />
                  <input
                    type="range"
                    min="14"
                    max="32"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 h-1 bg-pencil/20 rounded-full accent-ink cursor-pointer appearance-none transition-all hover:bg-pencil/30"
                  />
                  <Type className="w-4.5 h-4.5 text-ink" />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
