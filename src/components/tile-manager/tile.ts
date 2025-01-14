import { ContextProvider, consume } from '@lit/context';
import { LitElement, type PropertyValues, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { themes } from '../../theming/theming-decorator.js';
import {
  type TileManagerContext,
  tileContext,
  tileManagerContext,
} from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { asNumber, createCounter, partNameMap } from '../common/util.js';
import { addFullscreenController } from './controllers/fullscreen.js';
import { addTileDragAndDrop } from './controllers/tile-dnd.js';
import { isSameTile, swapTiles } from './position.js';
import type { ResizeCallbackParams } from './resize-controller.js';
import IgcResizeComponent from './resize-element.js';
import { styles as shared } from './themes/shared/tile/tile.common.css.js';
import { styles } from './themes/tile.base.css.js';
import { all } from './themes/tile.js';
import IgcTileHeaderComponent from './tile-header.js';
import { ResizeUtil } from './tile-util.js';

type IgcTileChangeState = {
  tile: IgcTileComponent;
  state: boolean;
};

// REVIEW: Decide whether to re-emit the events from the manager of leave them up to bubble naturally
export interface IgcTileComponentEventMap {
  igcTileFullscreen: CustomEvent<IgcTileChangeState>;
  igcTileMaximize: CustomEvent<IgcTileChangeState>;
  tileDragStart: CustomEvent<IgcTileComponent>;
  tileDragEnd: CustomEvent<IgcTileComponent>;
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

  private _dragController = addTileDragAndDrop(this, {
    dragStart: this.handleDragStart,
    dragEnd: this.handleDragEnd,
    dragEnter: this.handleDragEnter,
    dragLeave: this.handleDragLeave,
    dragOver: this.handleDragOver,
    drop: this.handleDragLeave,
  });

  private _fullscreenController = addFullscreenController(
    this,
    this.emitFullScreenEvent
  );

  private _colSpan = 1;
  private _rowSpan = 1;
  private _colStart: number | null = null;
  private _rowStart: number | null = null;
  private _position = -1;
  private _disableDrag = false;
  private _maximized = false;
  private _initialPointerX: number | null = null;
  private _initialPointerY: number | null = null;
  private _dragCounter = 0;
  private _dragGhost: HTMLElement | null = null;
  private _dragImage: HTMLElement | null = null;
  private _cachedStyles: {
    background?: string;
    border?: string;
    borderRadius?: string;
    columnCount?: number;
    gap?: number;
    initialTop?: number;
    minHeight?: number;
    minWidth?: number;
    tileBackground?: string;
    tileBorder?: string;
    rowHeights?: number[];
  } = {};

  // Tile manager context properties and helpers

  @consume({ context: tileManagerContext, subscribe: true })
  private _managerContext?: TileManagerContext;

  private _context = new ContextProvider(this, {
    context: tileContext,
    initialValue: {
      instance: this,
      setFullscreenState: (fullscreen, isUserTriggered) =>
        this._fullscreenController.setState(fullscreen, isUserTriggered),
    },
  });

  private _setTileContext() {
    this._context.setValue(
      {
        instance: this,
        setFullscreenState: (fullscreen, isUserTriggered) =>
          this._fullscreenController.setState(fullscreen, isUserTriggered),
      },
      true
    );
  }

  private get _draggedItem(): IgcTileComponent | null {
    return this._managerContext?.draggedItem ?? null;
  }

  private get _isSlideMode(): boolean {
    return this._managerContext
      ? this._managerContext.instance.dragMode === 'slide'
      : true;
  }

  @query('[part="ghost"]', true)
  public _ghost!: HTMLElement;

  @query('[part~="base"]', true)
  public _tileContent!: HTMLElement;

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
    this._colSpan = Math.max(1, asNumber(value));
    this.style.setProperty('--ig-col-span', this._colSpan.toString());
  }

  public get colSpan(): number {
    return this._colSpan;
  }

  @property({ type: Number })
  public set rowSpan(value: number) {
    this._rowSpan = Math.max(1, asNumber(value));
    this.style.setProperty('--ig-row-span', this._rowSpan.toString());
  }

  public get rowSpan(): number {
    return this._rowSpan;
  }

  @property({ type: Number })
  public set colStart(value: number) {
    this._colStart = Math.max(0, asNumber(value)) || null;
    this.style.setProperty(
      '--ig-col-start',
      this._colStart ? this._colStart.toString() : null
    );
  }

  public get colStart(): number | null {
    return this._colStart;
  }

  @property({ type: Number })
  public set rowStart(value: number) {
    this._rowStart = Math.max(0, asNumber(value)) || null;
    this.style.setProperty(
      '--ig-row-start',
      this._rowStart ? this._rowStart.toString() : null
    );
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
    this._fullscreenController.setState(value);
  }

  public get fullscreen(): boolean {
    return this._fullscreenController.fullscreen;
  }

  /**
   * Indicates whether the tile occupies all available space within the layout.
   * @attr maximized
   */
  @property({ type: Boolean, reflect: true })
  public set maximized(value: boolean) {
    this._maximized = value;
    this._setTileContext();

    if (this._managerContext) {
      this._managerContext.instance.requestUpdate();
    }
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

  protected get gridColumnWidth(): number {
    const tileManager =
      this._managerContext!.instance!.shadowRoot!.querySelector(
        "[part~='base']"
      )!;

    const gridTemplateColumns = getComputedStyle(tileManager).getPropertyValue(
      'grid-template-columns'
    );
    const firstColumnWidth = Number.parseFloat(
      gridTemplateColumns.split(' ')[0]
    );

    return firstColumnWidth || this._cachedStyles.minWidth!;
  }

  constructor() {
    super();
    this._setTileContext();
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.tileId = this.tileId || `tile-${IgcTileComponent.increment()}`;
  }

  protected override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    const parts = partNameMap({
      dragging: this._isDragging,
      resizing: this._isResizing,
    });

    if (parts.trim()) {
      this.setAttribute('part', parts);
    } else {
      this.removeAttribute('part');
    }
  }

  private emitFullScreenEvent(state: boolean) {
    return this.emitEvent('igcTileFullscreen', {
      detail: { tile: this, state },
      cancelable: true,
    });
  }

  private assignDragImage(e: DragEvent) {
    const rect = this.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const compStyles = getComputedStyle(this);
    this.cacheStyles();

    this._dragImage = this.cloneNode(true) as HTMLElement;
    Object.assign(this._dragImage.style, {
      width: compStyles.width,
      height: compStyles.height,
      position: 'absolute',
      top: '-99999px',
      left: '-99999px',
      background: this._cachedStyles.tileBackground,
      border: `1px solid ${this._cachedStyles.tileBorder}`,
      borderRadius: this._cachedStyles.borderRadius,
      overflow: 'hidden',
    });

    document.body.append(this._dragImage);

    e.dataTransfer!.setDragImage(this._dragImage, offsetX, offsetY);
    e.dataTransfer!.effectAllowed = 'move';
  }

  private handleDragStart(e: DragEvent) {
    this.assignDragImage(e);

    this.emitEvent('tileDragStart', { detail: this });
    this._dragGhost = this.ghostFactory();
    this._dragGhost.inert = true;

    if (this._dragGhost) {
      this.append(this._dragGhost);
    }
    this._isDragging = true;
  }

  private handleDragEnter() {
    this._dragCounter++;
    this._hasDragOver = true;
  }

  private handleDragOver(event: DragEvent) {
    if (!this._draggedItem) {
      return;
    }

    if (isSameTile(this, this._draggedItem)) {
      this._tileContent.style.visibility = 'hidden';
      if (this._dragGhost) {
        Object.assign(this._dragGhost.style, {
          visibility: 'visible',
        });
      }
      if (this._managerContext) {
        this._managerContext.lastSwapTile = null;
      }
    } else if (this._isSlideMode) {
      if (
        this._managerContext &&
        (!this._managerContext.lastSwapTile ||
          this.hasPointerLeftLastSwapTile(
            event,
            this._managerContext.lastSwapTile
          ))
      ) {
        this._managerContext.lastSwapTile = this;
        swapTiles(this, this._draggedItem!);
      }
    }
  }

  private handleDragLeave() {
    this._dragCounter--;

    // The drag leave is fired on entering a child element
    // so we check if the dragged item is actually leaving the tile
    if (this._dragCounter === 0) {
      this._hasDragOver = false;
    }
  }

  private handleDragEnd() {
    this.emitEvent('tileDragEnd', { detail: this });
    this._isDragging = false;

    if (this._dragGhost) {
      this._dragGhost.remove();
      this._dragGhost = null;
    }

    if (this._dragImage) {
      this._dragImage.remove();
      this._dragImage = null;
    }

    this._tileContent.style.visibility = 'visible';
  }

  private hasPointerLeftLastSwapTile(
    event: DragEvent,
    lastSwapTile: IgcTileComponent | null
  ) {
    if (!lastSwapTile) return false;

    // Check if the pointer is outside the boundaries of the last swapped tile

    const rect = lastSwapTile.getBoundingClientRect();
    const pointerX = event.clientX;
    const pointerY = event.clientY;

    const outsideBoundaries =
      pointerX < rect.left ||
      pointerX > rect.right ||
      pointerY < rect.top ||
      pointerY > rect.bottom;

    if (outsideBoundaries && this._managerContext) {
      this._managerContext.lastSwapTile = null;
    }

    return outsideBoundaries;
  }

  private cacheStyles() {
    //use util
    const tileComputedStyle = getComputedStyle(this);
    const parentWrapper =
      this.parentElement!.shadowRoot!.querySelector('[part="base"]')!;
    const tileManagerComputedStyle = getComputedStyle(parentWrapper);

    const gap =
      Number.parseFloat(
        tileManagerComputedStyle.getPropertyValue('grid-gap')
      ) || 0;
    const rowHeights = tileManagerComputedStyle.gridTemplateRows
      .split(' ')
      .map((height) => Number.parseFloat(height.trim()));

    this._cachedStyles = {
      columnCount: Number.parseFloat(
        tileComputedStyle.getPropertyValue('--ig-column-count')
      ),
      background: tileComputedStyle.getPropertyValue(
        '--placeholder-background'
      ),
      tileBackground: tileComputedStyle.getPropertyValue('--tile-background'),
      tileBorder: tileComputedStyle.getPropertyValue('--hover-border-color'),
      border: tileComputedStyle.getPropertyValue('--ghost-border'),
      borderRadius: tileComputedStyle.getPropertyValue('--border-radius'),
      minWidth: Number.parseFloat(
        tileComputedStyle.getPropertyValue('--ig-min-col-width')
      ),
      minHeight: Number.parseFloat(
        tileComputedStyle.getPropertyValue('--ig-min-row-height')
      ),
      initialTop: parentWrapper.getBoundingClientRect().top,
      rowHeights,
      gap,
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
    const rowHeights = this._cachedStyles.rowHeights!;

    if (ghostElement) {
      const deltaX = event.detail.event.clientX - this._initialPointerX!;
      const deltaY = event.detail.event.clientY - this._initialPointerY!;

      const snappedWidth = ResizeUtil.calculateSnappedWidth(
        deltaX,
        event.detail.state.initial.width,
        this._cachedStyles.gap!,
        this.gridColumnWidth
      );

      const actualTop = this._cachedStyles.initialTop! + window.scrollY;
      const initialTop = event.detail.state.initial.top + window.scrollY;
      const actualBottom = event.detail.state.initial.bottom + window.scrollY;

      const startingY = actualBottom - actualTop;

      const snappedHeight = ResizeUtil.calculateSnappedHeight(
        deltaY,
        startingY,
        rowHeights,
        this._cachedStyles.gap!,
        initialTop,
        event.detail.state.initial.height
      );

      ghostElement.width = snappedWidth;
      ghostElement.height = snappedHeight;
    }
  }

  private _handleResizeEnd(event: CustomEvent<ResizeCallbackParams>) {
    const state = event.detail.state;
    const width = state.current.width;
    const height = state.current.height;
    const rowHeights = this._cachedStyles.rowHeights!;

    const colSpan = Math.max(1, Math.round(width / this.gridColumnWidth));
    let accumulatedHeight = 0;
    let rowSpan = 1;

    for (let i = 0; i < rowHeights.length; i++) {
      accumulatedHeight +=
        rowHeights[i] + (i > 0 ? this._cachedStyles.gap! : 0);
      if (height <= accumulatedHeight) {
        rowSpan = i + 1;
        break;
      }
    }

    // REVIEW
    Object.assign(state.ghost!.style, {
      width: '',
      height: '',
    });

    this.style.setProperty('grid-row', `span ${rowSpan}`);
    this.style.setProperty('grid-column', `span ${colSpan}`);

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
      'drag-over': this._hasDragOver && !this._isSlideMode,
      fullscreen: this.fullscreen,
      draggable: !this.disableDrag,
      dragging: this._isDragging,
      resizable: !this.disableResize,
      resizing: this._isResizing,
      maximized: this.maximized,
    });

    const styles = {
      '--ig-col-span': this._colSpan,
      '--ig-row-span': this._rowSpan,
      '--ig-col-start': this._colStart,
      '--ig-row-start': this._rowStart,
    };

    return html`
      <div part=${parts} .inert=${this._hasDragOver} style=${styleMap(styles)}>
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
