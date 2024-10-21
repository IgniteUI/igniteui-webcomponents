import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { createMutationController } from '../common/controllers/mutation-observer.js';
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

  @query('[part="base"]', true)
  private _baseWrapper!: HTMLDivElement;

  @query('slot', true)
  private slotElement!: HTMLSlotElement;

  private get _tiles() {
    return Array.from(
      this.querySelectorAll<IgcTileComponent>(
        `:scope > ${IgcTileComponent.tagName}`
      )
    );
  }

  private _observerCallback() {
    this.updateTilesFromDom();
  }

  /**
   * Determines whether the tiles slide or swap on drop.
   * @attr
   */
  @property()
  public dragMode: 'slide' | 'swap' = 'slide';

  @property({ type: Number })
  public columnCount = 0;

  @property({ type: Number })
  public rowCount = 0;

  /**
   * Gets/Sets the tiles.
   * @attr
   */
  @property({ type: Array })
  public tiles: IgcTileComponent[] = [];

  @watch('tiles', { waitUntilFirstUpdate: true })
  protected updateSlotAssignment() {
    this.syncTilesWithDom();
    this.slotElement.assign(...this.tiles);
  }

  @watch('columnCount', { waitUntilFirstUpdate: true })
  @watch('rowCount', { waitUntilFirstUpdate: true })
  protected updateRowsCols() {
    // REVIEW: Bind to internal CSS vars/parts or something
    const gridTemplateColumns =
      this.columnCount > 0
        ? `repeat(${this.columnCount}, auto)`
        : 'repeat(auto-fit, minmax(20px, 1fr))';
    const gridTemplateRows =
      this.rowCount > 0
        ? `repeat(${this.rowCount}, auto)`
        : 'repeat(auto-fit, minmax(20px, 1fr))';

    Object.assign(this._baseWrapper.style, {
      gridTemplateColumns,
      gridTemplateRows,
    });
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
    this.updateRowsCols();
    this.updateTilesFromDom();
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

    const target = (e.target as HTMLElement).closest('igc-tile')!;
    const tiles = this._tiles;

    if (this.draggedItem && tiles && target !== this.draggedItem) {
      const draggedIndex = tiles.indexOf(this.draggedItem);
      const droppedIndex = tiles.indexOf(target);

      if (draggedIndex > -1 && droppedIndex > -1) {
        const parent = this.draggedItem.parentElement;
        if (parent) {
          if (this.dragMode === 'slide') {
            parent.insertBefore(this.draggedItem, target);
          } else if (this.dragMode === 'swap') {
            const draggedNextSibling = this.draggedItem.nextElementSibling;

            parent.insertBefore(this.draggedItem, target);

            parent.insertBefore(target, draggedNextSibling);
          }

          this.tiles = Array.from(parent.children).filter(
            (el): el is IgcTileComponent => el.tagName === 'IGC-TILE'
          );
        }
      }
    }
  }

  private updateTilesFromDom() {
    this.tiles = this._tiles;
  }

  private syncTilesWithDom() {
    this._tiles.forEach((child) => {
      if (!this.tiles.includes(child)) {
        child.remove();
      }
    });

    this.tiles.forEach((tile) => {
      if (!this.contains(tile)) {
        this.appendChild(tile);
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
