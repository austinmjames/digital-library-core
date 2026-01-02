"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils/utils";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  Clock,
  Database,
  FileText,
  LayoutDashboard,
  Loader2,
  Search,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * DrashX Admin Dashboard (v1.0)
 * Filepath: app/admin/dashboard/page.tsx
 * Role: Centralized administrative control and system telemetry.
 * Style: Modern Google (Material 3).
 */

export default function AdminDashboard() {
  const { profile, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 400);
    return () => clearTimeout(timer);
  }, []);

  if (!authLoading && (!isAuthenticated || profile?.tier !== "pro")) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--paper)] text-[var(--ink)] font-bold uppercase tracking-widest text-xs">
        Architect Access Restricted
      </div>
    );
  }

  const stats = [
    {
      label: "Canonical Books",
      value: "2,842",
      change: "+12%",
      icon: Database,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Active Scholars",
      value: "12.4k",
      change: "+5%",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Verse Index",
      value: "1.2M",
      change: "+24%",
      icon: FileText,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      label: "System Uptime",
      value: "99.9%",
      change: "Stable",
      icon: Activity,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  const modules = [
    {
      title: "Ingestion Orchestrator",
      desc: "Synchronize canonical works from Sefaria and GitHub repositories.",
      path: "/admin/ingest",
      icon: Zap,
      status: "Active",
    },
    {
      title: "User Management",
      desc: "Oversee permissions, scholar tiers, and access control lists.",
      path: "/admin/users",
      icon: Users,
      status: "Verified",
    },
    {
      title: "Library Analytics",
      desc: "Heatmaps of study patterns and textual cross-references.",
      path: "/admin/analytics",
      icon: BarChart3,
      status: "Stable",
    },
    {
      title: "System Settings",
      desc: "Configure API gateways, database schemas, and global defaults.",
      path: "/admin/settings",
      icon: Settings,
      status: "Locked",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans transition-colors duration-300">
      {/* Header Tier */}
      <header className="sticky top-0 z-30 bg-[var(--paper)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] pt-6 pb-2 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-12">
          <div className="flex items-center gap-4 shrink-0">
            <div className="p-2 bg-[var(--ink)] rounded-xl text-white shadow-sm transition-transform active:scale-95">
              <LayoutDashboard size={20} strokeWidth={2} />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold tracking-tight text-[var(--ink)] uppercase leading-none">
                Admin{" "}
                <span className="text-[var(--ink-muted)] font-medium">
                  Dashboard
                </span>
              </h1>
            </div>
          </div>

          <div className="flex-1 max-w-2xl group">
            <div className="relative">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search administration modules or logs..."
                className="architect-input w-full pl-12 pr-6"
              />
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <button className="text-[var(--ink-muted)] hover:text-[var(--ink)] p-2 hover:bg-[var(--surface-hover)] rounded-full transition-all">
              <Bell size={20} strokeWidth={2} />
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-[var(--border-subtle)]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-none mb-1">Architect</p>
                <p className="text-[10px] text-[var(--ink-muted)] font-medium uppercase tracking-widest">
                  Level 4
                </p>
              </div>
              <div className="w-9 h-9 bg-[var(--surface-hover)] rounded-full flex items-center justify-center text-[var(--ink-muted)] border border-[var(--border-subtle)] shadow-inner">
                <UserCircle size={24} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-12 pb-40">
        {!isReady ? (
          <div className="flex flex-col items-center justify-center py-48 gap-4 text-[var(--ink-muted)]">
            <Loader2
              className="animate-spin text-[var(--accent-primary)]"
              size={36}
              strokeWidth={2}
            />
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] animate-pulse">
              Initializing Telemetry...
            </p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-700">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="paper-card p-6 flex flex-col justify-between group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl transition-transform group-hover:scale-105",
                        stat.bg,
                        stat.color
                      )}
                    >
                      <stat.icon size={18} strokeWidth={2.5} />
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface-hover)]",
                        stat.change.includes("+")
                          ? "text-emerald-600"
                          : "text-[var(--ink-muted)]"
                      )}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-medium tracking-tight text-[var(--ink)]">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Operational Modules & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Module Cards */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium tracking-tight">
                    System Infrastructure
                  </h2>
                  <button className="text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-widest hover:underline">
                    View Roadmap
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modules.map((mod) => (
                    <div
                      key={mod.title}
                      onClick={() => router.push(mod.path)}
                      className="paper-card paper-card-hover p-8 cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-[var(--surface-hover)] rounded-2xl text-[var(--ink)] group-hover:text-[var(--accent-primary)] transition-colors">
                            <mod.icon size={22} strokeWidth={2} />
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-[var(--surface-hover)] rounded-lg text-[var(--ink-muted)]">
                            {mod.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold tracking-tight mb-2">
                          {mod.title}
                        </h3>
                        <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                          {mod.desc}
                        </p>
                      </div>
                      <div className="mt-8 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] group-hover:text-[var(--accent-primary)] transition-colors">
                        Launch Engine
                        <ArrowUpRight size={14} strokeWidth={2.5} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Live Feed */}
              <div className="lg:col-span-4 space-y-6">
                <h2 className="text-xl font-medium tracking-tight">
                  Live System Feed
                </h2>
                <div className="paper-card overflow-hidden flex flex-col min-h-[400px]">
                  <header className="p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-hover)]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock
                        size={14}
                        className="text-[var(--accent-primary)]"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Recent Events
                      </span>
                    </div>
                    <div className="w-2 h-2 bg-[var(--accent-success)] rounded-full animate-pulse" />
                  </header>
                  <div className="flex-1 p-4 space-y-5 overflow-y-auto">
                    {[
                      {
                        type: "Sync",
                        text: "Mesillat Yesharim ETL Complete",
                        time: "2m ago",
                        status: "success",
                      },
                      {
                        type: "Auth",
                        text: "Architect session verified",
                        time: "15m ago",
                        status: "info",
                      },
                      {
                        type: "Database",
                        text: "Ltree index rebuild triggered",
                        time: "1h ago",
                        status: "warning",
                      },
                      {
                        type: "User",
                        text: "Scholar tier upgrade: User_482",
                        time: "3h ago",
                        status: "success",
                      },
                      {
                        type: "System",
                        text: "GitHub API rate limit refreshed",
                        time: "6h ago",
                        status: "info",
                      },
                    ].map((event, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div
                          className={cn(
                            "w-1 h-10 rounded-full shrink-0",
                            event.status === "success"
                              ? "bg-emerald-500"
                              : event.status === "warning"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          )}
                        />
                        <div className="space-y-1">
                          <p className="text-[13px] font-medium text-[var(--ink)] leading-none">
                            {event.text}
                          </p>
                          <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-[var(--ink-muted)]">
                            <span className="tracking-widest">
                              {event.type}
                            </span>
                            <span>•</span>
                            <span>{event.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="p-4 bg-[var(--surface-hover)]/30 border-t border-[var(--border-subtle)] text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                    Access Diagnostic Buffer
                  </button>
                </div>

                <div className="paper-card p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck size={20} className="text-blue-600" />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-blue-700">
                      Infrastructure Health
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-blue-600">
                      <span>API Throughput</span>
                      <span>92% Capacity</span>
                    </div>
                    <div className="h-1 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 w-[92%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-10 flex justify-center pointer-events-none z-0">
        <p className="text-[10px] font-medium uppercase tracking-[1.5em] text-[var(--ink-muted)] opacity-30">
          DrashX Admin v1.0
        </p>
      </footer>
    </div>
  );
}
