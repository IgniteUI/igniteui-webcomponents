import { asNumber, omit, pick } from '../common/util.js';
import type IgcTileManagerComponent from './tile-manager.js';
import type IgcTileComponent from './tile.js';

export interface SerializedTile {
  colSpan: number;
  colStart: number | null;
  disableFullscreen: boolean;
  disableMaximize: boolean;
  disableResize: boolean;
  gridColumn: string;
  gridRow: string;
  maximized: boolean;
  position: number;
  rowSpan: number;
  rowStart: number | null;
  tileId: string | null;
  width: number | null;
  height: number | null;
}

class TileManagerSerializer {
  public tileManager: IgcTileManagerComponent;

  constructor(tileManager: IgcTileManagerComponent) {
    this.tileManager = tileManager;
  }

  private _getResizeContainer(tile: IgcTileComponent) {
    // biome-ignore lint/complexity/useLiteralKeys: Until we migrate to a symbol
    return tile['_resizeContainer']!;
  }

  public save(): SerializedTile[] {
    return this.tileManager.tiles.map((tile) => {
      const { gridColumn, gridRow } = getComputedStyle(tile);
      const { width, height } = this._getResizeContainer(tile).getSize();

      return {
        colSpan: tile.colSpan,
        colStart: tile.colStart,
        disableFullscreen: tile.disableFullscreen,
        disableMaximize: tile.disableMaximize,
        disableResize: tile.disableResize,
        gridColumn,
        gridRow,
        maximized: tile.maximized,
        position: tile.position,
        rowSpan: tile.rowSpan,
        rowStart: tile.rowStart,
        tileId: tile.tileId,
        width: asNumber(width) || null,
        height: asNumber(height) || null,
      };
    });
  }

  public saveAsJSON(): string {
    return JSON.stringify(this.save());
  }

  public load(tiles: SerializedTile[]): void {
    const mapped = new Map(tiles.map((tile) => [tile.tileId, tile]));
    const keys: (keyof SerializedTile)[] = [
      'gridColumn',
      'gridRow',
      'width',
      'height',
    ];

    for (const tile of this.tileManager.tiles) {
      if (!mapped.has(tile.tileId)) {
        continue;
      }

      const serialized = mapped.get(tile.tileId)!;
      const properties = omit(serialized, ...keys);
      const styles = pick(serialized, 'gridColumn', 'gridRow');
      const { width, height } = pick(serialized, 'width', 'height');

      Object.assign(tile, properties);
      Object.assign(tile.style, styles);
      this._getResizeContainer(tile).setSize(width, height);
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
