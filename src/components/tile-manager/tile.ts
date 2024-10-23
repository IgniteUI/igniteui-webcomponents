import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { partNameMap } from '../common/util.js';
import { addTileDragAndDrop } from './controllers/tile-dnd.js';
import { addTileResize } from './controllers/tile-resize.js';
import { styles } from './themes/tile.base.css.js';
import IgcTileHeaderComponent from './tile-header.js';

/**
 * The tile component is used within the `igc-tile-manager` as a container
 * for displaying various types of information.
 *
 * @element igc-tile
 */
export default class IgcTileComponent extends LitElement {
  private ghostElement!: HTMLElement | null;

  public static readonly tagName = 'igc-tile';
  public static override styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTileComponent, IgcTileHeaderComponent);
  }

  // REVIEW
  // @state()
  // private _isDragging = false;

  @state()
  private _hasDragOver = false;

  @property({ type: Number })
  public colSpan = 3;

  @property({ type: Number })
  public rowSpan = 3;

  @property({ type: Number })
  public colStart: number | null = null;

  @property({ type: Number })
  public rowStart: number | null = null;

  /**
   * Indicates whether the tile occupies all available space within the layout.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public maximized = false;

  @watch('maximized')
  protected maximizedChanged() {
    if (this.maximized) {
      this.popover = 'manual';
      this.showPopover();
      return;
    }

    // Not maximized; check if it needs to hide any popover state
    if (this.popover) {
      this.hidePopover();
      this.popover = null;
    }
  }

  @watch('colSpan', { waitUntilFirstUpdate: true })
  @watch('rowSpan', { waitUntilFirstUpdate: true })
  @watch('colStart', { waitUntilFirstUpdate: true })
  @watch('rowStart', { waitUntilFirstUpdate: true })
  protected updateRowsColSpan() {
    if (this.colStart !== null) {
      this.style.gridColumn = `${this.colStart} / span ${this.colSpan}`;
    } else {
      this.style.gridColumn = `span ${this.colSpan}`;
    }

    if (this.rowStart !== null) {
      this.style.gridRow = `${this.rowStart} / span ${this.rowSpan}`;
    } else {
      this.style.gridRow = `span ${this.rowSpan}`;
    }
  }

  constructor() {
    super();

    addTileDragAndDrop(this, {
      dragStart: this.handleDragStart,
      dragEnd: this.handleDragEnd,
      dragEnter: this.handleDragEnter,
      dragLeave: this.handleDragLeave,
      drop: this.handleDragLeave,
    });

    addTileResize(this, {
      resizeStart: this.handleResizeStart,
      resizeMove: this.handleResize,
      resizeEnd: this.handleResizeEnd,
    });

    // Will probably expose that as a dynamic binding based on a property
    // and as a response to some UI element interaction
    this.addEventListener('dblclick', this.handleFullscreenRequest);
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    this.updateRowsColSpan();
  }

  private async handleFullscreenRequest() {
    try {
      await this.requestFullscreen();
    } catch {
      document.exitFullscreen();
    }
  }

  private handleDragEnter() {
    this._hasDragOver = true;
  }

  private handleDragLeave() {
    this._hasDragOver = false;
  }

  private handleDragStart() {
    const event = new CustomEvent('tileDragStart', {
      detail: { tile: this },
      bubbles: true,
    });
    this.dispatchEvent(event);
    this.classList.add('dragging');

    requestAnimationFrame(() => {
      this.style.transform = 'scale(0)';
    });
  }

  private handleDragEnd() {
    const event = new CustomEvent('tileDragEnd', {
      detail: { tile: this },
      bubbles: true,
    });
    this.dispatchEvent(event);
    this.classList.remove('dragging');
  }

  private createGhostElement(): HTMLElement {
    const clone = this.cloneNode(true) as HTMLElement;
    clone.id = 'resize-ghost';
    const { left, top } = this.getBoundingClientRect();

    const styles: Partial<CSSStyleDeclaration> = {
      // position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      pointerEvents: 'none',
      opacity: '0.6',
    };

    Object.assign(clone.style, styles);

    return clone;
  }

  private handleResizeStart() {
    this.ghostElement = this.createGhostElement();
    this.closest('igc-tile-manager')!.appendChild(this.ghostElement);
  }

  private handleResize(event: PointerEvent) {
    const startPos = this.getBoundingClientRect();

    const newWidth = event.clientX - startPos.left;
    const newHeight = event.clientY - startPos.top;

    const colSpan = Math.max(2, Math.floor(newWidth / 30)); // 20 + 10 (gap)
    const rowSpan = Math.max(2, Math.floor(newHeight / 30));

    this.ghostElement!.style.gridColumn = `span ${colSpan}`;
    this.ghostElement!.style.gridRow = `span ${rowSpan}`;
  }

  private handleResizeEnd() {
    if (this.ghostElement) {
      this.style.gridColumn = this.ghostElement.style.gridColumn;
      this.style.gridRow = this.ghostElement.style.gridRow;
      this.closest('igc-tile-manager')!.removeChild(this.ghostElement);
      this.ghostElement = null;
    }
  }

  protected handleResizeCancelled(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.ghostElement) {
      this.closest('igc-tile-manager')!.removeChild(this.ghostElement);
      this.ghostElement = null;
    }
  }

  protected override render() {
    const parts = partNameMap({
      'drag-over': this._hasDragOver,
    });

    return html`
      <div id="base" .inert=${this._hasDragOver} part=${parts}>
        <div part="header">
          <slot name="header"></slot>
        </div>
        <div part="content-container">
          <slot></slot>
        </div>

        <div
          class="resize-handle"
          tabindex="-1"
          @keydown=${this.handleResizeCancelled}
        ></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile': IgcTileComponent;
  }
}
