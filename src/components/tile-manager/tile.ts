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
  private _cachedStyles: {
    columnCount?: number;
    minWidth?: number;
    minHeight?: number;
    background?: string;
    border?: string;
    borderRadius?: string;
  } = {};

  // Tile manager context properties and helpers

  @consume({ context: tileManagerContext, subscribe: true })
  private _managerContext?: TileManagerContext;

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

    if (this._managerContext) {
      this._managerContext.instance.updateIsAnyTileMaximized();
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

    new ContextProvider(this, {
      context: tileContext,
      initialValue: {
        instance: this,
        setFullscreenState: (fullscreen, isUserTriggered) =>
          this._fullscreenController.setState(fullscreen, isUserTriggered),
      },
    });
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

  private handleDragStart(e: DragEvent) {
    const rect = this.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    e.dataTransfer!.setDragImage(this._tileContent, offsetX, offsetY);
    e.dataTransfer!.effectAllowed = 'move';

    this.emitEvent('tileDragStart', { detail: this });
    this._isDragging = true;

    requestAnimationFrame(() => {
      this._ghost.style.transform = 'scale(1)';
    });
  }

  private handleDragEnter() {
    if (!this._draggedItem || isSameTile(this, this._draggedItem)) {
      return;
    }

    if (this._isSlideMode) {
      requestAnimationFrame(() => {
        this._ghost.style.transform = 'scale(0)';
      });
    } else {
      this._hasDragOver = true;
    }
  }

  private handleDragOver() {
    if (!this._draggedItem || isSameTile(this, this._draggedItem)) {
      return;
    }

    if (this._isSlideMode) {
      swapTiles(this, this._draggedItem!);
    }
  }

  private handleDragLeave() {
    this._hasDragOver = false;
  }

  private handleDragEnd() {
    this.emitEvent('tileDragEnd', { detail: this });
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
      '--ig-col-span': this._colSpan,
      '--ig-row-span': this._rowSpan,
      '--ig-col-start': this._colStart,
      '--ig-row-start': this._rowStart,
    };

    const baseStyles = {
      // REVIEW: Using the hacky transform to 'hide' the base element
      // and still have it as drag image added with setDragImage()
      transform: this._isDragging ? 'translateX(-99999px)' : '',
    };

    return html`
      <div
        part="tile-container"
        .inert=${this._hasDragOver}
        style=${styleMap(styles)}
      >
        <div part="ghost" .inert=${true}></div>
        <div part=${parts} style=${styleMap(baseStyles)}>
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
