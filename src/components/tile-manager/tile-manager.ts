import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/tile-manager.base.css.js';
import IgcTileHeaderComponent from './tile-header.js';
import IgcTileComponent from './tile.js';

/**
 * The tile manager component enables the dynamic arrangement, resizing, and interaction of tiles.
 *
 * @element igc-tile-manager
 */
export default class IgcTileManagerComponent extends LitElement {
  public static readonly tagName = 'igc-tile-manager';
  public static override styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcTileManagerComponent,
      IgcTileComponent,
      IgcTileHeaderComponent
    );
  }

  private draggedItem: HTMLElement | null = null;

  @query('slot', true)
  private slotElement!: HTMLSlotElement;

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

  @watch('columnCount', { waitUntilFirstUpdate: true })
  @watch('rowCount', { waitUntilFirstUpdate: true })
  protected updateRowsCols() {
    const baseElement = this.shadowRoot?.querySelector(
      '[part="base"]'
    ) as HTMLElement;

    if (this.columnCount > 0) {
      baseElement.style.gridTemplateColumns = `repeat(${this.columnCount}, auto)`;
    } else {
      baseElement.style.gridTemplateColumns =
        'repeat(auto-fit, minmax(20px, 1fr))';
    }

    if (this.rowCount > 0) {
      baseElement.style.gridTemplateRows = `repeat(${this.rowCount}, auto)`;
    } else {
      baseElement.style.gridTemplateRows =
        'repeat(auto-fit, minmax(20px, 1fr))';
    }
  }

  constructor() {
    super();

    this.attachShadow({
      mode: 'open',
      slotAssignment: 'manual',
    });
  }

  protected override async firstUpdated() {
    await this.updateComplete;

    this.updateRowsCols();

    const tiles = Array.from(this.children).filter(
      (tile) => tile.tagName === 'IGC-TILE'
    );
    this.slotElement.assign(...tiles);
  }

  private handleTileDragStart(e: CustomEvent) {
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

    const slot = this.slotElement;
    const slottedItems = slot?.assignedElements() as HTMLElement[];

    if (this.draggedItem && slottedItems && target !== this.draggedItem) {
      const draggedIndex = slottedItems.indexOf(this.draggedItem);
      const droppedIndex = slottedItems.indexOf(target);

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

          const updatedTiles = Array.from(parent.children).filter(
            (el) => el.tagName === 'IGC-TILE'
          );

          slot.assign(...updatedTiles);
        }
      }
    }
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
