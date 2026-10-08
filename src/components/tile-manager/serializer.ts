import { isPlainObject } from '#internals/utils/types.js';
import type IgcTileManagerComponent from './tile-manager.js';

export interface SerializedTile {
  colSpan: number;
  colStart: number | null;
  disableFullscreen: boolean;
  disableMaximize: boolean;
  disableResize: boolean;
  maximized: boolean;
  position: number;
  rowSpan: number;
  rowStart: number | null;
  id: string | null;
}

/** The tile properties of a layout. The type makes the list complete. */
const SERIALIZED: Record<keyof SerializedTile, true> = {
  colSpan: true,
  colStart: true,
  disableFullscreen: true,
  disableMaximize: true,
  disableResize: true,
  maximized: true,
  position: true,
  rowSpan: true,
  rowStart: true,
  id: true,
};

const SERIALIZED_KEYS = Object.keys(SERIALIZED) as Array<keyof SerializedTile>;

class TileManagerSerializer {
  private readonly _tileManager: IgcTileManagerComponent;

  constructor(tileManager: IgcTileManagerComponent) {
    this._tileManager = tileManager;
  }

  public saveAsJSON(): string {
    return JSON.stringify(
      this._tileManager.tiles.map((tile) =>
        Object.fromEntries(SERIALIZED_KEYS.map((key) => [key, tile[key]]))
      )
    );
  }

  /**
   * Applies a layout to the tiles with the same `id`. The layout is not trusted. Copies
   * only the serialized properties, and ignores values that are not tile objects.
   */
  public loadFromJSON(data: string): void {
    const tiles: unknown = data ? JSON.parse(data) : null;

    if (!Array.isArray(tiles)) {
      return;
    }

    const mapped = new Map(
      tiles.filter(isPlainObject).map((tile) => [tile.id, tile])
    );

    for (const tile of this._tileManager.tiles) {
      const serialized = mapped.get(tile.id);

      if (serialized) {
        for (const key of SERIALIZED_KEYS) {
          if (Object.hasOwn(serialized, key)) {
            Reflect.set(tile, key, serialized[key]);
          }
        }
      }
    }
  }
}

export function createSerializer(host: IgcTileManagerComponent) {
  return new TileManagerSerializer(host);
}
