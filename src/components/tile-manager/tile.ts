import { ContextProvider } from '@lit/context';
import { LitElement, type PropertyValues, html } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { startViewTransition } from '../../animations/player.js';
import { themes } from '../../theming/theming-decorator.js';
import {
  type TileContext,
  type TileManagerContext,
  tileContext,
  tileManagerContext,
} from '../common/context.js';
import { createAsyncContext } from '../common/controllers/async-consumer.js';
import { addDragDropController } from '../common/controllers/drag-and-drop.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { asNumber, createCounter, first, partNameMap } from '../common/util.js';
import IgcResizeContainerComponent from '../resize-container/resize-container.js';
import type { ResizeCallbackParams } from '../resize-container/types.js';
import { addFullscreenController } from './controllers/fullscreen.js';
import { styles as shared } from './themes/shared/tile/tile.common.css.js';
import { styles } from './themes/tile.base.css.js';
import { all } from './themes/tile.js';
import IgcTileHeaderComponent from './tile-header.js';
import { createTileGhost, createTileResizeState } from './tile-util.js';

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

  private _dragController = addDragDropController(this, {
    skip: this._skipDrag,
    matchTarget: this._match,
    layer: () => this._tileManager!.overlay.value!,
    ghost: this._createDragGhost,
    dragStart: this._handleDragStart,
    dragMove: this._handleDragMove,
    dragEnter: this._handleDragEnter,
    dragLeave: this._handleDragLeave,
    dragOver: this._handleDragOver,
    dragEnd: this._handleDragEnd,
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
  private _dragCounter = 0;
  private _dragGhost: HTMLElement | null = null;
  private _dragImage: HTMLElement | null = null;
  private _resizeState = createTileResizeState();

  // Tile manager context properties and helpers

  /**
   * Context consumer callback that sets the updated configuration of the internal drag controller
   * based on the passed tile manager properties.
   */
  private _setDragConfiguration = ({
    instance: { dragMode },
  }: TileManagerContext) => {
    this._dragController.setConfig({
      enabled: !this.disableDrag && dragMode !== 'none',
      trigger:
        dragMode === 'tile-header' ? () => first(this._headers) : undefined,
    });
  };

  private _managerContext = createAsyncContext(
    this,
    tileManagerContext,
    this._setDragConfiguration
  );

  private get _tileManager() {
    return this._managerContext.value;
  }

  private get _cssContainer() {
    return this._tileManager?.grid.value!;
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

  private get _isSlideMode(): boolean {
    return this._tileManager
      ? this._tileManager.instance.dragAction === 'slide'
      : true;
  }

  @queryAssignedElements({
    selector: IgcTileHeaderComponent.tagName,
    slot: 'header',
  })
  protected _headers!: IgcTileHeaderComponent[];

  @query(IgcResizeComponent.tagName)
  protected _resizeContainer?: IgcResizeComponent;

  @query('[part~="base"]', true)
  public _tileContent!: HTMLElement;

  @state()
  private _maximized = false;

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

  public get maximized(): boolean {
    return this._maximized;
  }

  /**
   * Indicates whether the tile can be dragged.
   * @attr disable-drag
   */
  @property({ attribute: 'disable-drag', type: Boolean, reflect: true })
  public set disableDrag(value: boolean) {
    this._disableDrag = value;
    this._dragController.setConfig({ enabled: !value });
  }

  public get disableDrag(): boolean {
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

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this.tileId = this.tileId || `tile-${IgcTileComponent.increment()}`;

    this.style.viewTransitionName = `tile-transition-${this.tileId}`;
  }

  protected override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    const parts = partNameMap({
      dragging: this._isDragging,
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

  private _setDragState(state = true) {
    this._isDragging = state;
    this._tileContent.style.opacity = state ? '0' : '1';
  }

  private _handleDragStart() {
    this.emitEvent('tileDragStart', { detail: this });
    this._setDragState();
  }

  private _handleDragMove() {}

  private _handleDragEnter(tile: Element) {
    // console.log('Entering:', tile);
    Object.assign(tile, { _hasDragOver: true });
  }

  private _handleDragLeave(tile: Element) {
    // console.log('Leaving:', tile);
    Object.assign(tile, { _hasDragOver: false });
  }

  private _handleDragOver(_: Element) {
    // console.log('DragOver');
  }

  private _handleDragEnd() {
    this.emitEvent('tileDragEnd', { detail: this });
    this._setDragState(false);
  }

  // private hasPointerLeftLastSwapTile(
  //   event: DragEvent,
  //   lastSwapTile: IgcTileComponent | null
  // ) {
  //   if (!lastSwapTile) return false;

  //   // Check if the pointer is outside the boundaries of the last swapped tile

  //   const rect = lastSwapTile.getBoundingClientRect();
  //   const pointerX = event.clientX;
  //   const pointerY = event.clientY;

  //   const outsideBoundaries =
  //     pointerX < rect.left ||
  //     pointerX > rect.right ||
  //     pointerY < rect.top ||
  //     pointerY > rect.bottom;

  //   if (outsideBoundaries && this._managerContext) {
  //     this._managerContext.lastSwapTile = null;
  //   }

  //   return outsideBoundaries;
  // }

  // XXX
  // private handleDragMove(event: PointerEvent) {
  //   if (!this._isDragging) return;
  //   event.preventDefault();
  //   // Move the drag image
  //   if (this._dragImage) {
  //     const x = event.clientX - this._dragStartOffset.x;
  //     const y = event.clientY - this._dragStartOffset.y;

  //     Object.assign(this._dragImage.style, {
  //       top: `${y}px`,
  //       left: `${x}px`,
  //     });
  //   }

  //   const hoveredTile = findElementFromEventPath<IgcTileComponent>(
  //     IgcTileComponent.tagName,
  //     event
  //   );

  //   if (
  //     this._previousHoveredTile &&
  //     this._previousHoveredTile !== hoveredTile
  //   ) {
  //     this._previousHoveredTile.style.pointerEvents = '';
  //   }

  //   if (this._draggedItem && hoveredTile) {
  //     hoveredTile.style.pointerEvents = 'none';

  //     if (isSameTile(hoveredTile, this._draggedItem)) {
  //       this._tileContent.style.visibility = 'hidden';
  //       if (this._dragGhost) {
  //         this._dragGhost.style.visibility = 'visible';
  //       }
  //     } else if (this._isSlideMode) {
  //       if (
  //         this._managerContext &&
  //         (!this._managerContext.lastSwapTile ||
  //           this.hasPointerLeftLastSwapTile(
  //             event,
  //             this._managerContext.lastSwapTile
  //           ))
  //       ) {
  //         this._managerContext.lastSwapTile = hoveredTile;
  //         swapTiles(hoveredTile, this._draggedItem!);
  //       }
  //     }
  //   }

  //   this._previousHoveredTile = hoveredTile;
  // }
  // XXX
  // private handleDragEnd(event: PointerEvent) {
  //   if (!this._isDragging) return;

  //   // Swap mode
  //   const draggedItem = this._draggedItem;
  //   const target = findElementFromEventPath<IgcTileComponent>(
  //     IgcTileComponent.tagName,
  //     event
  //   );

  //   if (
  //     !isSameTile(draggedItem, target) &&
  //     this._managerContext?.instance.dragMode === 'swap' &&
  //     !target?.disableDrag
  //   ) {
  //     swapTiles(draggedItem!, target!);
  //   }

  //   this.emitEvent('tileDragEnd', { detail: this });
  //   this._isDragging = false;

  //   if (this._dragGhost) {
  //     this._dragGhost.remove();
  //     this._dragGhost = null;
  //   }

  //   if (this._dragImage) {
  //     this._dragImage.remove();
  //     this._dragImage = null;
  //   }

  //   this.style.pointerEvents = '';
  //   this._tileContent.style.visibility = 'visible';
  // }
  // XXX
  // private hasPointerLeftLastSwapTile(
  //   event: PointerEvent,
  //   lastSwapTile: IgcTileComponent | null
  // ) {
  //   if (!lastSwapTile) return false;

  //   // Check if the pointer is outside the boundaries of the last swapped tile

  //   const rect = lastSwapTile.getBoundingClientRect();
  //   const pointerX = event.clientX;
  //   const pointerY = event.clientY;

  //   const outsideBoundaries =
  //     pointerX < rect.left ||
  //     pointerX > rect.right ||
  //     pointerY < rect.top ||
  //     pointerY > rect.bottom;

  //   if (outsideBoundaries && this._managerContext) {
  //     this._managerContext.lastSwapTile = null;
  //   }

  //   return outsideBoundaries;
  // }

  private _setResizeState(state = true) {
    this._isResizing = state;
    this.style.zIndex = state ? '1' : '';
  }

  private _handleResizeStart({
    detail: { state },
  }: CustomEvent<ResizeCallbackParams>) {
    this._resizeState.updateState(state.initial, this, this._cssContainer);
    this._setResizeState();
  }

  private _handleResize({
    detail: { state },
  }: CustomEvent<ResizeCallbackParams>) {
    const trigger = state.trigger!;

    const isWidthResize = trigger.matches('[part*="side"], [part="trigger"]');
    const isHeightResize = trigger.matches(
      '[part*="bottom"], [part="trigger"]'
    );

    if (isWidthResize) {
      state.current.width = this._resizeState.calculateSnappedWidth(state);
    }

    if (isHeightResize) {
      state.current.height = this._resizeState.calculateSnappedHeight(state);
    }
  }

  private _handleResizeEnd({
    detail: { state },
  }: CustomEvent<ResizeCallbackParams>) {
    const { column, row } = this._resizeState.getResizedPosition(state.current);

    state.commit = () =>
      startViewTransition(() => {
        this.style.setProperty('grid-row', row);
        this.style.setProperty('grid-column', column);
      });

    this._setResizeState(false);
  }

  private _handleResizeCancel() {
    this._setResizeState(false);
  }

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
            .ghostFactory=${createTileGhost}
            mode="deferred"
            @igcResizeStart=${this._handleResizeStart}
            @igcResize=${this._handleResize}
            @igcResizeEnd=${this._handleResizeEnd}
            @igcResizeCancel=${this._handleResizeCancel}
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
