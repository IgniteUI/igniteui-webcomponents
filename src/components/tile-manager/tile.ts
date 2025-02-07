import { ContextProvider } from '@lit/context';
import { LitElement, html } from 'lit';
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
import {
  asNumber,
  createCounter,
  first,
  isElement,
  partNameMap,
} from '../common/util.js';
import IgcResizeContainerComponent from '../resize-container/resize-container.js';
import type { ResizeCallbackParams } from '../resize-container/types.js';
import { addFullscreenController } from './controllers/fullscreen.js';
import { swapTiles } from './position.js';
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

  /** Returns the parent tile manager. */
  private get _tileManager(): TileManagerContext | undefined {
    return this._managerContext.value;
  }

  /** Returns the tile manager internal CSS grid container. */
  private get _cssContainer(): HTMLElement {
    return this._tileManager?.grid.value!;
  }

  /** Returns the tile manager current resize mode. */
  private get _resizeMode() {
    return this._tileManager?.instance.resizeMode ?? 'none';
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

  /** Whether the parent tile manager drag action is in **slide** mode. */
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

  @query(IgcResizeContainerComponent.tagName)
  protected _resizeContainer?: IgcResizeContainerComponent;

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

  /** Whether to render the resize container based on tile and tile manager configuration. */
  private get _resizeDisabled(): boolean {
    return (
      this.disableResize ||
      this.maximized ||
      this.fullscreen ||
      this._resizeMode === 'none'
    );
  }

  /**
   * The unique identifier of the tile.
   * @attr tile-id
   */
  @property({ attribute: 'tile-id', type: String, reflect: true })
  public tileId: string | null = null;

  /**
   * The number of columns the tile will span.
   *
   * @remarks
   * Values <= 1 will be coerced to 1.
   *
   * @attr col-span
   */
  @property({ type: Number, attribute: 'col-span' })
  public set colSpan(value: number) {
    this._colSpan = Math.max(1, asNumber(value));
    this.style.setProperty('--ig-col-span', this._colSpan.toString());
  }

  public get colSpan(): number {
    return this._colSpan;
  }

  /**
   * The number of rows the tile will span.
   *
   * @remarks
   * Values <= 1 will be coerced to 1.
   *
   * @attr row-span
   */
  @property({ type: Number, attribute: 'row-span' })
  public set rowSpan(value: number) {
    this._rowSpan = Math.max(1, asNumber(value));
    this.style.setProperty('--ig-row-span', this._rowSpan.toString());
  }

  public get rowSpan(): number {
    return this._rowSpan;
  }

  /**
   * The starting column for the tile.
   *
   * @attr col-start
   */
  @property({ type: Number, attribute: 'col-start' })
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

  /**
   * The starting row for the tile.
   *
   * @attr row-start
   */
  @property({ type: Number, attribute: 'row-start' })
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
   *
   * @property
   */
  public get fullscreen(): boolean {
    return this._fullscreenController.fullscreen;
  }

  /**
   * Indicates whether the tile occupies all available space within the layout.
   *
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

  // REVIEW: Drop
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
   *
   * Corresponds to the CSS order property.
   *
   * @attr position
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
    this.part.toggle('dragging', state);
  }

  private _handleDragStart() {
    this.emitEvent('tileDragStart', { detail: this });
    this._setDragState();
  }

  private _handleDragMove() {}

  private _handleDragEnter(tile: Element) {
    Object.assign(tile, { _hasDragOver: true });
  }

  private _handleDragLeave(tile: Element) {
    Object.assign(tile, { _hasDragOver: false });
  }

  private _handleDragOver(tile: Element) {
    // REVIEW
    startViewTransition(() => {
      swapTiles(this, tile as IgcTileComponent);
    });
  }

  private _handleDragEnd() {
    this.emitEvent('tileDragEnd', { detail: this });
    this._setDragState(false);
  }

  private _skipDrag(event: PointerEvent): boolean {
    return Boolean(
      (this._resizeContainer &&
        event
          .composedPath()
          .some((e) => isElement(e) && e.matches('[part*=trigger]'))) ||
        this.maximized
    );
  }

  private _match(element: Element): boolean {
    return element !== this && IgcTileComponent.tagName === element.localName;
  }

  private _createDragGhost(): HTMLElement {
    const ghost = this.cloneNode(true) as HTMLElement;
    const { width, height } = this.getBoundingClientRect();

    Object.assign(ghost, {
      inert: true,
      id: '',
    });

    Object.assign(ghost.style, {
      position: 'absolute',
      contain: 'strict',
      top: 0,
      left: 0,
      width: `${width}px`,
      height: `${height}px`,
      background: 'var(--placeholder-background)',
      border: '1px solid var(--ghost-border)',
      borderRadius: 'var(--border-radius)',
      zIndex: 1000,
      viewTransitionName: '',
    });

    return ghost;
  }

  private _setResizeState(state = true) {
    this._isResizing = state;
    this.style.zIndex = state ? '1' : '';
    this.part.toggle('resizing', state);
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
    const active = this._resizeMode === 'always';

    return this._resizeDisabled
      ? this.renderContent()
      : html`
          <igc-resize
            part="resize"
            mode="deferred"
            ?active=${active}
            .ghostFactory=${createTileGhost}
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
