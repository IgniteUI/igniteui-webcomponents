import { isPlainObject } from '#internals/utils/types.js';
import type IgcTileComponent from './tile.js';

/** The tile properties of a layout, in the order that `saveLayout` writes them. */
const SERIALIZED_KEYS = [
  'colSpan',
  'colStart',
  'disableFullscreen',
  'disableMaximize',
  'disableResize',
  'maximized',
  'position',
  'rowSpan',
  'rowStart',
  'id',
] as const;

export type SerializedTile = Pick<
  IgcTileComponent,
  (typeof SERIALIZED_KEYS)[number]
>;

export function serializeTiles(tiles: IgcTileComponent[]): string {
  return JSON.stringify(
    tiles.map((tile) =>
      Object.fromEntries(SERIALIZED_KEYS.map((key) => [key, tile[key]]))
    )
  );
}

/**
 * Applies a layout to the tiles with the same `id`. The layout is untrusted:
 * only the serialized keys of plain-object entries are copied. Invalid JSON
 * throws. Returns `true` when the layout applied to a tile.
 */
export function applyLayout(tiles: IgcTileComponent[], data: string): boolean {
  const layout: unknown = data ? JSON.parse(data) : null;

  if (!Array.isArray(layout)) {
    return false;
  }

  let applied = false;

  const mapped = new Map(
    layout.filter(isPlainObject).map((tile) => [tile.id, tile])
  );

  for (const tile of tiles) {
    const serialized = mapped.get(tile.id);

    if (serialized) {
      applied = true;

      for (const key of SERIALIZED_KEYS) {
        if (Object.hasOwn(serialized, key)) {
          Reflect.set(tile, key, serialized[key]);
        }
      }
    }
  }

  return applied;
}
