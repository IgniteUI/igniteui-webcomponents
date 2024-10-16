import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { partNameMap } from '../common/util.js';
import { addTileDragAndDrop } from './controllers/tile-dnd.js';
import { styles } from './themes/tile.base.css.js';
import IgcTileHeaderComponent from './tile-header.js';

/**
 * The tile component is used within the `igc-tile-manager` as a container
 * for displaying various types of information.
 *
 * @element igc-tile
 */
export default class IgcTileComponent extends LitElement {
  public static readonly tagName = 'igc-tile';
  public static override styles = [styles];
  protected activeResizer = '';

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
  @property({ type: Boolean })
  public maximized = false;

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

    // Will probably expose that as a dynamic binding based on a property
    // and as a response to some UI element interaction
    this.addEventListener('dblclick', this.handleFullscreenRequest);
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    this.updateRowsColSpan();
  }

  protected override updated(
    changedProperties: Map<string | number | symbol, unknown>
  ) {
    super.updated(changedProperties);

    if (changedProperties.has('maximized')) {
      this.toggleClass(this.maximized, 'maximized');
    }
  }

  private toggleClass(condition: boolean, className: string) {
    if (condition) {
      this.classList.add(className);
    } else {
      this.classList.remove(className);
    }
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

  startResize(event: MouseEvent) {
    event.preventDefault();

    if (event.target instanceof Element) {
      this.activeResizer = event.target.classList.contains('right')
        ? 'right'
        : event.target.classList.contains('bottom')
          ? 'bottom'
          : 'handle';
    }

    this.onResizing = this.onResizing.bind(this);
    this.stopResize = this.stopResize.bind(this);

    window.addEventListener('mousemove', this.onResizing);
    window.addEventListener('mouseup', this.stopResize);
  }

  onResizing(event: MouseEvent) {
    const startPos = this.getBoundingClientRect();

    const newWidth = event.clientX - startPos.left;
    const newHeight = event.clientY - startPos.top;

    const colSpan = Math.max(2, Math.floor(newWidth / 30)); // 20 + 10 (gap)
    const rowSpan = Math.max(2, Math.floor(newHeight / 30));

    if (this.activeResizer === 'right' || this.activeResizer === 'handle') {
      this.style.gridColumn = `span ${colSpan}`;
    }

    if (this.activeResizer === 'bottom' || this.activeResizer === 'handle') {
      this.style.gridRow = `span ${rowSpan}`;
    }
  }

  stopResize() {
    window.removeEventListener('mousemove', this.onResizing);
    window.removeEventListener('mouseup', this.stopResize);
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
          @mousedown=${this.startResize.bind(this)}
        ></div>
        <div
          class="resizer right"
          @mousedown=${this.startResize.bind(this)}
        ></div>
        <div
          class="resizer bottom"
          @mousedown=${this.startResize.bind(this)}
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
