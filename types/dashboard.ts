/**
 * Dashboard Type Definitions (v2.0 - Resizable Grid)
 * Role: Structural contracts for the custom resizable grid system.
 * Updates:
 * - Replaced WidgetSize strings with x/y/w/h grid coordinates.
 * - Added DashboardLayouts to support separate Mobile vs Desktop persistence.
 */

export type WidgetID =
  | "daily_portions"
  | "stats_xp"
  | "community_feed"
  | "calendar"
  | "zmanim"
  | "trophy_case";

export interface WidgetConfig {
  id: WidgetID;
  x: number; // Grid column start
  y: number; // Grid row start
  w: number; // Grid width (1-5)
  h: number; // Grid height (rows)
  isActive: boolean;
  settings?: Record<string, any>;
}

export interface DashboardLayouts {
  desktop: WidgetConfig[];
  mobile: WidgetConfig[];
  updatedAt: string;
}

export interface PirkeiAvotQuote {
  text: string;
  source: string;
}
