import { last, partition } from '../common/util.js';
import type IgcTileManagerComponent from './tile-manager.js';
import type IgcTileComponent from './tile.js';

class TilesState {
  private _nextEmptyPosition = 0;

  public manager: IgcTileManagerComponent;

  private get _tiles(): IgcTileComponent[] {
    return Array.from(
      this.manager.querySelectorAll<IgcTileComponent>(':scope > igc-tile')
    );
  }

  /**
   * Returns the current tiles of the tile manager sorted by their position.
   */
  public get tiles(): IgcTileComponent[] {
    return this._tiles.toSorted((a, b) => a.position - b.position);
  }

  constructor(manager: IgcTileManagerComponent) {
    this.manager = manager;
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
    this.manager.renderRoot.querySelector('slot')!.assign(...this._tiles);
  }

  public add(tile: IgcTileComponent): void {
    const tiles = this.tiles;

    if (tile.position > -1) {
      for (const each of tiles) {
        if (each !== tile && each.position >= tile.position) {
          each.position++;
        }
      }
    } else {
      const positionedTiles = this._tiles.filter((tile) => tile.position > -1);
      tile.position =
        positionedTiles.length > 1
          ? Math.max(...positionedTiles.map((tile) => tile.position)) + 1
          : this._nextEmptyPosition++;
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
  column?: number | null;
  row?: number | null;
};

class TileDragStack {
  private _stack: TileDragStackEntry[] = [];

  public peek(): IgcTileComponent {
    return last(this._stack).tile;
  }

  public add(tile: IgcTileComponent): void {
    this._stack.push({
      tile,
      position: tile.position,
      column: tile.colStart,
      row: tile.rowStart,
    });
  }

  public restore(): void {
    for (const {
      tile,
      position,
      column: colStart,
      row: rowStart,
    } of this._stack.toReversed()) {
      Object.assign(tile, {
        position,
        colStart,
        rowStart,
      });
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
  [a.rowStart, b.rowStart] = [b.rowStart, a.colStart];
  [a.position, b.position] = [b.position, a.position];
}
