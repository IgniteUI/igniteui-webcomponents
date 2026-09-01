import { lastOf, partition } from '#internals/utils/arrays.js';
import type IgcTileManagerComponent from './tile-manager.js';
import type IgcTileComponent from './tile.js';

class TilesState {
  private readonly _manager: IgcTileManagerComponent;

  private get _tiles(): IgcTileComponent[] {
    return Array.from(
      this._manager.querySelectorAll<IgcTileComponent>(':scope > igc-tile')
    );
  }

  /**
   * Returns the current tiles of the tile manager sorted by their position.
   */
  public get tiles(): IgcTileComponent[] {
    return this._tiles.toSorted((a, b) => a.position - b.position);
  }

  constructor(manager: IgcTileManagerComponent) {
    this._manager = manager;
  }

  public assignPositions(): void {
    let nextPosition = 0;
    const [positionedTiles, nonPositionedTiles] = partition(
      this._tiles,
      (tile) => tile.position !== -1
    );

    positionedTiles.sort((a, b) => a.position - b.position);

    for (const tile of positionedTiles) {
      // Fill any unassigned slots before the next assigned tile's position
      while (nextPosition < tile.position && nonPositionedTiles.length > 0) {
        const nonPositionedTile = nonPositionedTiles.shift()!;
        nonPositionedTile.position = nextPosition++;
      }

      tile.position = nextPosition;
      nextPosition = tile.position + 1;
    }

    for (const tile of nonPositionedTiles) {
      tile.position = nextPosition++;
    }
  }

  /** Updates the default (manual) slot of the tile manager with the current tiles. */
  public assignTiles(): void {
    this._manager.renderRoot.querySelector('slot')!.assign(...this._tiles);
  }

  public add(tile: IgcTileComponent): void {
    if (tile.position > -1) {
      for (const each of this.tiles) {
        if (each !== tile && each.position >= tile.position) {
          each.position++;
        }
      }
      return;
    }

    const positionedTiles = this._tiles.filter((tile) => tile.position > -1);

    tile.position = positionedTiles.length
      ? Math.max(...positionedTiles.map((tile) => tile.position)) + 1
      : 0;
  }

  /**
   * Checks and adjusts tile spans based on the column count of the tile manager.
   */
  public adjustTileGridPosition(): void {
    const { columnCount } = this._manager;

    if (columnCount < 1) {
      return;
    }

    for (const tile of this.tiles) {
      let colStart = tile.colStart ?? 0;

      if (colStart > columnCount) {
        colStart = 0;
        tile.colStart = null;
      }

      if (colStart + tile.colSpan > columnCount) {
        tile.colSpan = columnCount - colStart + (colStart > 0 ? 1 : 0);
      }
    }
  }

  public remove(tile: IgcTileComponent): void {
    for (const each of this.tiles) {
      if (each.position >= tile.position) {
        each.position--;
      }
    }
  }
}

type TileDragStackEntry = {
  tile: IgcTileComponent;
  position: number;
  colStart: number | null;
  rowStart: number | null;
};

class TileDragStack {
  private _stack: TileDragStackEntry[] = [];

  public peek(): IgcTileComponent {
    return lastOf(this._stack).tile;
  }

  public pop(): void {
    this._stack.pop();
  }

  public push(tile: IgcTileComponent): void {
    const { position, colStart, rowStart } = tile;
    this._stack.push({ tile, position, colStart, rowStart });
  }

  public restore(): void {
    for (const { tile, ...placement } of this._stack.toReversed()) {
      Object.assign(tile, placement);
    }
  }

  public reset(): void {
    this._stack = [];
  }
}

export function createTilesState(manager: IgcTileManagerComponent) {
  return new TilesState(manager);
}

export function createTileDragStack(): TileDragStack {
  return new TileDragStack();
}

export function swapTiles(a: IgcTileComponent, b: IgcTileComponent): void {
  [a.colStart, b.colStart] = [b.colStart, a.colStart];
  [a.rowStart, b.rowStart] = [b.rowStart, a.rowStart];
  [a.position, b.position] = [b.position, a.position];
}
