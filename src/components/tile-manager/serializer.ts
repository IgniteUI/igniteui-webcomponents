import { omit, pick } from '../common/util.js';
import type IgcTileManagerComponent from './tile-manager.js';

export interface SerializedTile {
  colSpan: number;
  colStart: number | null;
  disableResize: boolean;
  gridColumn: string;
  gridRow: string;
  maximized: boolean;
  position: number;
  rowSpan: number;
  rowStart: number | null;
  tileId: string | null;
}

class TileManagerSerializer {
  public tileManager: IgcTileManagerComponent;

  constructor(tileManager: IgcTileManagerComponent) {
    this.tileManager = tileManager;
  }

  public save(): SerializedTile[] {
    return this.tileManager.tiles.map((tile) => {
      const { gridColumn, gridRow } = getComputedStyle(tile);

      return {
        colSpan: tile.colSpan,
        colStart: tile.colStart,
        disableResize: tile.disableResize,
        gridColumn,
        gridRow,
        maximized: tile.maximized,
        position: tile.position,
        rowSpan: tile.rowSpan,
        rowStart: tile.rowStart,
        tileId: tile.tileId,
      };
    });
  }

  public saveAsJSON(): string {
    return JSON.stringify(this.save());
  }

  public load(tiles: SerializedTile[]): void {
    const mapped = new Map(tiles.map((tile) => [tile.tileId, tile]));

    for (const tile of this.tileManager.tiles) {
      if (!mapped.has(tile.tileId)) {
        continue;
      }

      const serialized = mapped.get(tile.tileId)!;
      const properties = omit(serialized, 'gridColumn', 'gridRow');
      const styles = pick(serialized, 'gridColumn', 'gridRow');

      Object.assign(tile, properties);
      Object.assign(tile.style, styles);
    }
  }

  public loadFromJSON(data: string): void {
    this.load(JSON.parse(data));
  }
}

export function createSerializer(host: IgcTileManagerComponent) {
  return new TileManagerSerializer(host);
}
