import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { themes } from '../../theming/theming-decorator.js';
import {
  type MutationControllerParams,
  createMutationController,
} from '../common/controllers/mutation-observer.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { asNumber, findElementFromEventPath } from '../common/util.js';
import { addFullscreenController } from './controllers/fullscreen.js';
import { createSerializer } from './serializer.js';
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

  private _internalStyles: StyleInfo = {};

  private positionedTiles: IgcTileComponent[] = [];
  private _columnCount = 0;
  private _minColWidth?: string;
  private _minRowHeight?: string;
  private _serializer = createSerializer(this);

  /** @private @hidden @internal */
  public draggedItem: IgcTileComponent | null = null;

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
    const ownAdded = added.filter(
      ({ target }) => target.closest(this.tagName) === this
    );
    const ownRemoved = removed.filter(
      ({ target }) => target.closest(this.tagName) === this
    );

    for (const { node: removedTile } of ownRemoved) {
      const removedPosition = removedTile.position;

      this.tiles.forEach((tile) => {
        if (tile.position > removedPosition) {
          tile.position -= 1;
        }
      });
    }

    for (const { node: tile } of ownAdded) {
      const specifiedPosition = tile.position;

      if (specifiedPosition !== -1) {
        this._tiles
          .filter((existingTile) => existingTile !== tile)
          .forEach((existingTile) => {
            if (existingTile.position >= specifiedPosition) {
              existingTile.position += 1;
            }
          });
      } else {
        tile.position = this._tiles.length - 1;
      }
    }

    this.updateSlotAssignment();
  }

  /**
   * Determines whether the tiles slide or swap on drop.
   * @attr drag-mode
   */
  @property({ attribute: 'drag-mode' })
  public dragMode: 'slide' | 'swap' = 'slide';

  /**
   * Sets the number of columns for the tile manager.
   * Setting value <= than zero will trigger a responsive layout.
   *
   * @attr column-count
   * @default 0
   */
  @property({ type: Number, attribute: 'column-count' })
  public set columnCount(value: number) {
    this._columnCount = Math.max(0, asNumber(value));
    Object.assign(this._internalStyles, {
      '--ig-column-count': this._columnCount || undefined,
    });
  }

  public get columnCount(): number {
    return this._columnCount;
  }

  /**
   * Sets the minimum width for a column unit in the tile manager.
   * @attr min-column-width
   */
  @property({ attribute: 'min-column-width' })
  public set minColumnWidth(value: string | undefined) {
    this._minColWidth = value ?? undefined;
    Object.assign(this._internalStyles, {
      '--ig-min-col-width': this._minColWidth,
    });
  }

  public get minColumnWidth(): string | undefined {
    return this._minColWidth;
  }

  /**
   * Sets the minimum height for a row unit in the tile manager.
   * @attr min-row-height
   */
  @property({ attribute: 'min-row-height' })
  public set minRowHeight(value: string | undefined) {
    this._minRowHeight = value ?? undefined;
    Object.assign(this._internalStyles, {
      '--ig-min-row-height': this._minRowHeight,
    });
  }

  public get minRowHeight(): string | undefined {
    return this._minRowHeight;
  }

  /**
   * Gets the tiles sorted by their position in the layout.
   * @attr
   */
  public get tiles() {
    return Array.from(this._tiles).sort((a, b) => a.position - b.position);
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
  }

  private updateSlotAssignment() {
    this.slotElement.assign(...this._tiles);
  }

  private handleTileDragStart(event: CustomEvent) {
    this.emitEvent('igcTileDragStarted', { detail: event.detail.tile });
    this.draggedItem = event.detail.tile;
  }

  private handleTileDragEnd() {
    if (this.draggedItem) {
      this.draggedItem = null;
    }
  }

  private handleDragOver(event: DragEvent) {
    event.preventDefault(); // Allow dropping
  }

  private handleDrop(event: DragEvent) {
    event.preventDefault();

    const draggedItem = this.draggedItem;
    const target = findElementFromEventPath<IgcTileComponent>(
      IgcTileComponent.tagName,
      event
    );

    if (target && draggedItem && target !== draggedItem) {
      if (this.dragMode === 'swap') {
        [draggedItem.position, target.position] = [
          target.position,
          draggedItem.position,
        ];
      }
    }
  }

  public saveLayout(): string {
    return this._serializer.saveAsJSON();
  }

  public loadLayout(data: string): void {
    this._serializer.loadFromJSON(data);
  }

  protected override render() {
    return html`
      <div
        style=${styleMap(this._internalStyles)}
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
