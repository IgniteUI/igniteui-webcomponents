import { LitElement, html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { startViewTransition } from '../../animations/player.js';
import { themes } from '../../theming/theming-decorator.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import {
  type TileManagerContext,
  tileManagerContext,
} from '../common/context.js';
import { createAsyncContext } from '../common/controllers/async-consumer.js';
import { addDragController } from '../common/controllers/drag.js';
import { addFullscreenController } from '../common/controllers/fullscreen.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import {
  asNumber,
  createCounter,
  findElementFromEventPath,
  partNameMap,
} from '../common/util.js';
import IgcDividerComponent from '../divider/divider.js';
import IgcResizeContainerComponent from '../resize-container/resize-container.js';
import type { ResizeCallbackParams } from '../resize-container/types.js';
import { createTileDragStack, swapTiles } from './position.js';
import { styles as shared } from './themes/shared/tile/tile.common.css.js';
import { styles } from './themes/tile.base.css.js';
import { all } from './themes/tile.js';
import {
  createTileDragGhost,
  createTileGhost,
  createTileResizeState,
} from './tile-util.js';

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
 *
 * @slot title - Renders the title of the tile header.
 * @slot default-actions - Renders maximize and fullscreen action elements.
 * @slot maximize-action - Renders the maximize action element.
 * @slot fullscreen-action - Renders the fullscreen action element.
 * @slot actions - Renders items after the default actions.
 * @slot Default slot fot the tile's content.
 *
 * @csspart base - The wrapper for the entire tile.
 * @csspart header - The container for the header, including title and actions.
 * @csspart title - The title container.
 * @csspart actions - The actions container.
 * @csspart content-container - The container wrapping the tile’s main content.
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
      IgcIconButtonComponent,
      IgcDividerComponent,
      IgcResizeContainerComponent
    );
  }

  private static readonly increment = createCounter();

  private _dragController = addDragController(this, {
    skip: this._skipDrag,
    matchTarget: this._match,
    layer: () => this._tileManager!,
    ghost: this._createDragGhost,
    start: this._handleDragStart,
    enter: this._handleDragEnter,
    end: this._handleDragEnd,
    cancel: this._handleDragCancel,
  });

  private _fullscreenController = addFullscreenController(this, {
    enter: this.emitFullScreenEvent,
    exit: this.emitFullScreenEvent,
  });

  private _colSpan = 1;
  private _rowSpan = 1;
  private _colStart: number | null = null;
  private _rowStart: number | null = null;
  private _position = -1;
  private _resizeState = createTileResizeState();
  private _dragStack = createTileDragStack();

  // Tile manager context properties and helpers

  /**
   * Context consumer callback that sets the updated configuration of the internal drag controller
   * based on the passed tile manager properties.
   */
  private _setDragConfiguration = ({
    instance: { dragMode },
  }: TileManagerContext) => {
    this._dragController.set({
      enabled: dragMode !== 'none',
      trigger:
        dragMode === 'tile-header' ? () => this._headerRef.value! : undefined,
    });
  };

  private _context = createAsyncContext(
    this,
    tileManagerContext,
    this._setDragConfiguration
  );

  /** Returns the parent tile manager context. */
  private get _tileManagerCtx(): TileManagerContext | undefined {
    return this._context.value;
  }

  private get _tileManager() {
    return this._tileManagerCtx?.instance;
  }

  /** Returns the tile manager internal CSS grid container. */
  private get _cssContainer(): HTMLElement {
    return this._tileManagerCtx?.grid.value!;
  }

  /** Returns the tile manager current resize mode. */
  private get _resizeMode() {
    return this._tileManager?.resizeMode ?? 'none';
  }

  /** Whether the parent tile manager drag action is in **slide** mode. */
  private get _isSlideMode(): boolean {
    return this._tileManagerCtx
      ? this._tileManagerCtx.instance.dragAction === 'slide'
      : true;
  }

  protected _headerRef = createRef<HTMLSlotElement>();

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

    if (this._tileManagerCtx) {
      this._tileManagerCtx.instance.requestUpdate();
    }
  }

  public get maximized(): boolean {
    return this._maximized;
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

    this.style.viewTransitionName =
      this.style.viewTransitionName || `tile-transition-${this.tileId}`;
  }

  private _setDragState(state = true) {
    this._isDragging = state;
    this._tileContent.style.opacity = state ? '0' : '1';
    this.style.pointerEvents = state ? 'none' : '';
    this.part.toggle('dragging', state);
  }

  private _handleDragStart() {
    this.emitEvent('tileDragStart', { detail: this });
    this._setDragState();
    this._dragStack.add(this);
  }

  private _handleDragEnter(tile: Element): void {
    const other = tile as IgcTileComponent;
    this._dragStack.add(other);

    startViewTransition(() => {
      swapTiles(this, other);
    });
  }

  private _handleDragCancel() {
    startViewTransition(() => {
      this._dragStack.restore();
      this._dragStack.reset();
    });

    this._dragController.dispose();
    this._setDragState(false);
  }

  private _handleDragEnd() {
    this.emitEvent('tileDragEnd', { detail: this });
    this._setDragState(false);
    this._dragStack.reset();
  }

  private _skipDrag(event: PointerEvent): boolean {
    if (this._maximized || this.fullscreen) {
      return true;
    }

    return Boolean(
      this._resizeContainer &&
        findElementFromEventPath('[part*=trigger]', event)
    );
  }

  private _match(element: Element): boolean {
    return element !== this && IgcTileComponent.tagName === element.localName;
  }

  private _createDragGhost(): IgcTileComponent {
    return createTileDragGhost(this);
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

  private _handleFullscreen() {
    this._fullscreenController.setState(!this.fullscreen);
  }

  private _handleMaximize() {
    if (!this.emitMaximizedEvent()) {
      return;
    }

    this.maximized = !this.maximized;
  }

  private emitFullScreenEvent(state: boolean) {
    this.requestUpdate();

    return this.emitEvent('igcTileFullscreen', {
      detail: { tile: this, state },
      cancelable: true,
    });
  }

  private emitMaximizedEvent() {
    return this.emitEvent('igcTileMaximize', {
      detail: { tile: this, state: !this.maximized },
      cancelable: true,
    });
  }

  protected _renderDefaultAction(type: 'maximize' | 'fullscreen') {
    const [icon, listener] =
      type === 'fullscreen'
        ? [
            this.fullscreen ? 'fullscreen_exit' : 'fullscreen',
            this._handleFullscreen,
          ]
        : [
            this._maximized ? 'collapse_content' : 'expand_content',
            this._handleMaximize,
          ];

    return html`
      <igc-icon-button
        variant="flat"
        collection="default"
        exportparts="icon"
        name=${icon}
        aria-label=${icon}
        @click=${listener}
      ></igc-icon-button>
    `;
  }

  protected _renderHeader() {
    return html`
      <section part="header">
        <header part="title" ${ref(this._headerRef)}>
          <slot name="title"></slot>
        </header>
        <section part="actions">
          <slot name="default-actions">
            <slot name="maximize-action">
              ${this.fullscreen
                ? nothing
                : this._renderDefaultAction('maximize')}
            </slot>
            <slot name="fullscreen-action">
              ${this._renderDefaultAction('fullscreen')}
            </slot>
          </slot>
          <slot name="actions"></slot>
        </section>
      </section>
      <igc-divider></igc-divider>
    `;
  }

  protected _renderContent() {
    const parts = partNameMap({
      base: true,
      draggable: true,
      'drag-over': this._hasDragOver && !this._isSlideMode,
      fullscreen: this.fullscreen,
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
      <div part=${parts} style=${styleMap(styles)}>
        ${this._renderHeader()}
        <div part="content-container">
          <slot></slot>
        </div>
      </div>
    `;
  }

  protected _renderResizeContainer() {
    return html`
      <igc-resize
        part="resize"
        mode="deferred"
        ?active=${this._resizeMode === 'always'}
        .ghostFactory=${createTileGhost}
        @igcResizeStart=${this._handleResizeStart}
        @igcResize=${this._handleResize}
        @igcResizeEnd=${this._handleResizeEnd}
        @igcResizeCancel=${this._handleResizeCancel}
      >
        ${this._renderContent()}
      </igc-resize>
    `;
  }

  protected override render() {
    return this._resizeDisabled
      ? this._renderContent()
      : this._renderResizeContainer();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile': IgcTileComponent;
  }
}
