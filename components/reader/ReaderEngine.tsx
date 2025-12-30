"use client";

import { cn } from "@/lib/utils/utils";
import { MessageSquare, MoreVertical, Share2 } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import * as AutoSizerModule from "react-virtualized-auto-sizer";
import * as ReactWindow from "react-window";

/**
 * ReaderEngine Component (v3.1 - Zero Any)
 * Filepath: components/reader/ReaderEngine.tsx
 * Role: High-performance spatial workspace.
 * Fixes: Eliminated all 'any' types by defining strict interfaces for library modules and item data.
 */

// --- 1. Type Definitions ---

interface ListMethods {
  resetAfterIndex: (index: number, shouldReRender?: boolean) => void;
  scrollToItem: (
    index: number,
    align?: "auto" | "smart" | "center" | "start" | "end"
  ) => void;
}

interface AutoSizerChildProps {
  height: number;
  width: number;
}

interface OnItemsRenderedProps {
  visibleStartIndex: number;
  visibleStopIndex: number;
  overscanStartIndex: number;
  overscanStopIndex: number;
}

export interface Verse {
  id: string;
  ref: string;
  hebrew_text?: string;
  english_text?: string;
  c1: number;
  c2: number;
  c3?: number;
  global_index: number;
  has_notes?: boolean;
}

interface ReaderEngineProps {
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
  theme?: "paper" | "sepia" | "dark";
  layout?: "stacked" | "side-by-side";
  fontSize?: number;
  isSidePanelOpen?: boolean;
}

// --- 2. Strict Library Typing ---

interface ReaderItemData {
  verses: Verse[];
  activeRef: string;
  onVerseClick: (ref: string) => void;
  theme: string;
  layout: string;
  fontSize: number;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: ReaderItemData;
}

interface VariableSizeListProps {
  height: number;
  width: number;
  itemCount: number;
  itemSize: (index: number) => number;
  children: React.ComponentType<RowProps>;
  ref?: React.Ref<ListMethods>;
  itemData?: ReaderItemData;
  onScroll?: (props: {
    scrollOffset: number;
    scrollDirection: "forward" | "backward";
  }) => void;
  onItemsRendered?: (props: OnItemsRenderedProps) => void;
  className?: string;
  overscanCount?: number;
}

interface AutoSizerProps {
  children: (props: AutoSizerChildProps) => React.ReactNode;
  className?: string;
}

// Define shapes for the untyped/loosely-typed modules to avoid 'any'
interface ReactWindowModule {
  VariableSizeList: React.ComponentType<VariableSizeListProps>;
  default?: {
    VariableSizeList: React.ComponentType<VariableSizeListProps>;
  };
}

interface AutoSizerModuleType {
  AutoSizer: React.ComponentType<AutoSizerProps>;
  default?:
    | React.ComponentType<AutoSizerProps>
    | { AutoSizer: React.ComponentType<AutoSizerProps> };
}

// Strict extraction
const VariableSizeList =
  (ReactWindow as unknown as ReactWindowModule).VariableSizeList ||
  (ReactWindow as unknown as ReactWindowModule).default?.VariableSizeList;

// Handling potential default export variations for AutoSizer
const AutoSizer =
  (AutoSizerModule as unknown as AutoSizerModuleType).AutoSizer ||
  ((AutoSizerModule as unknown as AutoSizerModuleType)
    .default as React.ComponentType<AutoSizerProps>);

// --- 3. Sub-Component: Verse Row ---

const VerseRow = React.memo(({ index, style, data }: RowProps) => {
  const { verses, activeRef, onVerseClick, theme, layout, fontSize } = data;
  const verse = verses[index];
  if (!verse) return null;

  const isActive = activeRef === verse.ref;

  return (
    <div
      style={style}
      className={cn(
        "border-b border-zinc-100/50 transition-colors cursor-pointer group",
        isActive
          ? "bg-orange-50/40 border-orange-100/50"
          : "hover:bg-zinc-50/30"
      )}
      onClick={() => onVerseClick(verse.ref)}
      data-ref={verse.ref}
    >
      <div className="max-w-5xl mx-auto py-10 px-6 md:px-12 flex items-start gap-8 relative">
        <div className="flex flex-col items-center gap-4 pt-1">
          <button
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
              verse.has_notes
                ? "bg-orange-100 text-orange-600 shadow-sm"
                : "text-zinc-300 hover:text-zinc-500"
            )}
          >
            <MessageSquare
              size={14}
              fill={verse.has_notes ? "currentColor" : "none"}
            />
          </button>
        </div>

        <div
          className={cn(
            "flex-1 grid gap-12",
            layout === "side-by-side" ? "grid-cols-2" : "grid-cols-1"
          )}
        >
          <div>
            <p
              className={cn(
                "font-hebrew text-right leading-loose text-zinc-900",
                theme === "dark" && "text-zinc-100"
              )}
              dir="rtl"
              style={{ fontSize: `${fontSize}px` }}
            >
              {verse.hebrew_text}
              <span className="mr-3 text-[10px] font-sans text-zinc-300 select-none">
                ({verse.c2})
              </span>
            </p>
          </div>
          <div>
            <p
              className={cn(
                "font-serif leading-relaxed text-zinc-600 italic",
                theme === "dark" && "text-zinc-400"
              )}
              style={{ fontSize: `${fontSize * 0.85}px` }}
            >
              {verse.english_text}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 text-zinc-300 hover:text-zinc-900 hover:bg-white rounded-lg border border-transparent hover:border-zinc-200 shadow-sm transition-all">
            <Share2 size={14} />
          </button>
          <button className="p-2 text-zinc-300 hover:text-zinc-900 hover:bg-white rounded-lg border border-transparent hover:border-zinc-200 shadow-sm transition-all">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>
    </div>
  );
});

VerseRow.displayName = "VerseRow";

// --- 4. Custom Hooks ---

function useSpatialTying(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  activeRef: string,
  isSidePanelOpen: boolean,
  theme: string
) {
  const drawCurves = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeRef || !isSidePanelOpen) {
      if (canvas)
        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sourceEl = document.querySelector(`[data-ref="${activeRef}"]`);
    const targetEl = document.querySelector('[data-commentary="primary"]');

    if (sourceEl && targetEl) {
      const sR = sourceEl.getBoundingClientRect();
      const tR = targetEl.getBoundingClientRect();
      const cR = canvas.getBoundingClientRect();

      const startX = sR.right - cR.left - 20;
      const startY = sR.top - cR.top + sR.height / 2;
      const endX = tR.left - cR.left;
      const endY = tR.top - cR.top + tR.height / 2;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + (endX - startX) / 2,
        startY,
        startX + (endX - startX) / 2,
        endY,
        endX,
        endY
      );
      ctx.strokeStyle =
        theme === "dark"
          ? "rgba(161, 161, 170, 0.4)"
          : "rgba(249, 115, 22, 0.3)";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [activeRef, isSidePanelOpen, theme, canvasRef]);

  useEffect(() => {
    const handleResize = () => drawCurves();
    window.addEventListener("resize", handleResize);
    const timeout = setTimeout(drawCurves, 100);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, [drawCurves]);

  return { drawCurves };
}

function useReaderLayout(verses: Verse[], fontSize: number, layout: string) {
  const getItemSize = useCallback(
    (index: number) => {
      const v = verses[index];
      if (!v) return 150;
      const hLen = v.hebrew_text?.length || 0;
      const eLen = v.english_text?.length || 0;
      const charsPerLine = layout === "side-by-side" ? 40 : 65;
      const lines = Math.ceil((hLen + eLen) / charsPerLine);
      return Math.max(120, lines * (fontSize * 1.5) + 120);
    },
    [verses, fontSize, layout]
  );

  return { getItemSize };
}

// --- 5. Main Component ---

export default function ReaderEngine({
  verses,
  activeRef,
  onVerseVisible,
  onVerseClick,
  onLoadNext,
  onLoadPrev,
  hasNextPage = false,
  hasPrevPage = false,
  isFetchingNextPage = false,
  isFetchingPrevPage = false,
  theme = "paper",
  layout = "stacked",
  fontSize = 20,
  isSidePanelOpen = false,
}: ReaderEngineProps) {
  const listRef = useRef<ListMethods | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { drawCurves } = useSpatialTying(
    canvasRef,
    activeRef,
    isSidePanelOpen,
    theme
  );
  const { getItemSize } = useReaderLayout(verses, fontSize, layout);

  useEffect(() => {
    if (listRef.current) listRef.current.resetAfterIndex(0);
  }, [verses, layout, fontSize]);

  const handleScroll = useCallback(
    ({
      scrollOffset,
      scrollDirection,
    }: {
      scrollOffset: number;
      scrollDirection: "forward" | "backward";
    }) => {
      drawCurves();
      if (scrollDirection === "forward" && hasNextPage && !isFetchingNextPage) {
        if (scrollOffset > verses.length * 200 * 0.8) onLoadNext?.();
      }
      if (
        scrollDirection === "backward" &&
        hasPrevPage &&
        !isFetchingPrevPage &&
        scrollOffset < 500
      ) {
        onLoadPrev?.();
      }
    },
    [
      drawCurves,
      verses.length,
      hasNextPage,
      hasPrevPage,
      isFetchingNextPage,
      isFetchingPrevPage,
      onLoadNext,
      onLoadPrev,
    ]
  );

  useEffect(() => {
    const index = verses.findIndex((v) => v.ref === activeRef);
    if (index !== -1 && listRef.current)
      listRef.current.scrollToItem(index, "start");
  }, [activeRef, verses]);

  const itemData: ReaderItemData = useMemo(
    () => ({
      verses,
      activeRef,
      onVerseClick,
      theme,
      layout,
      fontSize,
    }),
    [verses, activeRef, onVerseClick, theme, layout, fontSize]
  );

  return (
    <div
      className={cn(
        "w-full h-full overflow-hidden transition-colors duration-300 relative",
        theme === "paper" && "bg-[#faf9f6]",
        theme === "sepia" && "bg-[#f4ecd8]",
        theme === "dark" && "bg-zinc-950"
      )}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />

      {isFetchingPrevPage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/90 backdrop-blur-sm text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest animate-in slide-in-from-top-4">
          Fetching Previous...
        </div>
      )}

      {/* Strict types applied to AutoSizer Render Prop */}
      <AutoSizer>
        {({ height, width }: AutoSizerChildProps) => (
          <VariableSizeList
            ref={(inst: ListMethods | null) => {
              listRef.current = inst;
            }}
            height={height}
            itemCount={verses.length}
            itemSize={getItemSize}
            width={width}
            itemData={itemData}
            onScroll={handleScroll}
            onItemsRendered={({ visibleStartIndex }: OnItemsRenderedProps) => {
              if (verses[visibleStartIndex])
                onVerseVisible(verses[visibleStartIndex].ref);
            }}
            className="scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent"
            overscanCount={5}
          >
            {VerseRow}
          </VariableSizeList>
        )}
      </AutoSizer>

      {isFetchingNextPage && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/90 backdrop-blur-sm text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest animate-in slide-in-from-bottom-4">
          Loading Next...
        </div>
      )}
    </div>
  );
}
