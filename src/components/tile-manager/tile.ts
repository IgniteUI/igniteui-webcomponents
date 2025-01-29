import { ContextProvider } from '@lit/context';
import { LitElement, type PropertyValues, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { themes } from '../../theming/theming-decorator.js';
import {
  type TileContext,
  tileContext,
  tileManagerContext,
} from '../common/context.js';
import { createAsyncContext } from '../common/controllers/async-consumer.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { asNumber, createCounter, partNameMap } from '../common/util.js';
import IgcResizeContainerComponent from '../resize-container/resize-container.js';
import type { ResizeCallbackParams } from '../resize-container/types.js';
import { addFullscreenController } from './controllers/fullscreen.js';
import { addTileDragAndDrop } from './controllers/tile-dnd.js';
import { isSameTile, swapTiles } from './position.js';
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
      IgcResizeContainerComponent
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

  private _fullscreenController = addFullscreenController(this, {
    onEnterFullscreen: this.emitFullScreenEvent,
    onExitFullscreen: this.emitFullScreenEvent,
  });

  private _colSpan = 1;
  private _rowSpan = 1;
  private _colStart: number | null = null;
  private _rowStart: number | null = null;
  private _position = -1;
  private _disableDrag = false;
  private _maximized = false;
  private _startDeltaX: number | null = null;
  private _startDeltaY: number | null = null;
  private _colWidths: number[] = [];
  private _dragCounter = 0;
  private _dragGhost: HTMLElement | null = null;
  private _dragImage: HTMLElement | null = null;
  private _cachedStyles: {
    columnsArray?: string;
    columnCount?: number;
    gap?: number;
    minHeight?: number;
    minWidth?: number;
    rowHeights?: number[];
  } = {};

  // Tile manager context properties and helpers

  private _managerContext = createAsyncContext(this, tileManagerContext);

  private get _tileManager() {
    return this._managerContext.value;
  }

  private _createContext(): TileContext {
    return {
      instance: this,
      fullscreenController: this._fullscreenController,
    };
  }

  private _context = new ContextProvider(this, {
    context: tileContext,
    initialValue: this._createContext(),
  });

  private _setTileContext(): void {
    this._context.setValue(this._createContext(), true);
  }

  private get _draggedItem(): IgcTileComponent | null {
    return this._tileManager?.draggedItem ?? null;
  }

  private get _isSlideMode(): boolean {
    return this._tileManager
      ? this._tileManager.instance.dragMode === 'slide'
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
   */
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

    if (this._tileManager) {
      this._tileManager.instance.requestUpdate();
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
    this._position = asNumber(value);
    this.style.order = this._position.toString();
  }

  public get position(): number {
    return this._position;
  }

  protected get gridColumnWidth(): number {
    const tileManager =
      this._tileManager!.instance!.shadowRoot!.querySelector("[part~='base']")!;

    const gridTemplateColumns = getComputedStyle(tileManager).getPropertyValue(
      'grid-template-columns'
    );
    const firstColumnWidth = Number.parseFloat(
      gridTemplateColumns.split(' ')[0]
    );

    return firstColumnWidth || this._cachedStyles.minWidth!;
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.tileId = this.tileId || `tile-${IgcTileComponent.increment()}`;

    // REVIEW
    // this.style.viewTransitionName = `tile-transition-${crypto.randomUUID()}`;
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
    this._setTileContext();
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

    this._dragImage = this.cloneNode(true) as HTMLElement;
    Object.assign(this._dragImage.style, {
      width: compStyles.width,
      height: compStyles.height,
      position: 'absolute',
      top: '-99999px',
      left: '-99999px',
      background: 'var(--tile-background)',
      border: `1px solid ${'var(--hover-border-color)'}`,
      borderRadius: 'var(--border-radius)',
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

    const tileManager = this._tileManager!;

    if (isSameTile(this, this._draggedItem)) {
      this._tileContent.style.visibility = 'hidden';
      if (this._dragGhost) {
        Object.assign(this._dragGhost.style, {
          visibility: 'visible',
        });
      }
      tileManager.lastSwapTile = null;
    } else if (this._isSlideMode) {
      if (
        !tileManager.lastSwapTile ||
        this.hasPointerLeftLastSwapTile(event, tileManager.lastSwapTile)
      ) {
        tileManager.lastSwapTile = this;
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

    if (outsideBoundaries) {
      this._tileManager!.lastSwapTile = null;
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
      columnsArray: tileManagerComputedStyle.getPropertyValue(
        'grid-template-columns'
      ),
      columnCount: Number.parseFloat(
        tileComputedStyle.getPropertyValue('--ig-column-count')
      ),
      minWidth: Number.parseFloat(
        tileComputedStyle.getPropertyValue('--ig-min-col-width')
      ),
      minHeight: Number.parseFloat(
        tileComputedStyle.getPropertyValue('--ig-min-row-height')
      ),
      rowHeights,
      gap,
    };
  }

  private _handleResizeStart(event: CustomEvent<ResizeCallbackParams>) {
    this.cacheStyles();
    this._startDeltaX = event.detail.state.deltaX;
    this._startDeltaY = event.detail.state.deltaY;

    const columnWidths = this._cachedStyles
      .columnsArray!.split(' ')
      .map((c) => Number.parseFloat(c));

    const startingColumn = ResizeUtil.calculateTileStartingColumn(
      event.detail.state.initial.left,
      this._cachedStyles.gap!,
      columnWidths
    );

    //REVIEW use columnsArray directly?
    this._colWidths = columnWidths.slice(startingColumn);
  }

  private _handleResize(event: CustomEvent<ResizeCallbackParams>) {
    this._isResizing = true;

    const ghostElement = event.detail.state.current;
    const trigger = event.detail.state.trigger?.getAttribute('part');

    if (ghostElement) {
      //width
      if (trigger!.indexOf('side') > 0) {
        //export to func
        const deltaX = event.detail.state.deltaX - this._startDeltaX!;

        const snappedWidth = ResizeUtil.calculateSnappedWidth(
          deltaX,
          event.detail.state,
          this._cachedStyles.gap!,
          this._colWidths
        );

        ghostElement.width = snappedWidth;
        this._startDeltaX = event.detail.state.deltaX;
      } else if (trigger!.indexOf('bottom') > 0) {
        // height
        //ghostElement.height = snappedHeight;
      }
      // handle corner trigger
    }
  }

  private _handleResizeEnd(event: CustomEvent<ResizeCallbackParams>) {
    const state = event.detail.state;
    const height = state.current.height;

    //col Span logic
    let width = state.current.width;
    const totalWidth = state.current.x + state.current.width;

    // If total width is greater than the tile manager -> do not resize
    if (totalWidth > this.parentElement!.getBoundingClientRect().width) {
      width = state.initial.width;
    }

    const colSpan = Math.max(
      1,
      Math.ceil(width / (this.gridColumnWidth + this._cachedStyles.gap!))
    );

    // REVIEW & REWORK height logic
    const initialTop = event.detail.state.initial.top + window.scrollY;
    const startRowIndex = ResizeUtil.calculate(
      initialTop,
      this._cachedStyles.rowHeights!,
      this._cachedStyles.gap!
    ).targetIndex;

    const initialSpan = this._calculateRowSpan(
      state.initial.height,
      startRowIndex
    );
    const currentSpan = this._calculateRowSpan(height, startRowIndex);

    const deltaY = event.detail.event.clientY - this._startDeltaY!;
    const rowSpan =
      deltaY > 0
        ? Math.max(initialSpan, currentSpan)
        : Math.min(initialSpan, currentSpan);

    // REVIEW
    // startViewTransition(() => {
    //   this.style.setProperty('grid-row', `span ${rowSpan}`);
    //   this.style.setProperty('grid-column', `span ${colSpan}`);
    // });

    this.style.setProperty('grid-row', `span ${rowSpan}`);
    this.style.setProperty('grid-column', `span ${colSpan}`);

    this._isResizing = false;
    this._startDeltaX = null;
    this._startDeltaY = null;
    this._cachedStyles = {};
  }

  private _calculateRowSpan(height: number, startRowIndex: number): number {
    const gap = this._cachedStyles.gap!;
    const rowHeights = this._cachedStyles.rowHeights!;
    let accumulatedHeight = 0;

    for (let i = 0; i < rowHeights.length; i++) {
      const rowHeight = rowHeights[startRowIndex + i];
      const rowGap = startRowIndex + i > 0 ? gap : 0;
      const halfwayThreshold = accumulatedHeight + rowHeight / 2 + rowGap;

      accumulatedHeight += rowHeight + rowGap;

      if (height >= halfwayThreshold && height <= accumulatedHeight) {
        return i + 1;
      }
    }

    // Default to the first row
    return 1;
  }

  // REVIEW
  protected ghostFactory = () => {
    const ghost = document.createElement('div');

    Object.assign(ghost.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1000,
      background: 'var(--placeholder-background)',
      border: `2px solid ${'var(--ghost-border)'}`,
      borderRadius: 'var(--border-radius)',
      width: '100%',
      height: '100%',
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
