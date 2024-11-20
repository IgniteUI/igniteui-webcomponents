import { ContextProvider } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { tileContext } from '../common/context.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { createCounter, partNameMap } from '../common/util.js';
import {
  type TileDragAndDropController,
  addTileDragAndDrop,
} from './controllers/tile-dnd.js';
import type { ResizeCallbackParams } from './resize-controller.js';
import IgcResizeComponent from './resize-element.js';
import { styles as shared } from './themes/shared/tile/tile.common.css.js';
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
  public static styles = [styles, shared];
  private _emitMaximizedEvent = false;

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcTileComponent,
      IgcTileHeaderComponent,
      IgcResizeComponent
    );
  }

  private static readonly increment = createCounter();
  private _dragController: TileDragAndDropController;
  private _position = -1;
  private _disableDrag = false;
  private _fullscreen = false;
  private _context = new ContextProvider(this, {
    context: tileContext,
    initialValue: this,
  });

  @state()
  private _isDragging = false;

  @state()
  private _hasDragOver = false;

  /**
   * The unique identifier of the tile.
   * @attr
   */
  @property({ attribute: 'tile-id', type: String, reflect: true })
  public tileId: string | null = null;

  @property({ type: Number })
  public colSpan = 1; // review

  @property({ type: Number })
  public rowSpan = 1; // review

  @property({ type: Number })
  public colStart: number | null = null;

  @property({ type: Number })
  public rowStart: number | null = null;

  @property({ type: Boolean, reflect: true })
  public set fullscreen(value: boolean) {
    if (this._fullscreen === value) return;

    this._fullscreen = value;
    this._context.setValue(this, true);
    this.handleFullscreenRequest();
  }

  public get fullscreen() {
    return this._fullscreen;
  }

  /**
   * Indicates whether the tile occupies all available space within the layout.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public maximized = false;

  /**
   * Indicates whether the tile can be dragged.
   * @attr disable-drag
   */
  @property({ attribute: 'disable-drag', type: Boolean, reflect: true })
  public set disableDrag(value: boolean) {
    this._disableDrag = value;
    this._dragController.enabled = !this._disableDrag;
    this.draggable = this._dragController.enabled;
  }

  public get disableDrag() {
    return this._disableDrag;
  }

  /**
   * Indicates whether the tile can be resized.
   * @attr disable-resize
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-resize' })
  public disableResize = false;

  /**
   * Gets/sets the tile's visual position in the layout.
   * Corresponds to the CSS order property.
   * @attr
   */
  @property({ type: Number })
  public set position(value: number) {
    this._position = Number(value);
    this.style.order = `${this._position}`;
  }

  public get position() {
    return this._position;
  }

  @watch('maximized')
  protected maximizedChanged() {
    if (this._emitMaximizedEvent && !this.emitMaximizedEvent()) {
      this.maximized = !this.maximized;
      return;
    }

    // HACK
    if (this.maximized) {
      this.popover = 'manual';
      this.showPopover();
    } else if (this.popover) {
      this.hidePopover();
      this.popover = null;
    }

    this._emitMaximizedEvent = false;

    this._context.setValue(this, true);
  }

  @watch('colSpan', { waitUntilFirstUpdate: true })
  @watch('rowSpan', { waitUntilFirstUpdate: true })
  @watch('colStart', { waitUntilFirstUpdate: true })
  @watch('rowStart', { waitUntilFirstUpdate: true })
  protected updateRowsColSpan() {
    this.style.gridColumn = this.style.gridColumn || `span ${this.colSpan}`;
    this.style.gridRow = this.style.gridRow || `span ${this.rowSpan}`;
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

    // Will probably expose that as a dynamic binding based on a property
    // and as a response to some UI element interaction
    // REVIEW: fullscreen property and a tile header action button added
    this.addEventListener('dblclick', this.handleDoubleClick);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.tileId = this.tileId || `tile-${IgcTileComponent.increment()}`;
  }

  public toggleFullscreen() {
    this.fullscreen = !this.fullscreen;
    this.emitFullScreenEvent();
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
      detail: { tile: this, state: this.fullscreen },
      cancelable: true,
    });
  }

  private emitMaximizedEvent() {
    return this.emitEvent('igcTileMaximize', {
      detail: { tile: this, state: this.maximized },
      cancelable: true,
    });
  }

  private handleDoubleClick() {
    if (!this.emitFullScreenEvent()) {
      return;
    }

    this.fullscreen = !this.fullscreen;
  }

  private async handleFullscreenRequest() {
    try {
      if (this.fullscreen) {
        await this.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
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

    // const rect = this.getBoundingClientRect();
    // const offsetX = e.clientX - rect.left;
    // const offsetY = e.clientY - rect.top;

    e.dataTransfer!.setDragImage(this, 0, 0);
    e.dataTransfer!.effectAllowed = 'move';

    this.dispatchEvent(event);
    this._isDragging = true;

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
    this._isDragging = false;
  }

  private _handleResize(_: CustomEvent<ResizeCallbackParams>) {
    // console.log(event.detail.state);
  }

  private _handleResizeEnd(event: CustomEvent<ResizeCallbackParams>) {
    const state = event.detail.state;
    const width = state.current.width; // - state.current.x;
    const height = state.current.height; // - state.current.y;

    const resizeElement = event.target as HTMLElement;

    // REVIEW
    Object.assign(resizeElement.style, {
      width: '',
      height: '',
    });

    const colSpan = Math.max(1, Math.floor(width / 200));
    const rowSpan = Math.max(1, Math.floor(height / 200));

    Object.assign(this.style, {
      gridRow: `span ${rowSpan}`,
      gridColumn: `span ${colSpan}`,
    });
  }

  // REVIEW
  protected ghostFactory = () => {
    const ghost = this.cloneNode(true) as IgcTileComponent;
    Object.assign(ghost.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1000,
      opacity: 0.75,
      filter: 'drop-shadow(1px 1px 3px #333)',
      width: '100%',
      height: '100%',
      gridRow: '',
      gridColumn: '',
    });

    return ghost;
  };

  protected renderContent() {
    const parts = partNameMap({
      base: true,
      'drag-over': this._hasDragOver,
      fullscreen: this.fullscreen,
      draggable: !this.disableDrag,
      dragging: this._isDragging,
    });

    return html`
      <div part=${parts} .inert=${this._hasDragOver}>
        <slot name="header"></slot>
        <div part="content-container">
          <slot></slot>
        </div>
      </div>
    `;
  }

  protected override render() {
    const renderResize =
      this.disableResize || this.maximized || this.fullscreen;

    return renderResize
      ? this.renderContent()
      : html`
          <igc-resize
            part="base"
            .ghostFactory=${this.ghostFactory}
            mode="deferred"
            @igcResize=${this._handleResize}
            @igcResizeEnd=${this._handleResizeEnd}
          >
            ${this.renderContent()}
          </igc-resize>
        `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile': IgcTileComponent;
  }
}
