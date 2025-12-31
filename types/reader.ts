import { CSSProperties, Ref } from "react";

/**
 * Shared Reader Types
 * Filepath: src/types/reader.ts
 * Role: Centralized type definitions for the DrashX Reader ecosystem.
 * Update: Strict typing for spatial tying, manifest alignment, and virtualization.
 */

export type Theme = "paper" | "sepia" | "dark";
export type Layout = "stacked" | "side-by-side";

export interface Verse {
  id: string;
  book_id: string;
  ref: string; // [Book].[Section].[Segment]
  hebrew_text?: string;
  english_text?: string;
  he?: string; // Shorthand support from Sefaria
  en?: string; // Shorthand support from Sefaria
  path: string; // ltree path string: Tanakh.Torah.Genesis...
  c1: number;
  c2: number;
  c3?: number;
  global_index?: number;
  has_notes?: boolean;
}

/**
 * Extended methods for the react-window VariableSizeList instance
 */
export interface ListMethods {
  resetAfterIndex: (index: number, shouldForceUpdate?: boolean) => void;
  scrollToItem: (
    index: number,
    align?: "auto" | "smart" | "center" | "start" | "end"
  ) => void;
}

export interface AutoSizerChildProps {
  height: number;
  width: number;
}

export interface OnItemsRenderedProps {
  visibleStartIndex: number;
  visibleStopIndex: number;
  overscanStartIndex: number;
  overscanStopIndex: number;
}

export interface ReaderEngineProps {
  verses: Verse[];
  activeRef: string;
  onVerseVisible: (ref: string) => void;
  onVerseClick: (ref: string) => void;
  onLoadNext?: () => void;
  onLoadPrev?: () => void;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  isFetchingNextPage?: boolean;
  isFetchingPrevPage?: boolean;
  theme?: Theme;
  layout?: Layout;
  fontSize?: number;
  isSidePanelOpen?: boolean;
}

/**
 * Data passed to every row in the virtualized list
 */
export interface ReaderItemData {
  verses: Verse[];
  activeRef: string;
  onVerseClick: (ref: string) => void;
  theme: Theme;
  layout: Layout;
  fontSize: number;
  setSize: (index: number, size: number) => void;
  isSidePanelOpen: boolean; // Required for Bezier curve coordinate calculations
}

export interface RowProps {
  index: number;
  style: CSSProperties;
  data: ReaderItemData;
}

export interface VariableSizeListProps {
  height: number;
  width: number;
  itemCount: number;
  itemSize: (index: number) => number;
  children: React.ComponentType<RowProps>;
  ref?: Ref<ListMethods>;
  itemData?: ReaderItemData;
  onScroll?: (props: {
    scrollOffset: number;
    scrollDirection: "forward" | "backward";
  }) => void;
  onItemsRendered?: (props: OnItemsRenderedProps) => void;
  className?: string;
  overscanCount?: number;
}

export interface AutoSizerProps {
  children: (props: AutoSizerChildProps) => React.ReactNode;
  className?: string;
}
