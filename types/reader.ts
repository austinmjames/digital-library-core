// Filepath: src/lib/types/reader.ts

export type Theme = "paper" | "sepia" | "dark";
export type LayoutMode = "stacked" | "side-by-side";
export type ReaderContext = "global" | "group" | "private";

export interface Verse {
  ref: string;
  he: string;
  en: string;
  c1: number;
  c2: number;
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp?: string;
}

export interface CommentaryData {
  global: Comment[];
  dafyomi: Comment[];
  private: Comment[];
}
