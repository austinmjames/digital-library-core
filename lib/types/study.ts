/**
 * lib/types/study.ts
 * Types for user markers, schedules, and imports.
 */

export interface LibraryMarker {
  id: string;
  book_slug: string;
  c1_index: number;
  c2_index: number;
  label: string;
  type: "parasha" | "aliyah" | "daf" | "haftarah" | "custom";
  user_id?: string;
}

export interface ScheduleItem {
  id: string;
  schedule_id: string;
  marker_id: string;
  is_completed: boolean;
  day_number?: number;
  target_date?: string;
  marker?: LibraryMarker;
}

export interface UserSchedule {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  schedule_type: "calendar" | "sequence";
  created_at: string;
  items?: ScheduleItem[];
}

export type ImportAction = (code: string) => Promise<boolean>;
