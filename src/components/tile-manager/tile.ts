import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { type Ref, createRef, ref } from 'lit/directives/ref.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { createCounter, partNameMap } from '../common/util.js';
import {
  type TileDragAndDropController,
  addTileDragAndDrop,
} from './controllers/tile-dnd.js';
import {
  type TileResizeController,
  addTileResize,
} from './controllers/tile-resize.js';
import { styles } from './themes/tile.base.css.js';
import IgcTileHeaderComponent from './tile-header.js';

type IgcTileChangeState = {
  tile: IgcTileComponent;
  state: boolean;
};

export interface IgcTileComponentEventMap {
  igcTileFullscreen: CustomEvent<IgcTileChangeState>;
  igcTileMaximize: CustomEvent<IgcTileChangeState>;
  igcResizeStart: CustomEvent<IgcTileComponent>;
  igcResizeMove: CustomEvent<IgcTileComponent>;
  igcResizeEnd: CustomEvent<IgcTileComponent>;
}

/**
 * The tile component is used within the `igc-tile-manager` as a container
 * for displaying various types of information.
 *
 * @element igc-tile
 *
 * @fires igcTileFullscreen - Fired when tile fullscreen state changes.
 * @fires igcTileMaximize - Fired when tile maximize state changes.
 * @fires igcResizeStart - Fired when tile begins resizing.
 * @fires igcResizeMove - Fired when tile is being resized.
 * @fires igcResizeEnd - Fired when tile finishes resizing.
 */
export default class IgcTileComponent extends EventEmitterMixin<
  IgcTileComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tile';
  public static styles = [styles];
  private _emitMaximizedEvent = false;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTileComponent, IgcTileHeaderComponent);
  }

  private static readonly increment = createCounter();
  private ghostElement!: HTMLElement | null;
  private _dragController: TileDragAndDropController;
  private _resizeController: TileResizeController;
  private _resizeHandleRef: Ref<HTMLDivElement> = createRef();
  private _disableResize = false;
  private _disableDrag = false;

  // REVIEW
  // @state()
  // private _isDragging = false;

  @state()
  private _hasDragOver = false;

  @state()
  private _isFullscreen = false;

  /**
   * The unique identifier of the tile.
   * @attr
   */
  @property({ attribute: 'tile-id', type: String, reflect: true })
  public tileId: string | null = null;

  @property({ type: Number })
  public colSpan!: number;

  @property({ type: Number })
  public rowSpan!: number;

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

  /**
   * Indicates whether the tile can be dragged.
   * @attr
   */
  @property({ attribute: 'disable-drag', type: Boolean, reflect: true })
  public get disableDrag() {
    return this._disableDrag;
  }

  public set disableDrag(value: boolean) {
    this._disableDrag = value;
    this._dragController.enabled = !this._disableDrag;
    this.draggable = this._dragController.enabled;
  }

  /**
   * Indicates whether the tile can be resized.
   * @attr
   */
  @property({ attribute: 'disable-resize', type: Boolean, reflect: true })
  public get disableResize() {
    return this._disableResize;
  }

  public set disableResize(value: boolean) {
    this._disableResize = value;
    this._resizeController.enabled = !this._disableResize;
  }

  /**
   * Corresponds to the CSS order property
   * and indicates the visual position the tile has in the layout.
   * @attr
   */
  @property({ attribute: 'position', type: Number, reflect: true })
  public position: number | undefined = undefined;

  @watch('position')
  protected updateOrder() {
    this.style.order = `${this.position}`;
  }

  @watch('maximized')
  protected maximizedChanged() {
    //TODO: When the header UI is implemented, emit the event on header button/icon click.
    if (this._emitMaximizedEvent && !this.emitMaximizedEvent()) {
      this.maximized = !this.maximized;
      return;
    }

    if (this.maximized) {
      this.popover = 'manual';
      this.showPopover();
    } else if (this.popover) {
      this.hidePopover();
      this.popover = null;
    }

    this._emitMaximizedEvent = false;
  }

  @watch('colSpan', { waitUntilFirstUpdate: true })
  @watch('rowSpan', { waitUntilFirstUpdate: true })
  @watch('colStart', { waitUntilFirstUpdate: true })
  @watch('rowStart', { waitUntilFirstUpdate: true })
  protected updateRowsColSpan() {
    // if (this.colStart !== null) {
    //   this.style.gridColumn = `${this.colStart} / span ${this.colSpan}`;
    // } else {
    //   this.style.gridColumn = this.style.gridColumn || `span ${this.colSpan}`; // `span ${this.colSpan}`;
    // }
    // if (this.rowStart !== null) {
    //   this.style.gridRow = `${this.rowStart} / span ${this.rowSpan}`;
    // } else {
    //   this.style.gridRow = this.style.gridRow || `span ${this.rowSpan}`; // `span ${this.rowSpan}`;
    // }
  }

  constructor() {
    super();
    this._dragController = addTileDragAndDrop(this, {
      dragStart: this.handleDragStart,
      dragEnd: this.handleDragEnd,
      dragEnter: this.handleDragEnter,
      dragLeave: this.handleDragLeave,
      drop: this.handleDragLeave,
    });

    this._resizeController = addTileResize(this, this._resizeHandleRef, {
      resizeStart: this.handleResizeStart,
      resizeMove: this.handleResize,
      resizeEnd: this.handleResizeEnd,
    });

    // Will probably expose that as a dynamic binding based on a property
    // and as a response to some UI element interaction
    this.addEventListener('dblclick', this.handleFullscreenRequest);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.tileId = this.tileId || `tile-${IgcTileComponent.increment()}`;
  }

  public toggleMaximize() {
    this._emitMaximizedEvent = true;
    this.maximized = !this.maximized;
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    this.updateRowsColSpan();
  }

  private emitFullScreenEvent() {
    return this.emitEvent('igcTileFullscreen', {
      detail: { tile: this, state: this._isFullscreen },
      cancelable: true,
    });
  }

  private emitMaximizedEvent() {
    return this.emitEvent('igcTileMaximize', {
      detail: { tile: this, state: this.maximized },
      cancelable: true,
    });
  }

  private async handleFullscreenRequest() {
    try {
      if (!this.emitFullScreenEvent()) {
        return;
      }

      if (!this._isFullscreen) {
        await this.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }

      this._isFullscreen = !this._isFullscreen;
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

  private handleDragStart(e: DragEvent) {
    const event = new CustomEvent('tileDragStart', {
      detail: { tile: this },
      bubbles: true,
    });

    const rect = this.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    e.dataTransfer!.setDragImage(this, offsetX, offsetY);
    e.dataTransfer!.effectAllowed = 'move';

    this.dispatchEvent(event);

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
    if (this.emitEvent('igcResizeStart', { detail: this, cancelable: true })) {
      this.ghostElement = this.createGhostElement();
      this.closest('igc-tile-manager')!.appendChild(this.ghostElement);
    }
  }

  private handleResize(event: PointerEvent) {
    if (this.emitEvent('igcResizeMove', { detail: this, cancelable: true })) {
      const startPos = this.getBoundingClientRect();

      const newWidth = event.clientX - startPos.left;
      const newHeight = event.clientY - startPos.top;

      const colSpan = Math.max(2, Math.floor(newWidth / 30)); // 20 + 10 (gap)
      const rowSpan = Math.max(2, Math.floor(newHeight / 30));

      this.ghostElement!.style.gridColumn = `span ${colSpan}`;
      this.ghostElement!.style.gridRow = `span ${rowSpan}`;
    }
  }

  private handleResizeEnd() {
    if (
      this.ghostElement &&
      this.emitEvent('igcResizeEnd', { detail: this, cancelable: true })
    ) {
      // this.colSpan = this.ghostElement.style.gridColumn.match(/span (\d+)/).parseint // Number.parseInt(this.ghostElement.style.gridColumn);
      // this.rowSpan = Number.parseInt(this.ghostElement.style.gridRow);
      this.style.gridColumn = this.ghostElement.style.gridColumn;
      this.style.gridRow = this.ghostElement.style.gridRow;
      this.closest('igc-tile-manager')!.removeChild(this.ghostElement);
      this.ghostElement = null;
    }
  }

  protected handleResizeCancelled(event: KeyboardEvent) {
    if (event.key.toLowerCase() === 'escape' && this.ghostElement) {
      this.closest('igc-tile-manager')!.removeChild(this.ghostElement);
      this.ghostElement = null;
    }
  }

  protected override render() {
    const parts = partNameMap({
      base: true,
      'drag-over': this._hasDragOver,
      fullscreen: this._isFullscreen,
      draggable: !this.disableDrag,
      resizable: !this._disableResize,
    });

    return html`
      <div .inert=${this._hasDragOver} part=${ifDefined(parts)}>
        <slot name="header"></slot>
        <div part="content-container">
          <slot></slot>
        </div>

        <div
          ${ref(this._resizeHandleRef)}
          class="resize-handle"
          tabindex="-1"
          @keydown=${this.handleResizeCancelled}
          ?hidden=${this._disableResize}
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
