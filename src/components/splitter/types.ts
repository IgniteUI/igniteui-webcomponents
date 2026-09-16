import type { StyleInfo } from 'lit/directives/style-map.js';

type PanePosition = 'start' | 'end';

interface SplitterPaneState {
  size?: string;
  minSize?: string;
  maxSize?: string;
  savedSize?: string;
  styles: StyleInfo;
}

interface PaneResizeSnapshot {
  initialSize: number;
  isPercentageBased: boolean;
  minSizePx?: number;
  maxSizePx?: number;
}

interface SplitterResizeState {
  startPane: PaneResizeSnapshot | null;
  endPane: PaneResizeSnapshot | null;
  dragStartPosition: { x: number; y: number };
  /** The active pointer id, or `-1` when no drag is in progress. */
  dragPointerId: number;
}

/* jsonAPIPlainObject */
interface IgcSplitterResizeEventArgs {
  /** The current size of the start panel in pixels */
  startPanelSize: number;
  /** The current size of the end panel in pixels */
  endPanelSize: number;
  /** The change in size since the resize operation started (only for igcResizing and igcResizeEnd) */
  delta?: number;
}

/**
 * @hidden
 * @deprecated since 7.1.0. Use the `IgcSplitterResizeEventArgs` type instead.
 */
interface IgcSplitterResizeEventDetail extends IgcSplitterResizeEventArgs {}

/* jsonAPIPlainObject */
interface IgcSplitterLayoutChangedEventArgs {
  /** The current size of the start pane */
  startSize: string;
  /** The current size of the end pane */
  endSize: string;
  /** Whether the start pane is currently collapsed */
  startCollapsed: boolean;
  /** Whether the end pane is currently collapsed */
  endCollapsed: boolean;
}

interface IgcSplitterComponentEventMap {
  igcResizeStart: CustomEvent<IgcSplitterResizeEventArgs>;
  igcResizing: CustomEvent<IgcSplitterResizeEventArgs>;
  igcResizeEnd: CustomEvent<IgcSplitterResizeEventArgs>;
  igcLayoutChanged: CustomEvent<IgcSplitterLayoutChangedEventArgs>;
}

export type {
  IgcSplitterComponentEventMap,
  IgcSplitterLayoutChangedEventArgs,
  IgcSplitterResizeEventArgs,
  IgcSplitterResizeEventDetail,
  PanePosition,
  PaneResizeSnapshot,
  SplitterPaneState,
  SplitterResizeState,
};
