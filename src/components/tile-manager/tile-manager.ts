import { LitElement, html } from 'lit';

import { property } from 'lit/decorators.js';
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

  /**
   * Determines whether the tiles slide or swap on drop.
   * @attr
   */
  @property()
  public dragMode: 'slide' | 'swap' = 'slide';

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

    const target = (e.target as HTMLElement).closest('igc-tile');

    const slot = this.shadowRoot?.querySelector('slot');
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
