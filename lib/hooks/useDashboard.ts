"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { DashboardLayouts, WidgetConfig, WidgetID } from "@/types/dashboard";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * useDashboard Hook (v6.3 - Presets & Spatial Alignment)
 * Filepath: lib/hooks/useDashboard.ts
 * Role: Orchestrates the spatial grid with fixed size presets.
 * Alignment: Large maps to 4 width, 2 height for horizontal prominence.
 */

export const WIDGET_PRESETS = {
  small: { w: 1, h: 1, label: "Small (1x1)" },
  medium: { w: 2, h: 2, label: "Medium (2x2)" },
  large: { w: 4, h: 2, label: "Large (4x2)" }, // 4 Width, 2 Height
  full: { w: 4, h: 3, label: "Full (4x3)" }, // 4 Width, 3 Height
} as const;

export type WidgetPresetKey = keyof typeof WIDGET_PRESETS;

const DEFAULT_DESKTOP: WidgetConfig[] = [
  { id: "daily_portions", x: 0, y: 0, w: 2, h: 2, isActive: true },
  { id: "stats_xp", x: 2, y: 0, w: 2, h: 2, isActive: true },
  { id: "calendar", x: 0, y: 2, w: 4, h: 2, isActive: true },
  { id: "zmanim", x: 0, y: 4, w: 2, h: 2, isActive: true },
];

export function useDashboard() {
  const { user } = useAuth();
  const supabase = createClient();
  const [layouts, setLayouts] = useState<DashboardLayouts>({
    desktop: DEFAULT_DESKTOP,
    mobile: DEFAULT_DESKTOP,
    updatedAt: new Date().toISOString(),
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkSize = () => setIsMobile(window.innerWidth < 768);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    async function fetchLayout() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await supabase
          .from("user_settings")
          .select("dashboard_layout")
          .eq("user_id", user.id)
          .single();
        if (data?.dashboard_layout) {
          const remote = data.dashboard_layout as Partial<DashboardLayouts>;
          setLayouts({
            desktop: Array.isArray(remote.desktop)
              ? remote.desktop
              : DEFAULT_DESKTOP,
            mobile: Array.isArray(remote.mobile)
              ? remote.mobile
              : DEFAULT_DESKTOP,
            updatedAt: remote.updatedAt || new Date().toISOString(),
          });
        }
      } catch {
        /* Fallback */
      } finally {
        setIsLoading(false);
      }
    }
    fetchLayout();
  }, [user, supabase]);

  const persist = useCallback(
    async (newLayouts: DashboardLayouts) => {
      if (!user) return;
      setLayouts(newLayouts);
      await supabase
        .from("user_settings")
        .upsert(
          { user_id: user.id, dashboard_layout: newLayouts },
          { onConflict: "user_id" }
        );
    },
    [user, supabase]
  );

  const updateWidget = (id: WidgetID, patch: Partial<WidgetConfig>) => {
    const key = isMobile ? "mobile" : "desktop";
    const updated = (layouts[key] || []).map((w) =>
      w.id === id ? { ...w, ...patch } : w
    );
    persist({
      ...layouts,
      [key]: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const setWidgetPreset = (id: WidgetID, preset: WidgetPresetKey) => {
    const dims = WIDGET_PRESETS[preset];
    updateWidget(id, { w: dims.w, h: dims.h });
  };

  const activeWidgets = useMemo(() => {
    const list = isMobile ? layouts.mobile : layouts.desktop;
    return (Array.isArray(list) ? list : []).filter((w) => w.isActive);
  }, [layouts, isMobile]);

  return {
    activeWidgets,
    isEditing,
    setIsEditing,
    isAdding,
    setIsAdding,
    isLoading,
    isMobile,
    actions: {
      updateWidget,
      setWidgetPreset,
      removeWidget: (id: WidgetID) => updateWidget(id, { isActive: false }),
      addWidget: (id: WidgetID) => {
        const key = isMobile ? "mobile" : "desktop";
        const updated = [
          ...(layouts[key] || []),
          { id, x: 0, y: 10, w: 2, h: 2, isActive: true },
        ];
        persist({ ...layouts, [key]: updated });
        setIsAdding(false);
      },
      updateWidgetSettings: (
        id: WidgetID,
        settings: Record<string, unknown>
      ) => {
        const key = isMobile ? "mobile" : "desktop";
        const updated = (layouts[key] || []).map((w) =>
          w.id === id
            ? { ...w, settings: { ...(w.settings || {}), ...settings } }
            : w
        );
        persist({ ...layouts, [key]: updated });
      },
    },
  };
}
