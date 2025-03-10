export type TileResizeDimensions = {
  width: number | null;
  height: number | null;
};

export type TileGridDimension = {
  count: number;
  entries: number[];
  minSize: number;
};

export type SnappedDimension = { snappedSize: number; newDelta: number };

export type TilePosition = { start: number; span: number };

export type TileGridPosition = { column: TilePosition; row: TilePosition };

export type ResizeProps = {
  currentDelta: number;
  prevDelta: number;
  currentSize: number;
  gridEntries: number[];
  startIndex: number;
  prevSnapped: number;
};

export type ResizeSpanProps = {
  targetSize: number;
  tilePosition: TilePosition;
  tileGridDimension: TileGridDimension;
  gap: number;
  isRow: boolean;
};
