import { ContextProvider } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { themes } from '../../theming/theming-decorator.js';
import { tileContext } from '../common/context.js';
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
import { all } from './themes/tile.js';
import IgcTileHeaderComponent from './tile-header.js';
import type IgcTileManagerComponent from './tile-manager.js';

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
@themes(all)
export default class IgcTileComponent extends EventEmitterMixin<
  IgcTileComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tile';
  public static styles = [styles, shared];

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
  private _tileManager?: IgcTileManagerComponent;
  private _colSpan = 1;
  private _rowSpan = 1;
  private _colStart: number | null = null;
  private _rowStart: number | null = null;
  private _position = -1;
  private _disableDrag = false;
  private _fullscreen = false;
  private _maximized = false;
  private _initialPointerX: number | null = null;
  private _initialPointerY: number | null = null;
  private _cachedStyles: {
    columnCount?: number;
    minWidth?: number;
    minHeight?: number;
    background?: string;
    border?: string;
    borderRadius?: string;
  } = {};
  private _context = new ContextProvider(this, {
    context: tileContext,
    initialValue: this,
  });

  @query('[part="ghost"]', true)
  public _ghost!: HTMLElement;

  @state()
  private _isDragging = false;

  @state()
  private _hasDragOver = false;

  @state()
  private _isResizing = false;

  /**
   * The unique identifier of the tile.
   * @attr
   */
  @property({ attribute: 'tile-id', type: String, reflect: true })
  public tileId: string | null = null;

  @property({ type: Number })
  public set colSpan(value: number) {
    const oldValue = this._colSpan;

    if (value <= 0) {
      this._colSpan = 1;
    } else {
      this._colSpan = value;
    }

    if (oldValue !== this._colSpan) {
      this.style.setProperty('--ig-col-span', `${value}`);
      this.requestUpdate('colSpan', oldValue);
    }
  }

  public get colSpan(): number {
    return this._colSpan;
  }

  @property({ type: Number })
  public set rowSpan(value: number) {
    const oldValue = this._rowSpan;

    if (value <= 0) {
      this._rowSpan = 1;
    } else {
      this._rowSpan = value;
    }

    if (oldValue !== this._rowSpan) {
      this.style.setProperty('--ig-row-span', `${value}`);
      this.requestUpdate('rowSpan', oldValue);
    }
  }

  public get rowSpan(): number {
    return this._rowSpan;
  }

  @property({ type: Number })
  public set colStart(value: number) {
    const oldValue = this._colStart;

    if (value <= 0) {
      this._colStart = null;
    } else {
      this._colStart = value;
    }

    if (oldValue !== this._colStart) {
      this.style.setProperty('--ig-col-start', `${value}`);
      this.requestUpdate('colStart', oldValue);
    }
  }

  public get colStart(): number | null {
    return this._colStart;
  }

  @property({ type: Number })
  public set rowStart(value: number) {
    const oldValue = this._rowStart;

    if (value <= 0) {
      this._rowStart = null;
    } else {
      this._rowStart = value;
    }

    if (oldValue !== this._rowStart) {
      this.style.setProperty('--ig-row-start', `${value}`);
      this.requestUpdate('rowStart', oldValue);
    }
  }

  public get rowStart(): number | null {
    return this._rowStart;
  }

  /**
   * Indicates whether the tile occupies the whole screen.
   * @attr fullscreen
   */
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
   * @attr maximized
   */
  @property({ type: Boolean, reflect: true })
  public set maximized(value: boolean) {
    this._maximized = value;
    this._context.setValue(this, true);
  }

  public get maximized() {
    return this._maximized;
  }

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

  constructor() {
    super();
    this._dragController = addTileDragAndDrop(this, {
      dragStart: this.handleDragStart,
      dragEnd: this.handleDragEnd,
      dragEnter: this.handleDragEnter,
      dragLeave: this.handleDragLeave,
      dragOver: this.handleDragOver,
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
    // RIVIEW: Should we use lit context instead?
    this._tileManager = this.closest(
      'igc-tile-manager'
    ) as IgcTileManagerComponent;
  }

  public toggleFullscreen() {
    this.fullscreen = !this.fullscreen;
    this.emitFullScreenEvent();
  }

  // protected override async firstUpdated() {
  //   await this.updateComplete;
  //   this.updateRowsColSpan();
  // }

  private emitFullScreenEvent() {
    return this.emitEvent('igcTileFullscreen', {
      detail: { tile: this, state: this.fullscreen },
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
    this._isDragging = true;

    requestAnimationFrame(() => {
      this._ghost.style.transform = 'scale(1)';
    });
  }

  private handleDragEnter() {
    const draggedId = this._tileManager?.draggedItem?.tileId;
    if (this._tileManager && this.tileId !== draggedId) {
      const draggedItem = this._tileManager.draggedItem;
      if (this._tileManager?.dragMode === 'slide' && draggedItem) {
        requestAnimationFrame(() => {
          this._ghost.style.transform = 'scale(0)';
        });
      } else {
        this._hasDragOver = true;
      }
    }
  }

  private handleDragOver() {
    const draggedId = this._tileManager?.draggedItem?.tileId;
    if (
      this._tileManager &&
      this.tileId !== draggedId &&
      this._tileManager?.dragMode === 'slide'
    ) {
      const draggedItem = this._tileManager?.draggedItem;
      const draggedPosition = draggedItem ? draggedItem.position : -1;
      if (draggedPosition >= 0) {
        const tempPosition = this._tileManager?.tiles[draggedPosition].position;
        this._tileManager.tiles[draggedPosition].position = this.position;
        this.position = tempPosition;
      }
    }
  }

  private handleDragLeave() {
    this._hasDragOver = false;
  }

  private handleDragEnd() {
    const event = new CustomEvent('tileDragEnd', {
      detail: { tile: this },
      bubbles: true,
    });
    this.dispatchEvent(event);
    this._isDragging = false;

    requestAnimationFrame(() => {
      this._ghost.style.transform = 'scale(0)';
    });
  }

  private cacheStyles() {
    //use util
    const computedStyle = getComputedStyle(this);

    this._cachedStyles = {
      columnCount: Number.parseFloat(
        computedStyle.getPropertyValue('--ig-column-count')
      ),
      background: computedStyle.getPropertyValue('--placeholder-background'),
      border: computedStyle.getPropertyValue('--ghost-border'),
      borderRadius: computedStyle.getPropertyValue('--border-radius'),
      minWidth: Number.parseFloat(
        computedStyle.getPropertyValue('--ig-min-col-width')
      ),
      minHeight: Number.parseFloat(
        computedStyle.getPropertyValue('--ig-min-row-height')
      ),
    };
  }

  private _handleResizeStart(event: CustomEvent<ResizeCallbackParams>) {
    const ghostElement = event.detail.state.ghost;
    this._initialPointerX = event.detail.event.clientX;
    this._initialPointerY = event.detail.event.clientY;

    if (ghostElement) {
      ghostElement.style.minWidth = `${this._cachedStyles.minWidth!}px`;
      ghostElement.style.minHeight = `${this._cachedStyles.minHeight!}px`;
    }
  }

  private _handleResize(event: CustomEvent<ResizeCallbackParams>) {
    this._isResizing = true;

    const ghostElement = event.detail.state.current;

    if (ghostElement) {
      const deltaX = event.detail.event.clientX - this._initialPointerX!;
      const deltaY = event.detail.event.clientY - this._initialPointerY!;
      const columnGap = 10;

      const snappedWidth = this._calculateSnappedWidth(
        deltaX,
        event.detail.state.initial.width,
        columnGap
      );
      const snappedHeight = this._calculateSnappedHeight(
        deltaY,
        event.detail.state.initial.height,
        columnGap
      );

      ghostElement.width = snappedWidth;
      ghostElement.height = snappedHeight;
    }
  }

  private _calculateSnappedWidth(
    deltaX: number,
    initialWidth: number,
    gap: number
  ): number {
    const newSize = initialWidth + deltaX;
    const tileManager =
      this.closest('igc-tile-manager')!.shadowRoot!.querySelector(
        "[part~='base']"
      )!;
    const styles = getComputedStyle(tileManager);

    const colWidth =
      Number.parseFloat(
        styles.getPropertyValue('grid-template-columns').split(' ')[0]
      ) || this._cachedStyles.minWidth!;
    const totalSpan = Math.round(newSize / (colWidth + gap));
    const snappedWidth = totalSpan * colWidth + (totalSpan - 1) * gap;
    return snappedWidth < colWidth ? colWidth : snappedWidth;
  }

  private _calculateSnappedHeight(
    deltaY: number,
    initialHeight: number,
    rowGap: number
  ): number {
    const minHeight = this._cachedStyles.minHeight!;
    let snappedHeight = initialHeight;

    if (deltaY > 0) {
      // For resizing down, add the gaps and the rows multiplied by min height to the initial tile height
      const additionalHeight = initialHeight + deltaY;
      const wholeRows = Math.floor(additionalHeight / (minHeight + rowGap));
      const totalHeight = wholeRows * (minHeight + rowGap) - rowGap;

      snappedHeight = Math.max(totalHeight, minHeight); // Ensure it at least snaps to minHeight
    } else if (deltaY < 0 && initialHeight > minHeight) {
      // For resizing up, subtract the gaps and the rows multiplied by min height from the initial tile height
      const reducedHeight = initialHeight + deltaY;
      const wholeRows = Math.floor(reducedHeight / (minHeight + rowGap));
      const totalHeight = wholeRows * (minHeight + rowGap) - rowGap;

      snappedHeight = Math.max(totalHeight, minHeight);
    }

    return snappedHeight;
  }

  private _handleResizeEnd(event: CustomEvent<ResizeCallbackParams>) {
    const state = event.detail.state;
    const width = state.current.width; // - state.current.x;
    const height = state.current.height; // - state.current.y;

    const resizeElement = event.target as HTMLElement;

    const parentWrapper =
      this.parentElement!.shadowRoot!.querySelector('[part="base"]')!;
    const tileManagerRect = parentWrapper.getBoundingClientRect();
    const computedStyles = getComputedStyle(parentWrapper);

    tileManagerRect.height -=
      Number.parseFloat(computedStyles.paddingTop) +
      Number.parseFloat(computedStyles.paddingBottom);
    tileManagerRect.width -=
      Number.parseFloat(computedStyles.paddingLeft) +
      Number.parseFloat(computedStyles.paddingRight);

    const gridTemplateColumnsWidth = Number.parseFloat(
      computedStyles.getPropertyValue('grid-template-columns').split(' ')[0]
    );
    const targetWidth = this._cachedStyles.columnCount
      ? tileManagerRect.width / this._cachedStyles.columnCount!
      : gridTemplateColumnsWidth;

    let colSpan = Math.round(width / targetWidth);
    colSpan = Math.max(1, colSpan);

    const minHeight = this._cachedStyles.minHeight!;
    let rowSpan = Math.round(height / minHeight);
    rowSpan = Math.max(1, rowSpan);

    // REVIEW
    Object.assign(resizeElement.style, {
      width: '',
      height: '',
    });

    Object.assign(this.style, {
      gridRow: `span ${rowSpan}`,
      gridColumn: `span ${colSpan}`,
    });

    this._isResizing = false;
    this._initialPointerX = null;
    this._initialPointerY = null;
    this._cachedStyles = {};
  }

  // REVIEW
  protected ghostFactory = () => {
    this.cacheStyles();

    const ghost = document.createElement('div');
    Object.assign(ghost.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1000,
      background: this._cachedStyles.background,
      border: `1px solid ${this._cachedStyles.border}`,
      borderRadius: this._cachedStyles.borderRadius,
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
      resizable: !this.disableResize,
      resizing: this._isResizing,
      maximized: this.maximized,
    });

    const styles = {
      '--ig-col-span': `${this.colSpan}`,
      '--ig-row-span': `${this.rowSpan}`,
      '--ig-col-start': `${this.colStart}`,
      '--ig-row-start': `${this.rowStart}`,
    };

    return html`
      <div
        part="tile-container"
        .inert=${this._hasDragOver}
        style=${styleMap(styles)}
      >
        <div part="ghost"></div>
        <div part=${parts}>
          <slot name="header"></slot>
          <div part="content-container">
            <slot></slot>
          </div>
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
            part="resize"
            .ghostFactory=${this.ghostFactory}
            mode="deferred"
            @igcResizeStart=${this._handleResizeStart}
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
