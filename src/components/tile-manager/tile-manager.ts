import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import {
  type MutationControllerParams,
  createMutationController,
} from '../common/controllers/mutation-observer.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { addFullscreenController } from './controllers/fullscreen.js';
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
export default class IgcTileManagerComponent extends EventEmitterMixin<
  IgcTileManagerComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tile-manager';
  public static styles = [styles];

  protected static shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    slotAssignment: 'manual',
  };

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTileManagerComponent, IgcTileComponent);
  }

  private draggedItem: IgcTileComponent | null = null;

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
    changes: { added },
  }: MutationControllerParams<IgcTileComponent>) {
    // FIX: currently the newly added tile has the specified position+1 in the layout
    added.forEach((newTile) => {
      const specifiedPosition = newTile.position;

      if (specifiedPosition !== undefined) {
        this.tiles.splice(specifiedPosition - 1, 0, newTile);
      } else {
        this.tiles.push(newTile);
      }
    });

    this.assignPositions();
    this.updateSlotAssignment();
  }

  /**
   * Determines whether the tiles slide or swap on drop.
   * @attr
   */
  @property()
  public dragMode: 'slide' | 'swap' = 'slide';

  @property({ type: Number })
  public columnCount = 0;

  // remove this one
  @property({ type: Number })
  public rowCount = 0;

  /**
   * Gets the tiles sorted by their position in the layout.
   * @attr
   */
  public get tiles() {
    return Array.from(this._tiles).sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    );
  }

  @watch('columnCount', { waitUntilFirstUpdate: true })
  @watch('rowCount', { waitUntilFirstUpdate: true })
  protected updateRowsCols() {
    // REVIEW: Bind to internal CSS vars/parts or something
    // const gridTemplateColumns =
    //   this.columnCount > 0
    //     ? `repeat(${this.columnCount}, auto)`
    //     : 'repeat(auto-fit, minmax(20px, 1fr))';
    // const gridTemplateRows =
    //   this.rowCount > 0
    //     ? `repeat(${this.rowCount}, auto)`
    //     : 'repeat(auto-fit, minmax(20px, 1fr))';
    // Object.assign(this._baseWrapper.style, {
    //   gridTemplateColumns,
    //   gridTemplateRows,
    // });
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
    this.tiles.forEach((tile, index) => {
      tile.position = index;
    });
  }

  private updateSlotAssignment() {
    this.slotElement.assign(...this.tiles);
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
          if (tile.position) {
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
