import type {
  ResizeDirection,
  ResizeState,
} from '#internals/directives/resize.js';
import { resolveCssLength } from '#internals/utils/dom.js';
import { asNumber } from '#internals/utils/math.js';
import {
  calculatePosition,
  calculateResizedSpan,
  calculateSnappedDimension,
  parseTrackSizes,
} from './resize-util.js';
import type IgcTileComponent from './tile.js';
import type {
  TileGridDimension,
  TileGridPosition,
  TilePosition,
} from './types.js';

const CssValues =
  /^\s*(?:(?:(?<start>[1-9]\d*)|auto)\s*\/\s*)?span\s+(?<span>[1-9]\d*)\s*$/i;

type ResizeAxis = 'column' | 'row';

type ResizeAxisState = {
  dimension: TileGridDimension;
  gap: number;
  prevDelta: number;
  prevSnapped: number;
};

function createAxisState(
  dimension: TileGridDimension,
  gap: number
): ResizeAxisState {
  return { dimension, gap, prevDelta: 0, prevSnapped: 0 };
}

/**
 * Parses a computed `[start /] span n`. A start of `auto`, no start, or another
 * form, as from author CSS, gives start -1, which `updateState` measures from
 * the tile offset. Another form also gives the span of the tile property.
 */
export function parseGridTrack(value: string, span: number): TilePosition {
  const groups = value.match(CssValues)?.groups;

  return {
    start: asNumber(groups?.start, -1),
    span: asNumber(groups?.span, span),
  };
}

function parseTileGridRect(tile: IgcTileComponent): TileGridPosition {
  const { gridColumn, gridRow } = getComputedStyle(tile);

  return {
    column: parseGridTrack(gridColumn, tile.colSpan),
    row: parseGridTrack(gridRow, tile.rowSpan),
  };
}

/**
 * Reads the axes of the grid, each with its own gap. A percentage gap resolves
 * against the content box. Only rows need a minimum size, because a column
 * span stops at the last column. `--min-row-height` computes to its authored
 * text, such as `10rem`, so it is resolved to pixels.
 */
function parseTileParentGrid(
  grid: HTMLElement,
  computed: CSSStyleDeclaration
): Record<ResizeAxis, ResizeAxisState> {
  const { columnGap, rowGap, gridTemplateColumns, gridTemplateRows } = computed;
  const { paddingLeft, paddingRight, paddingTop, paddingBottom } = computed;
  const minRowHeight = computed.getPropertyValue('--min-row-height');
  const width =
    grid.clientWidth - asNumber(paddingLeft) - asNumber(paddingRight);
  const height =
    grid.clientHeight - asNumber(paddingTop) - asNumber(paddingBottom);

  return {
    column: createAxisState(
      {
        entries: parseTrackSizes(gridTemplateColumns),
        minSize: 0,
      },
      resolveCssLength(grid, columnGap, width)
    ),
    row: createAxisState(
      {
        entries: parseTrackSizes(gridTemplateRows),
        minSize: resolveCssLength(grid, minRowHeight),
      },
      resolveCssLength(grid, rowGap, height)
    ),
  };
}

class TileResizeState {
  private _hasColStart = false;

  private _position!: TileGridPosition;
  private _axes!: Record<ResizeAxis, ResizeAxisState>;

  /** Snaps `state.current` to the grid tracks on the axes of `direction`. */
  public snap(state: ResizeState, direction: ResizeDirection): void {
    const { current, deltaX, deltaY } = state;

    if (direction !== 'vertical') {
      current.width = this._calculateSnappedSize(
        'column',
        deltaX,
        current.width
      );
    }

    if (direction !== 'horizontal') {
      current.height = this._calculateSnappedSize(
        'row',
        deltaY,
        current.height
      );
    }
  }

  public updateState(
    tileRect: DOMRect,
    tile: IgcTileComponent,
    grid: HTMLElement
  ): void {
    const computed = getComputedStyle(grid);

    this._hasColStart = tile.colStart !== null;
    this._position = parseTileGridRect(tile);
    this._axes = parseTileParentGrid(grid, computed);
    this._calculateTileStartPosition(grid, tileRect, computed);
  }

  /**
   * The placement of the tile for the resized rectangle, on the axes where the
   * rendered span changes. A span that the column count cuts keeps its value.
   * A start after the last column moves back so that the span fits, so a new
   * column span also sets an explicit start to the rendered one.
   */
  public calculateResizedGridPosition({
    width,
    height,
  }: DOMRect): Partial<
    Pick<IgcTileComponent, 'colSpan' | 'rowSpan' | 'colStart'>
  > {
    const { column, row } = this._position;
    const colSpan = this._calculateResizedSpan('column', width);
    const rowSpan = this._calculateResizedSpan('row', height);
    const columnChanged = colSpan !== column.span;

    return {
      ...(columnChanged && { colSpan }),
      ...(columnChanged && this._hasColStart && { colStart: column.start }),
      ...(rowSpan !== row.span && { rowSpan }),
    };
  }

  private _calculateResizedSpan(axis: ResizeAxis, targetSize: number): number {
    return calculateResizedSpan({
      targetSize,
      tilePosition: this._position[axis],
      tileGridDimension: this._axes[axis].dimension,
      gap: this._axes[axis].gap,
      isRow: axis === 'row',
    });
  }

  private _calculateSnappedSize(
    axis: ResizeAxis,
    currentDelta: number,
    currentSize: number
  ): number {
    const axisState = this._axes[axis];

    const snappedSize = calculateSnappedDimension({
      currentDelta,
      currentSize,
      prevDelta: axisState.prevDelta,
      prevSnapped: axisState.prevSnapped,
      gridEntries: axisState.dimension.entries,
      startIndex: this._position[axis].start,
      gap: axisState.gap,
    });

    axisState.prevDelta = currentDelta;
    axisState.prevSnapped = snappedSize;
    return snappedSize;
  }

  /**
   * Resolves a start that the computed placement does not give, for auto
   * placement or author CSS, from the offset of the tile in the grid.
   */
  private _calculateTileStartPosition(
    grid: HTMLElement,
    tileRect: DOMRect,
    computed: CSSStyleDeclaration
  ): void {
    const { column, row } = this._position;

    if (column.start >= 0 && row.start >= 0) {
      return;
    }

    const gridRect = grid.getBoundingClientRect();

    if (column.start < 0) {
      // Columns count from the inline-start edge, which is the right one in RTL.
      const offset =
        computed.direction === 'rtl'
          ? gridRect.right - tileRect.right
          : tileRect.left - gridRect.left;

      column.start = calculatePosition(
        offset - asNumber(computed.paddingInlineStart),
        this._axes.column.dimension.entries,
        this._axes.column.gap
      );
    }

    if (row.start < 0) {
      row.start = calculatePosition(
        tileRect.top - gridRect.top - asNumber(computed.paddingTop),
        this._axes.row.dimension.entries,
        this._axes.row.gap
      );
    }
  }
}

export function createTileResizeState(): TileResizeState {
  return new TileResizeState();
}
