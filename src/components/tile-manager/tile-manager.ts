import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import {
  type MutationControllerParams,
  createMutationController,
} from '../common/controllers/mutation-observer.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { addFullscreenController } from './controllers/fullscreen.js';
import { all } from './themes/container.js';
import { styles as shared } from './themes/shared/tile-manager.common.css.js';
import { styles } from './themes/tile-manager.base.css.js';
import IgcTileComponent from './tile.js';

// REVIEW: WIP
export interface IgcTileManagerComponentEventMap {
  igcTileDragStarted: CustomEvent<IgcTileComponent>;
}

/**
 * The tile manager component enables the dynamic arrangement, resizing, and interaction of tiles.
 *
 * @element igc-tile-manager
 *
 * @fires igcTileDragStarted - Fired when an owning tile begins a drag operation.
 */
@themes(all)
export default class IgcTileManagerComponent extends EventEmitterMixin<
  IgcTileManagerComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tile-manager';
  public static styles = [styles, shared];

  protected static shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    slotAssignment: 'manual',
  };

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTileManagerComponent, IgcTileComponent);
  }

  private draggedItem: IgcTileComponent | null = null;
  private finalOrder: IgcTileComponent[] = [];
  private positionedTiles: IgcTileComponent[] = [];

  // @query('[part="base"]', true)
  // private _baseWrapper!: HTMLDivElement;

  @query('slot', true)
  private slotElement!: HTMLSlotElement;

  private get _tiles() {
    return Array.from(
      this.querySelectorAll<IgcTileComponent>(
        `:scope > ${IgcTileComponent.tagName}`
      )
    );
  }

  private _observerCallback({
    changes: { added, removed },
  }: MutationControllerParams<IgcTileComponent>) {
    removed.forEach((removedTile) => {
      if (removedTile instanceof IgcTileComponent) {
        this.handleTileRemoval(removedTile);
      }
    });

    added.forEach((addedTile) => {
      if (addedTile instanceof IgcTileComponent) {
        this.handleTileAddition(addedTile);
      }
    });

    this.updateSlotAssignment();
  }

  /**
   * Determines whether the tiles slide or swap on drop.
   * @attr
   */
  @property()
  public dragMode: 'slide' | 'swap' = 'slide';

  @property({ type: Number })
  public columnCount = 10;

  /**
   * Gets the tiles sorted by their position in the layout.
   * @attr
   */
  public get tiles() {
    return Array.from(this._tiles).sort((a, b) => a.position - b.position);
  }

  @watch('columnCount', { waitUntilFirstUpdate: true })
  protected updateRowsCols() {
    // REVIEW: Bind to internal CSS vars/parts or something
    // const gridTemplateColumns =
    //   this.columnCount > 0
    //     ? `repeat(${this.columnCount}, auto)`
    //     : 'repeat(auto-fit, minmax(20px, 1fr))';
    //
    // Object.assign(this._baseWrapper.style, gridTemplateColumns);
  }

  constructor() {
    super();
    addFullscreenController(this);

    createMutationController(this, {
      callback: this._observerCallback,
      filter: [IgcTileComponent.tagName],
      config: {
        childList: true,
      },
    });
  }

  protected override firstUpdated() {
    this.assignPositions();
    this.updateRowsCols();
    this.updateSlotAssignment();
  }

  private assignPositions() {
    const finalOrder: IgcTileComponent[] = [];
    const unpositionedTiles = this._tiles.filter(
      (tile) => tile.position === -1
    );

    this.positionedTiles = this._tiles.filter((tile) => tile.position !== -1);
    this.positionedTiles.sort((a, b) => a.position - b.position);

    let nextFreePosition = 0;

    this.positionedTiles.forEach((tile) => {
      // Fill any unassigned slots before the next assigned tile's position
      while (nextFreePosition < tile.position && unpositionedTiles.length > 0) {
        const unpositionedTile = unpositionedTiles.shift()!;
        unpositionedTile.position = nextFreePosition++;
        finalOrder.push(unpositionedTile);
      }
      tile.position = finalOrder.length;
      finalOrder.push(tile);
      nextFreePosition = tile.position + 1;
    });

    unpositionedTiles.forEach((tile) => {
      tile.position = nextFreePosition++;
      finalOrder.push(tile);
    });

    this.finalOrder = finalOrder;
  }

  private handleTileRemoval(removedTile: IgcTileComponent) {
    const removedPosition = removedTile.position;

    this.finalOrder = this.finalOrder.filter((tile) => tile !== removedTile);
    this.positionedTiles = this.positionedTiles.filter(
      (tile) => tile !== removedTile
    );

    // Shift only non-positioned tiles
    this.finalOrder.forEach((tile) => {
      if (
        tile.position > removedPosition &&
        !this.positionedTiles.includes(tile)
      ) {
        tile.position -= 1;
      }
    });

    this.reassignUnpositionedTiles();
  }

  private handleTileAddition(newTile: IgcTileComponent) {
    let specifiedPosition = newTile.position;

    if (specifiedPosition !== -1) {
      // Place at specified position, shift non-positioned tiles only
      this.finalOrder.forEach((tile) => {
        if (
          tile.position >= specifiedPosition &&
          !this.positionedTiles.includes(tile)
        ) {
          tile.position += 1;
        }
      });

      this.finalOrder.splice(specifiedPosition, 0, newTile);
      this.positionedTiles.push(newTile);
    } else {
      // Find next available position in DOM for unpositioned tile
      specifiedPosition = this.getAvailablePosition(newTile);
      newTile.position = specifiedPosition;
      this.finalOrder.push(newTile);
    }

    this.reassignUnpositionedTiles();
  }

  private reassignUnpositionedTiles() {
    let nextPosition = 0;

    this.finalOrder.sort((a, b) => a.position - b.position);
    this.finalOrder.forEach((tile) => {
      if (!this.positionedTiles.includes(tile)) {
        while (
          this.finalOrder.some(
            (posTile) =>
              posTile.position === nextPosition &&
              this.positionedTiles.includes(posTile)
          )
        ) {
          nextPosition += 1;
        }
        tile.position = nextPosition++;
      }
    });
  }

  private getAvailablePosition(newTile: IgcTileComponent): number {
    let domIndex = Array.from(this.children).indexOf(newTile);
    while (this.positionedTiles.some((tile) => tile.position === domIndex)) {
      domIndex += 1;
    }
    return domIndex;
  }

  private updateSlotAssignment() {
    this.slotElement.assign(...this._tiles);
  }

  private handleTileDragStart(e: CustomEvent) {
    this.emitEvent('igcTileDragStarted', { detail: e.detail.tile });
    this.draggedItem = e.detail.tile;
  }

  private handleTileDragEnd() {
    if (this.draggedItem) {
      this.draggedItem.style.transform = ''; // Reset transformation
      this.draggedItem = null;
    }
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault(); // Allow dropping
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();

    const draggedItem = this.draggedItem;
    const target = (e.target as HTMLElement).closest('igc-tile')!;

    if (draggedItem && this.tiles && target !== draggedItem) {
      if (this.dragMode === 'swap') {
        // Swap positions between dragged tile and drop target
        const tempPosition = draggedItem.position;
        draggedItem.position = target.position;
        target.position = tempPosition;
      } else if (this.dragMode === 'slide') {
        // Move dragged tile and adjust positions of affected tiles
        const draggedPos = draggedItem.position ?? 0;
        const targetPos = target.position ?? 0;

        this.tiles.forEach((tile) => {
          if (
            draggedPos < targetPos &&
            tile.position > draggedPos &&
            tile.position <= targetPos
          ) {
            tile.position -= 1;
          } else if (
            draggedPos > targetPos &&
            tile.position >= targetPos &&
            tile.position < draggedPos
          ) {
            tile.position += 1;
          }
        });

        draggedItem.position = targetPos;
      }
    }
  }

  public saveLayout() {
    // TODO: serialize fullscreen when added
    const tilesData = this.tiles.map((tile) => {
      const tileStyles = window.getComputedStyle(tile);

      return {
        colSpan: tile.colSpan,
        colStart: tile.colStart,
        disableDrag: tile.disableDrag,
        disableResize: tile.disableResize,
        // TODO: Review. We are saving gridColumn and gridRow as they keep the size of the resized tiles.
        gridColumn: tileStyles.gridColumn,
        gridRow: tileStyles.gridRow,
        maximized: tile.maximized,
        position: tile.position,
        rowSpan: tile.rowSpan,
        rowStart: tile.rowStart,
        tileId: tile.tileId,
      };
    });

    return JSON.stringify(tilesData);
  }

  public loadLayout(data: string) {
    const tilesData = JSON.parse(data);

    tilesData.forEach((tileInfo: any) => {
      const existingTile = this._tiles.find(
        (tile) => tile.tileId === tileInfo.tileId
      );

      if (existingTile) {
        existingTile.colSpan = tileInfo.colSpan;
        existingTile.colStart = tileInfo.colStart;
        existingTile.disableDrag = tileInfo.disableDrag;
        existingTile.disableResize = tileInfo.disableResize;
        existingTile.maximized = tileInfo.maximized;
        existingTile.position = tileInfo.position;
        existingTile.rowSpan = tileInfo.rowSpan;
        existingTile.rowStart = tileInfo.rowStart;

        // TODO: Review. We are saving gridColumn and gridRow as they keep the size of the resized tiles.
        existingTile.style.gridColumn = tileInfo.gridColumn;
        existingTile.style.gridRow = tileInfo.gridRow;
      }
    });
  }

  protected override render() {
    return html`
      <div
        part="base"
        @tileDragStart=${this.handleTileDragStart}
        @tileDragEnd=${this.handleTileDragEnd}
        @dragover=${this.handleDragOver}
        @drop=${this.handleDrop}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile-manager': IgcTileManagerComponent;
  }
}
