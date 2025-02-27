import { LitElement, html, nothing } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
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
import {
  type DragCallbackParameters,
  addDragController,
} from '../common/controllers/drag.js';
import { addFullscreenController } from '../common/controllers/fullscreen.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import {
  asNumber,
  createCounter,
  findElementFromEventPath,
  getCenterPoint,
  isEmpty,
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

type AdornerType = 'side' | 'corner' | 'bottom';

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
 * @slot maximize-action - Renders the maximize action element.
 * @slot fullscreen-action - Renders the fullscreen action element.
 * @slot actions - Renders items after the default actions.
 * @slot Default slot for the tile's content.
 * @slot side-adorner - Renders the side resize handle.
 * @slot corner-adorner - Renders the corner resize handle.
 * @slot bottom-adorner - Renders the bottom resize handle.
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
    ghost: this._createDragGhost,
    start: this._handleDragStart,
    move: this._handleDragMove,
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

  private _customAdorners = new Map<string, boolean>(
    Object.entries({
      side: false,
      corner: false,
      bottom: false,
    })
  );

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

  protected _headerRef = createRef<HTMLSlotElement>();

  @queryAssignedElements({ slot: 'title' })
  private _titleElements!: HTMLElement[];

  @queryAssignedElements({ slot: 'actions' })
  private _actionsElements!: HTMLElement[];

  @query(IgcResizeContainerComponent.tagName)
  protected _resizeContainer?: IgcResizeContainerComponent;

  @query('[part~="base"]', true)
  public _tileContent!: HTMLElement;

  @state()
  private _maximized = false;

  @state()
  private _isDragging = false;

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
  public set colStart(value: number | null) {
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
  public set rowStart(value: number | null) {
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

    const { width, height } = value
      ? this._resizeState.emptyResizeDimensions
      : this._resizeState.resizedDimensions;

    this._resizeContainer?.setSize(width, height);

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
   * Indicates whether the fullscreen action is displayed.
   * @attr disable-fullscreen
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-fullscreen' })
  public disableFullscreen = false;

  /**
   * Indicates whether the maximize action is displayed.
   * @attr disable-maximize
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-maximize' })
  public disableMaximize = false;

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

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this.requestUpdate());
    return root;
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
    this._dragStack.push(this);
  }

  private _handleDragMove({
    event: { clientX, clientY },
  }: DragCallbackParameters) {
    const match = document
      .elementsFromPoint(clientX, clientY)
      .find(this._match);

    if (!match) {
      return;
    }

    if (this._dragStack.peek() === match) {
      const { x, y } = getCenterPoint(match);

      const shouldSwap =
        this.position <= match.position
          ? clientX > x || clientY > y
          : clientX < x || clientY < y;

      if (shouldSwap) {
        this._dragStack.pop();
        this._dragStack.push(match);

        startViewTransition(() => {
          swapTiles(this, match);
        });
      }

      return;
    }

    this._dragStack.push(match);

    startViewTransition(() => {
      swapTiles(this, match);
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
      findElementFromEventPath(
        (e) => e.matches('[part*=trigger]') || e.matches('#tile-actions'),
        event
      )
    );
  }

  private _match(element: Element): element is IgcTileComponent {
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

  private async _handleResizeEnd({
    detail: { state },
  }: CustomEvent<ResizeCallbackParams>) {
    const { column, row } = this._resizeState.getResizedPosition(state.current);

    const { transition } = startViewTransition(() => {
      this.style.setProperty('grid-row', row);
      this.style.setProperty('grid-column', column);
    });

    await transition?.updateCallbackDone;

    const { width, height } = this._resizeState.calculateResizedSize(
      this._cssContainer
    );

    this._resizeState.resizedDimensions = { width, height };
    this._resizeContainer?.setSize(width, height);
    this._setResizeState(false);
  }

  private _handleResizeCancel() {
    this._setResizeState(false);
  }

  private _handleFullscreen() {
    const { width, height } = !this.fullscreen
      ? this._resizeState.emptyResizeDimensions
      : this._resizeState.resizedDimensions;

    this._resizeContainer?.setSize(width, height);
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
    const hideHeader =
      isEmpty(this._titleElements) &&
      isEmpty(this._actionsElements) &&
      this.disableMaximize &&
      this.disableFullscreen;

    return html`
      <section part="header" ?hidden=${hideHeader}>
        <header part="title" ${ref(this._headerRef)}>
          <slot name="title"></slot>
        </header>
        <section id="tile-actions" part="actions">
          ${!this.disableMaximize
            ? html`<slot name="maximize-action"
                >${this._renderDefaultAction('maximize')}</slot
              >`
            : nothing}
          ${!this.disableFullscreen
            ? html`<slot name="fullscreen-action"
                >${this._renderDefaultAction('fullscreen')}</slot
              >`
            : nothing}

          <slot name="actions"></slot>
        </section>
      </section>
      <igc-divider></igc-divider>
    `;
  }

  protected _renderContent() {
    const parts = partNameMap({
      base: true,
      draggable: this._tileManager?.dragMode !== 'none',
      fullscreen: this.fullscreen,
      dragging: this._isDragging,
      resizable:
        !this.disableResize && this._tileManager?.resizeMode !== 'none',
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

  private _renderAdornerSlot(name: AdornerType) {
    return html`
      <slot
        @slotchange=${() => this._customAdorners.set(name, true)}
        name="${name}-adorner"
        slot="${name}-adorner"
      >
        <div part="adorner-indicator"></div>
      </slot>
    `;
  }

  protected override render() {
    return html`
      <igc-resize
        part=${partNameMap({
          resize: true,
          'side-adorner': this._customAdorners.get('side')!,
          'corner-adorner': this._customAdorners.get('corner')!,
          'bottom-adorner': this._customAdorners.get('bottom')!,
        })}
        mode="deferred"
        .enabled=${!this._resizeDisabled}
        ?active=${this._resizeMode === 'always'}
        .ghostFactory=${createTileGhost}
        @igcResizeStart=${this._handleResizeStart}
        @igcResize=${this._handleResize}
        @igcResizeEnd=${this._handleResizeEnd}
        @igcResizeCancel=${this._handleResizeCancel}
      >
        ${this._renderContent()} ${this._renderAdornerSlot('side')}
        ${this._renderAdornerSlot('corner')}
        ${this._renderAdornerSlot('bottom')}
      </igc-resize>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile': IgcTileComponent;
  }
}
