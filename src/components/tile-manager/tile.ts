import { LitElement, html } from 'lit';

import { property } from 'lit/decorators.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/tile.base.css.js';

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
    registerComponent(IgcTileComponent);
  }

  /**
   * Indicates whether the tile occupies all available space within the layout.
   * @attr
   */
  @property({ type: Boolean })
  public maximized = false;

  constructor() {
    super();

    this.setAttribute('draggable', 'true');
    this.addEventListener('dragstart', this.handleDragStart);
    this.addEventListener('dragend', this.handleDragEnd);
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

  private handleDragStart() {
    const event = new CustomEvent('tileDragStart', {
      detail: { tile: this },
      bubbles: true,
    });
    this.dispatchEvent(event);
    this.classList.add('dragging');

    setTimeout(() => {
      this.style.transform = 'scale(0)';
    }, 0);
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
    return html`
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile': IgcTileComponent;
  }
}
