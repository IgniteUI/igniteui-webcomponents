import { startViewTransition } from '#animations/view-transition.js';
import { partition } from '#internals/utils/arrays.js';
import type IgcTileManagerComponent from './tile-manager.js';
import type IgcTileComponent from './tile.js';

type Positioned = Pick<IgcTileComponent, 'position'>;

function byPosition(a: Positioned, b: Positioned): number {
  return a.position - b.position;
}

class TilesState {
  private readonly _manager: IgcTileManagerComponent;

  private get _tiles(): IgcTileComponent[] {
    return Array.from(this._manager.children).filter(
      (element): element is IgcTileComponent => element.localName === 'igc-tile'
    );
  }

  /** The tiles sorted by their position. */
  public get tiles(): IgcTileComponent[] {
    return this._tiles.toSorted(byPosition);
  }

  constructor(manager: IgcTileManagerComponent) {
    this._manager = manager;
  }

  public assignPositions(): void {
    let nextPosition = 0;
    const [positionedTiles, nonPositionedTiles] = partition(
      this._tiles,
      (tile) => tile.position >= 0
    );

    positionedTiles.sort(byPosition);

    for (const tile of positionedTiles) {
      // Give the free positions before this tile to the tiles without one.
      while (nextPosition < tile.position && nonPositionedTiles.length > 0) {
        const nonPositionedTile = nonPositionedTiles.shift()!;
        nonPositionedTile.position = nextPosition++;
      }

      tile.position = nextPosition++;
    }

    for (const tile of nonPositionedTiles) {
      tile.position = nextPosition++;
    }
  }

  /** Starts a new layout. The restore of a drag from before it changes no tiles. */
  public replaceLayout(): void {
    layoutVersions.set(this._manager, getLayoutVersion(this._manager) + 1);
  }

  /** Assigns the tiles to the manual default slot of the manager. */
  public assignTiles(): void {
    this._manager.renderRoot.querySelector('slot')!.assign(...this._tiles);
  }

  /**
   * Renumbers the tiles 0 to n - 1 by position. An `added` tile with a position
   * goes to that place. Tiles without one go last, in DOM order.
   */
  public normalize(added: ReadonlySet<IgcTileComponent> = new Set()): void {
    const [newTiles, ordered] = partition(
      this._tiles,
      (tile) => added.has(tile) || tile.position < 0
    );
    const [placed, appended] = partition(
      newTiles,
      (tile) => tile.position >= 0
    );

    ordered.sort(byPosition);

    for (const tile of placed.sort(byPosition)) {
      ordered.splice(tile.position, 0, tile);
    }

    for (const [index, tile] of [...ordered, ...appended].entries()) {
      if (tile.position !== index) {
        tile.position = index;
      }
    }
  }

  /** Fits the column start and span of each tile into a fixed column count. */
  public adjustTileGridPosition(): void {
    const { columnCount } = this._manager;

    if (columnCount < 1) {
      return;
    }

    for (const tile of this._tiles) {
      if ((tile.colStart ?? 0) > columnCount) {
        tile.colStart = null;
      }

      const maxSpan = columnCount - (tile.colStart ?? 1) + 1;

      if (tile.colSpan > maxSpan) {
        tile.colSpan = maxSpan;
      }
    }
  }
}

/** A recorded tile: its first position, and its parent and layout version then. */
type TileRecord = { position: number; parent: Element | null; version: number };

/** Counts the layouts that `loadLayout` gave each manager. */
const layoutVersions = new WeakMap<Element, number>();

function getLayoutVersion(manager: Element | null): number {
  return (manager && layoutVersions.get(manager)) ?? 0;
}

function swapTiles(a: IgcTileComponent, b: IgcTileComponent): void {
  [a.colStart, b.colStart] = [b.colStart, a.colStart];
  [a.rowStart, b.rowStart] = [b.rowStart, a.rowStart];
  [a.position, b.position] = [b.position, a.position];
}

/** The tiles that a drag swapped, and the position of each before its first swap. */
class TileDragRecord {
  /** The tile of the last swap. */
  public last?: IgcTileComponent;
  /** Settles when the last swap applies. */
  public swapped?: Promise<void>;
  private readonly _initial = new Map<IgcTileComponent, TileRecord>();

  /**
   * Swaps the tiles in a view transition. The placements are recorded there,
   * after the updates that are still in the queue, such as the restore of the
   * last drag. A tile that leaves the parent before then swaps nothing.
   */
  public swap(dragged: IgcTileComponent, match: IgcTileComponent): void {
    const parent = dragged.parentElement;

    this.last = match;
    this.swapped = startViewTransition(() => {
      if (dragged.parentElement !== parent || match.parentElement !== parent) {
        return;
      }

      this._record(dragged);
      this._record(match);
      swapTiles(dragged, match);
    }).updateCallbackDone;
  }

  /**
   * Restores the order before the drag in a view transition, and resolves
   * when it applies. A drag without swaps restores nothing.
   */
  public restore(): Promise<void> | undefined {
    return this.swapped
      ? startViewTransition(() => this._restore()).updateCallbackDone
      : undefined;
  }

  /**
   * Gives the recorded tiles the placements that they hold now, in their order
   * before the drag, since a swap moves whole placements. Skips the tiles that
   * moved to another parent, and the managers that loaded a layout since.
   */
  private _restore(): void {
    const tiles = [...this._initial]
      .filter(
        ([tile, { parent, version }]) =>
          tile.parentElement === parent && getLayoutVersion(parent) === version
      )
      .sort(([, a], [, b]) => byPosition(a, b))
      .map(([tile]) => tile);
    const placements = tiles
      .map(({ position, colStart, rowStart }) => ({
        position,
        colStart,
        rowStart,
      }))
      .sort(byPosition);

    for (const [index, tile] of tiles.entries()) {
      Object.assign(tile, placements[index]);
    }
  }

  private _record(tile: IgcTileComponent): void {
    if (!this._initial.has(tile)) {
      const { position, parentElement: parent } = tile;
      this._initial.set(tile, {
        position,
        parent,
        version: getLayoutVersion(parent),
      });
    }
  }
}

export function createTilesState(manager: IgcTileManagerComponent) {
  return new TilesState(manager);
}

export function createTileDragRecord(): TileDragRecord {
  return new TileDragRecord();
}

export type { TileDragRecord };
