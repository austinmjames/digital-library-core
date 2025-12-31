declare module "react-window" {
  import { Component, ComponentType, CSSProperties, Ref } from "react";

  export type ListOnItemsRenderedProps = {
    overscanStartIndex: number;
    overscanStopIndex: number;
    visibleStartIndex: number;
    visibleStopIndex: number;
  };

  export type ListProps = {
    className?: string;
    children: ComponentType<{ index: number; style: CSSProperties }>;
    height: number | string;
    itemCount: number;
    itemSize: number | ((index: number) => number);
    layout?: "vertical" | "horizontal";
    onItemsRendered?: (props: ListOnItemsRenderedProps) => void;
    onScroll?: (props: {
      scrollDirection: "forward" | "backward";
      scrollOffset: number;
    }) => void;
    scrollOffset?: number;
    width: number | string;
    ref?: Ref<VariableSizeList>;
  };

  export class VariableSizeList extends Component<ListProps> {
    resetAfterIndex(index: number, shouldForceUpdate?: boolean): void;
    scrollTo(scrollOffset: number): void;
    scrollToItem(
      index: number,
      align?: "auto" | "smart" | "center" | "end" | "start"
    ): void;
  }
}

declare module "react-virtualized-auto-sizer" {
  import { Component, CSSProperties, ReactNode } from "react";

  export interface Size {
    height: number;
    width: number;
  }

  export interface AutoSizerProps {
    children: (size: Size) => ReactNode;
    className?: string;
    defaultHeight?: number;
    defaultWidth?: number;
    disableHeight?: boolean;
    disableWidth?: boolean;
    nonce?: string;
    onResize?: (size: Size) => void;
    style?: CSSProperties;
  }

  export default class AutoSizer extends Component<AutoSizerProps> {}
}
