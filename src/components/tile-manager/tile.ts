import { LitElement, html } from 'lit';

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

  constructor() {
    super();

    this.setAttribute('draggable', 'true');
    this.addEventListener('dragstart', this.handleDragStart);
    this.addEventListener('dragend', this.handleDragEnd);
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

    const colSpan = Math.max(1, Math.floor(newWidth / 30));
    const rowSpan = Math.max(1, Math.floor(newHeight / 30));

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
      <div part="base">
        <slot name="header"></slot>
        <slot></slot>
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
