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
  isDragging: boolean;
  dragStartPosition: { x: number; y: number };
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
 * @deprecated use IgcSplitterResizeEventArgs instead
 */
interface IgcSplitterResizeEventDetail extends IgcSplitterResizeEventArgs {}

/* jsonAPIPlainObject */
interface IgcSplitterExpansionChangedEventArgs {
  /** The pane whose collapsed state changed */
  pane: PanePosition;
  /** Whether the pane is now expanded (true) or collapsed (false) */
  expanded: boolean;
}

interface IgcSplitterComponentEventMap {
  igcResizeStart: CustomEvent<IgcSplitterResizeEventArgs>;
  igcResizing: CustomEvent<IgcSplitterResizeEventArgs>;
  igcResizeEnd: CustomEvent<IgcSplitterResizeEventArgs>;
  igcExpansionChanged: CustomEvent<IgcSplitterExpansionChangedEventArgs>;
}

export type {
  IgcSplitterComponentEventMap,
  IgcSplitterExpansionChangedEventArgs,
  IgcSplitterResizeEventArgs,
  IgcSplitterResizeEventDetail,
  PanePosition,
  PaneResizeSnapshot,
  SplitterPaneState,
  SplitterResizeState,
};
