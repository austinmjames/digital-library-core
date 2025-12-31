"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as AutoSizerModule from "react-virtualized-auto-sizer";
import * as ReactWindow from "react-window";
import {
  VariableSizeList as ListComponent,
  ListOnItemsRenderedProps,
} from "react-window";

import { cn } from "@/lib/utils/utils";
import { Layout, ReaderItemData, Theme, Verse } from "@/types/reader";
import { Hash } from "lucide-react";

/**
 * VirtualVerseList (v2.3 - Strict Type Safety)
 * Filepath: components/reader/VirtualVerseList.tsx
 * Role: High-performance virtualization engine for scholarly text.
 * PRD Alignment: Section 2.1 (The Reader Engine) & 4.1 (Aesthetics).
 * Fix: Eliminated all 'any' types in module resolution and component definitions.
 */

// --- Local Type Definitions to avoid dependency export issues ---

interface ListChildProps<T = unknown> {
  index: number;
  style: React.CSSProperties;
  data: T;
  isScrolling?: boolean;
}

// --- Module Resolution Logic (Turbopack Resilience) ---

interface ReactWindowModule {
  VariableSizeList?: typeof ListComponent;
  default?: {
    VariableSizeList?: typeof ListComponent;
  };
}

interface AutoSizerProps {
  children: (props: { height: number; width: number }) => React.ReactElement;
}

interface AutoSizerModuleType {
  AutoSizer?: React.ComponentType<AutoSizerProps>;
  default?:
    | React.ComponentType<AutoSizerProps>
    | { AutoSizer?: React.ComponentType<AutoSizerProps> };
}

/**
 * TypedVariableSizeList
 * We define a strict interface for the props to replace 'any'.
 */
interface VariableSizeListInterfaceProps {
  height: number;
  width: number;
  itemCount: number;
  itemSize: (index: number) => number;
  itemData: ReaderItemData;
  overscanCount?: number;
  className?: string;
  onItemsRendered?: (props: ListOnItemsRenderedProps) => void;
  children: React.ComponentType<ListChildProps<ReaderItemData>>;
  ref?: React.Ref<ListComponent>;
}

const TypedVariableSizeList = ((ReactWindow as unknown as ReactWindowModule)
  .VariableSizeList ||
  (ReactWindow as unknown as ReactWindowModule).default
    ?.VariableSizeList) as unknown as React.ComponentType<VariableSizeListInterfaceProps>;

const resolvedAutoSizer =
  (AutoSizerModule as unknown as AutoSizerModuleType).AutoSizer ||
  (
    (AutoSizerModule as unknown as AutoSizerModuleType).default as {
      AutoSizer?: React.ComponentType<AutoSizerProps>;
    }
  )?.AutoSizer ||
  (AutoSizerModule as unknown as AutoSizerModuleType).default;

const AutoSizer = resolvedAutoSizer as React.ComponentType<AutoSizerProps>;

// --- Main Component ---

interface VirtualVerseListProps {
  verses: Verse[];
  activeRef?: string;
  onVerseVisible: (ref: string) => void;
  onVerseClick: (ref: string) => void;
  theme: Theme;
  layout: Layout;
  fontSize: number;
  isSidePanelOpen: boolean;
  onLoadNext?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

export const VirtualVerseList: React.FC<VirtualVerseListProps> = ({
  verses = [],
  activeRef,
  onVerseVisible,
  onVerseClick,
  theme,
  layout,
  fontSize,
  isSidePanelOpen,
  onLoadNext,
  hasNextPage = false,
  isFetchingNextPage = false,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const listRef = useRef<ListComponent>(null);
  const sizeMap = useRef<Record<number, number>>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Clear size cache when structural settings change to prevent layout drift
  useEffect(() => {
    if (listRef.current) {
      sizeMap.current = {};
      listRef.current.resetAfterIndex(0, true);
    }
  }, [layout, fontSize, verses.length]);

  const setSize = useCallback((index: number, size: number) => {
    if (sizeMap.current[index] !== size) {
      sizeMap.current[index] = size;
      if (listRef.current) {
        listRef.current.resetAfterIndex(index, true);
      }
    }
  }, []);

  const getSize = useCallback(
    (index: number) => {
      return sizeMap.current[index] || (layout === "side-by-side" ? 120 : 160);
    },
    [layout]
  );

  // Sync scroll to active reference
  useEffect(() => {
    if (isMounted && activeRef && listRef.current && verses.length > 0) {
      const index = verses.findIndex((v) => v.ref === activeRef);
      if (index !== -1) {
        listRef.current.scrollToItem(index, "center");
      }
    }
  }, [activeRef, verses, isMounted]);

  const itemData: ReaderItemData = useMemo(
    () => ({
      verses,
      activeRef: activeRef || "",
      onVerseClick,
      theme,
      layout,
      fontSize,
      isSidePanelOpen,
      setSize,
    }),
    [
      verses,
      activeRef,
      onVerseClick,
      theme,
      layout,
      fontSize,
      isSidePanelOpen,
      setSize,
    ]
  );

  if (!isMounted) return null;

  if (!TypedVariableSizeList || !AutoSizer) {
    return (
      <div className="p-8 bg-zinc-950 text-white rounded-[2rem] font-mono text-[10px] uppercase tracking-widest max-w-xl mx-auto my-20 shadow-2xl border border-white/10">
        <div className="font-black mb-4 text-amber-500">Logic Stream Error</div>
        <p className="opacity-60 leading-relaxed">
          The Scriptorium failed to initialize the virtualization registers.
        </p>
      </div>
    );
  }

  if (verses.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6 opacity-30">
        <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center">
          <Hash size={32} className="text-zinc-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-serif italic text-zinc-900">
            The Scriptorium is Silent.
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
            Awaiting Ingestion
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative flex-1 min-h-[500px]">
      <AutoSizer>
        {({ height, width }) => (
          <TypedVariableSizeList
            ref={listRef}
            height={height || 800}
            width={width || 800}
            itemCount={verses.length}
            itemSize={getSize}
            itemData={itemData}
            overscanCount={10}
            className="custom-scrollbar"
            onItemsRendered={({
              visibleStartIndex,
              visibleStopIndex,
            }: ListOnItemsRenderedProps) => {
              if (verses[visibleStartIndex]) {
                onVerseVisible(verses[visibleStartIndex].ref);
              }
              if (
                hasNextPage &&
                !isFetchingNextPage &&
                visibleStopIndex >= verses.length - 5
              ) {
                onLoadNext?.();
              }
            }}
          >
            {VerseRow}
          </TypedVariableSizeList>
        )}
      </AutoSizer>
    </div>
  );
};

// --- Row Renderer ---

const VerseRow = ({ index, style, data }: ListChildProps<ReaderItemData>) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const verse = data.verses[index];

  useEffect(() => {
    if (rowRef.current) {
      data.setSize(index, rowRef.current.getBoundingClientRect().height);
    }
  }, [data, index]);

  if (!verse) return null;

  const isActive = data.activeRef === verse.ref;

  return (
    <div style={style} className="overflow-hidden">
      <div
        ref={rowRef}
        onClick={() => data.onVerseClick(verse.ref)}
        className={cn(
          "px-8 md:px-16 py-10 border-b border-zinc-100 transition-all duration-500 cursor-pointer relative group",
          isActive
            ? "bg-zinc-50/50 shadow-[inset_0_0_40px_rgba(0,0,0,0.02)]"
            : "hover:bg-zinc-50/30"
        )}
      >
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-1 transition-all duration-500",
            isActive
              ? "bg-amber-500 shadow-[2px_0_15px_rgba(245,158,11,0.3)]"
              : "bg-transparent group-hover:bg-zinc-200"
          )}
        />

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Hash
              size={10}
              className={cn(
                "transition-colors",
                isActive ? "text-amber-500" : "text-zinc-200"
              )}
            />
            <span
              className={cn(
                "text-[9px] font-black uppercase tracking-[0.3em] transition-colors",
                isActive
                  ? "text-zinc-950"
                  : "text-zinc-300 group-hover:text-zinc-400"
              )}
            >
              {verse.ref}
            </span>
          </div>
          {isActive && (
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">
                Active Anchor
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
          )}
        </div>

        <p
          className={cn(
            "font-serif-hebrew text-right leading-[2.2] mb-6 transition-all duration-500",
            isActive ? "text-zinc-950" : "text-zinc-800 opacity-90"
          )}
          dir="rtl"
          style={{ fontSize: `${data.fontSize}px` }}
        >
          {verse.he}
        </p>

        {verse.en && (
          <p
            className={cn(
              "font-sans text-base leading-relaxed max-w-3xl transition-all duration-500",
              isActive
                ? "text-zinc-600 font-medium"
                : "text-zinc-400 font-normal"
            )}
          >
            {verse.en}
          </p>
        )}

        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="p-3 bg-zinc-950 text-white rounded-xl shadow-2xl">
            <Hash size={14} className="text-amber-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualVerseList;
