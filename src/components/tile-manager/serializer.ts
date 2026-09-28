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

  public save(): SerializedTile[] {
    return this._tileManager.tiles.map((tile) => {
      const saved = {} as Record<keyof SerializedTile, unknown>;

      for (const key of SERIALIZED_KEYS) {
        saved[key] = tile[key];
      }

      return saved as SerializedTile;
    });
  }

  public saveAsJSON(): string {
    return JSON.stringify(this.save());
  }

  /**
   * Applies a layout to the tiles with the same `id`. The layout is not trusted. Copies
   * only the serialized properties, and ignores values that are not tile objects.
   */
  public load(tiles: SerializedTile[]): void {
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

  public loadFromJSON(data: string): void {
    if (data) {
      this.load(JSON.parse(data));
    }
  }
}

export function createSerializer(host: IgcTileManagerComponent) {
  return new TileManagerSerializer(host);
}
