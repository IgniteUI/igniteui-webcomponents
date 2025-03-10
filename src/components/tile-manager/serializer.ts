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

class TileManagerSerializer {
  public tileManager: IgcTileManagerComponent;

  constructor(tileManager: IgcTileManagerComponent) {
    this.tileManager = tileManager;
  }

  public save(): SerializedTile[] {
    return this.tileManager.tiles.map((tile) => {
      return {
        colSpan: tile.colSpan,
        colStart: tile.colStart,
        disableFullscreen: tile.disableFullscreen,
        disableMaximize: tile.disableMaximize,
        disableResize: tile.disableResize,
        maximized: tile.maximized,
        position: tile.position,
        rowSpan: tile.rowSpan,
        rowStart: tile.rowStart,
        id: tile.id,
      };
    });
  }

  public saveAsJSON(): string {
    return JSON.stringify(this.save());
  }

  public load(tiles: SerializedTile[]): void {
    const mapped = new Map(tiles.map((tile) => [tile.id, tile]));

    for (const tile of this.tileManager.tiles) {
      if (!mapped.has(tile.id)) {
        continue;
      }

      const serialized = mapped.get(tile.id)!;

      Object.assign(tile, serialized);
    }
  }

  public loadFromJSON(data: string): void {
    if (!data) return;

    this.load(JSON.parse(data));
  }
}

export function createSerializer(host: IgcTileManagerComponent) {
  return new TileManagerSerializer(host);
}
