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

interface IgcSplitterResizeEventDetail {
  /** The current size of the start panel in pixels */
  startPanelSize: number;
  /** The current size of the end panel in pixels */
  endPanelSize: number;
  /** The change in size since the resize operation started (only for igcResizing and igcResizeEnd) */
  delta?: number;
}

interface IgcSplitterComponentEventMap {
  igcResizeStart: CustomEvent<IgcSplitterResizeEventDetail>;
  igcResizing: CustomEvent<IgcSplitterResizeEventDetail>;
  igcResizeEnd: CustomEvent<IgcSplitterResizeEventDetail>;
}

export type {
  PanePosition,
  SplitterPaneState,
  PaneResizeSnapshot,
  SplitterResizeState,
  IgcSplitterResizeEventDetail,
  IgcSplitterComponentEventMap,
};
