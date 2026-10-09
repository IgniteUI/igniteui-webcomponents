import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { setTransitionName } from '#animations/view-transition.js';
import {
  type TileManagerContext,
  tileManagerContext,
} from '#internals/context.js';
import { addAsyncContextConsumer } from '#internals/controllers/async-consumer.js';
import { addFullscreenController } from '#internals/controllers/fullscreen.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import {
  coercedProperty,
  type CoercedPropertyConfig,
} from '#internals/decorators/coerced-property.js';
import { registerComponent } from '#internals/definitions/register.js';
import {
  type DragCallbackParams,
  type DraggableOptions,
  type DragPointerDirection,
  draggable,
} from '#internals/directives/drag.js';
import {
  type ResizableOptions,
  type ResizeCallbackParams,
  type ResizeDirection,
  resizable,
} from '#internals/directives/resize.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { HostAriaMixin } from '#internals/mixins/host-aria.js';
import { partMap } from '#internals/part-map.js';
import { isLTR, pointToFraction } from '#internals/utils/dom.js';
import { getElementFromPath } from '#internals/utils/events.js';
import { bindIf } from '#internals/utils/lit.js';
import { asNumber } from '#internals/utils/math.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import IgcDividerComponent from '../divider/divider.js';
import type { TileManagerDragMode, TileManagerResizeMode } from '../types.js';
import { createTileDragRecord, type TileDragRecord } from './position.js';
import { createTileResizeState } from './resize-state.js';
import { styles as shared } from './themes/shared/tile/tile.common.css.js';
import { styles } from './themes/tile.base.css.js';
import { all } from './themes/tile.js';
import { createTileDragGhost, createTileGhost } from './tile-ghost-util.js';
import type IgcTileManagerComponent from './tile-manager.js';
import { startSizeTransition } from './transitions.js';

export interface IgcTileChangeStateEventArgs {
  tile: IgcTileComponent;
  state: boolean;
}

type AdornerType = 'side' | 'corner' | 'bottom';

export interface IgcTileComponentEventMap {
  igcTileFullscreen: CustomEvent<IgcTileChangeStateEventArgs>;
  igcTileMaximize: CustomEvent<IgcTileChangeStateEventArgs>;
  igcTileDragStart: CustomEvent<IgcTileComponent>;
  igcTileDragEnd: CustomEvent<IgcTileComponent>;
  igcTileDragCancel: CustomEvent<IgcTileComponent>;
  igcTileResizeStart: CustomEvent<IgcTileComponent>;
  igcTileResizeEnd: CustomEvent<IgcTileComponent>;
  igcTileResizeCancel: CustomEvent<IgcTileComponent>;
}

/**
 * The icon and the English name of each default action, for the current
 * state. The name tells what the action does next.
 */
const DEFAULT_ACTIONS = {
  maximize: {
    on: { icon: 'collapse_content', label: 'Restore' },
    off: { icon: 'expand_content', label: 'Maximize' },
  },
  fullscreen: {
    on: { icon: 'fullscreen_exit', label: 'Exit full screen' },
    off: { icon: 'fullscreen', label: 'Enter full screen' },
  },
} as const;

const nextId = createIdGenerator('tile');

/**
 * The end and cancel events that wait for a view transition. The next drag
 * sends them before its start event.
 */
const pendingDragEvents = new Set<() => void>();
const Slots = setSlots(
  'title',
  'maximize-action',
  'fullscreen-action',
  'actions',
  'side-adorner',
  'corner-adorner',
  'bottom-adorner'
);

/**
 * The tile component is used within the tile manager as a container
 * for displaying various types of information.
 *
 * @remarks
 * The tile is a region, and the content of its `title` slot names it.
 *
 * @element igc-tile
 *
 * @fires igcTileFullscreen - Fired when the fullscreen state changes, with the new state in `detail.state`. Cancelable before the default action changes it. Not cancelable after a change by the browser, for example on Escape.
 * @fires igcTileMaximize - Fired before the default maximize action changes the maximized state, with the new state in `detail.state`. Cancelable.
 * @fires igcTileDragStart - Fired when a drag operation on a tile is about to begin. Cancelable.
 * @fires igcTileDragEnd - Fired when a drag completes, after its last swap applies.
 * @fires igcTileDragCancel - Fired when a drag is canceled, for example on Escape, after the start positions are back.
 * @fires igcTileResizeStart - Fired when a resize operation on a tile is about to begin. Cancelable.
 * @fires igcTileResizeEnd - Fired when a resize operation on a tile is successfully completed.
 * @fires igcTileResizeCancel - Fired when a resize is canceled, for example on Escape.
 *
 * @slot - Default slot for the tile's content.
 * @slot title - Renders the title of the tile header.
 * @slot maximize-action - Renders the maximize action element of the tile header.
 * @slot fullscreen-action - Renders the fullscreen action element of the tile header.
 * @slot actions - Renders items after the default actions in the tile header.
 * @slot side-adorner - Renders the side resize handle of the tile.
 * @slot corner-adorner - Renders the corner resize handle of the tile.
 * @slot bottom-adorner - Renders the bottom resize handle of the tile.
 *
 * @csspart base - The wrapper for the entire tile content, header and content.
 * @csspart header - The container for the tile header, including title and actions.
 * @csspart title - The title container of the tile.
 * @csspart actions - The actions container of the tile header.
 * @csspart content-container - The container wrapping the tile’s main content.
 * @csspart tile-container - The wrapper around the tile content and its resize adorners.
 * @csspart trigger-side - The side resize handle of the tile.
 * @csspart trigger - The corner resize handle of the tile.
 * @csspart trigger-bottom - The bottom resize handle of the tile.
 * @csspart draggable - Indicates that drag and drop is on. Applies to `base`.
 * @csspart resizable - Indicates that resizing is on. Applies to `base`.
 * @csspart dragging - Indicates a running drag operation. Applies to `base`.
 * @csspart resizing - Indicates a running resize operation. Applies to `base`.
 * @csspart maximized - Indicates the maximized state. Applies to `base`.
 * @csspart fullscreen - Indicates the fullscreen state. Applies to `base`.
 * @csspart active - Indicates that the resize adorners show. Applies to `tile-container`.
 * @csspart custom - Indicates a slotted custom adorner. Applies to `trigger-side`, `trigger` and `trigger-bottom`.
 */
export default class IgcTileComponent extends EventEmitterMixin<
  IgcTileComponentEventMap,
  Constructor<LitElement>
>(HostAriaMixin(LitElement)) {
  public static readonly tagName = 'igc-tile';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcTileComponent,
      IgcIconButtonComponent,
      IgcDividerComponent
    );
  }

  private readonly _slots = addSlotController(this, { slots: Slots });

  private readonly _fullscreenController = addFullscreenController(this, {
    onChange: (state, cancelable) =>
      this._emitStateEvent('igcTileFullscreen', state, cancelable),
  });

  private readonly _resizeState = createTileResizeState();
  private _dragRecord?: TileDragRecord;

  /** The parent at the last update. */
  private _renderedParent: Element | null = null;

  /** Config for a grid placement property, which sets a CSS variable on the host. */
  private static _gridVariable<T extends number | null>(
    name: string,
    transform: (value: T) => T
  ): CoercedPropertyConfig<T, IgcTileComponent> {
    return {
      transform: ({ value }) => transform(value),
      onChange: ({ value, host }) => {
        host.style.setProperty(name, value != null ? value.toString() : null);
      },
    };
  }

  /** The part and the resize direction of each adorner. */
  private static readonly _adorners: Record<
    AdornerType,
    { part: string; direction: ResizeDirection }
  > = {
    side: { part: 'trigger-side', direction: 'horizontal' },
    corner: { part: 'trigger', direction: 'both' },
    bottom: { part: 'trigger-bottom', direction: 'vertical' },
  };

  /** Config for the span properties - a whole number, at least 1. */
  private static _spanVariable(name: string) {
    return IgcTileComponent._gridVariable<number>(name, (value) =>
      Math.max(1, Math.trunc(asNumber(value)))
    );
  }

  /** Config for the start properties - a non-positive value removes the explicit placement. */
  private static _startVariable(name: string) {
    return IgcTileComponent._gridVariable<number | null>(
      name,
      (value) => Math.max(0, Math.trunc(asNumber(value))) || null
    );
  }

  private readonly _context = addAsyncContextConsumer(this, tileManagerContext);

  /** The context of the manager that lays the tile out: its parent, if any. */
  private get _tileManagerCtx(): TileManagerContext | undefined {
    const context = this._context.value;
    return context?.instance === this.parentElement ? context : undefined;
  }

  private get _tileManager(): IgcTileManagerComponent | undefined {
    return this._tileManagerCtx?.instance;
  }

  /** The CSS grid container of the manager. */
  private get _cssContainer(): HTMLElement | undefined {
    return this._tileManagerCtx?.grid.value;
  }

  private get _resizeMode(): TileManagerResizeMode {
    return this._tileManager?.resizeMode ?? 'none';
  }

  private get _dragMode(): TileManagerDragMode {
    return this._tileManager?.dragMode ?? 'none';
  }

  protected readonly _headerRef = createRef<HTMLElement>();

  /** The resize target of the resizable directive. */
  protected readonly _containerRef = createRef<HTMLElement>();

  @query('[part~="base"]', true)
  private readonly _tileContent!: HTMLElement;

  @state()
  private _isDragging = false;

  @state()
  private _isResizing = false;

  /** Whether the tile is hovered while the tile manager is in `hover` resize mode. */
  @state()
  private _isResizeActive = false;

  /** Whether the tile or the tile manager state disables resize. */
  private get _resizeDisabled(): boolean {
    return (
      this.disableResize ||
      this.maximized ||
      this.fullscreen ||
      this._resizeMode === 'none'
    );
  }

  /**
   * The number of columns the tile spans. A value is truncated to a whole
   * number, at least 1.
   *
   * @attr col-span
   * @default 1
   */
  @property({ type: Number, attribute: 'col-span' })
  @coercedProperty(IgcTileComponent._spanVariable('--ig-col-span'))
  public colSpan = 1;

  /**
   * The number of rows the tile spans. A value is truncated to a whole
   * number, at least 1.
   *
   * @attr row-span
   * @default 1
   */
  @property({ type: Number, attribute: 'row-span' })
  @coercedProperty(IgcTileComponent._spanVariable('--ig-row-span'))
  public rowSpan = 1;

  /**
   * The start column of the tile. A value below 1 removes the explicit start.
   *
   * @attr col-start
   */
  @property({ type: Number, attribute: 'col-start' })
  @coercedProperty(IgcTileComponent._startVariable('--ig-col-start'))
  public colStart: number | null = null;

  /**
   * The start row of the tile. A value below 1 removes the explicit start.
   *
   * @attr row-start
   */
  @property({ type: Number, attribute: 'row-start' })
  @coercedProperty(IgcTileComponent._startVariable('--ig-row-start'))
  public rowStart: number | null = null;

  /**
   * Indicates whether the tile occupies the whole screen.
   *
   * @remarks
   * To enter fullscreen from a custom `fullscreen-action`, call
   * `requestFullscreen()` on the tile. To leave it, call
   * `document.exitFullscreen()`. The tile follows the change.
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
  @coercedProperty<boolean, IgcTileComponent>({
    onChange: ({ host }) => host._tileManagerCtx?.setMaximizedState(),
  })
  public maximized = false;

  /**
   * Whether to disable resizing of the tile, whatever the resize mode of the
   * manager.
   *
   * @attr disable-resize
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-resize' })
  public disableResize = false;

  /**
   * Whether to hide the `fullscreen-action` slot and the default fullscreen
   * action.
   *
   * @attr disable-fullscreen
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-fullscreen' })
  public disableFullscreen = false;

  /**
   * Whether to hide the `maximize-action` slot and the default maximize action.
   *
   * @attr disable-maximize
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-maximize' })
  public disableMaximize = false;

  /**
   * The visual position of the tile in the layout, as the CSS `order`. A value
   * is truncated to a whole number.
   *
   * @attr position
   */
  @property({ type: Number })
  @coercedProperty<number, IgcTileComponent>({
    transform: ({ value }) => Math.trunc(asNumber(value)),
    onChange: ({ value, host }) => {
      host.style.order = value.toString();
    },
  })
  public position = -1;

  constructor() {
    super();
    addThemingController(this, all);

    // An `aria-label` on the host replaces the title, and an
    // `aria-labelledby` wins over both.
    addInternalsController(this, {
      initialARIA: { role: 'region' },
      aria: () => {
        const titles = this._slots.getAssignedElements('title');

        return {
          ariaLabelledByElements:
            titles.length && !this.hasAttribute('aria-label') ? titles : null,
        };
      },
    });
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    // A move to another parent can change the tile manager.
    if (this.parentElement !== this._renderedParent) {
      this.requestUpdate();
    }
    this.id = this.id || nextId();
    if (!this.style.viewTransitionName) {
      setTransitionName(this, `tile-transition-${this.id}`);
    }
  }

  protected override willUpdate(): void {
    this._renderedParent = this.parentElement;
  }

  private _setDragState(state = true) {
    this._isDragging = state;
    this._tileContent.style.opacity = state ? '0' : '';
    this.style.pointerEvents = state ? 'none' : '';
    this.part.toggle('dragging', state);
  }

  private _handleDragStart = ({ state }: DragCallbackParams) => {
    for (const emit of pendingDragEvents) {
      emit();
    }

    if (!this._emitStartEvent('igcTileDragStart', state.signal)) {
      return false;
    }

    this._setDragState();
    this._dragRecord = createTileDragRecord();
    return true;
  };

  private _handleDragOver = ({ event, state }: DragCallbackParams): void => {
    const match = state.element as IgcTileComponent;
    const record = this._dragRecord!;

    // Over the tile of the last swap, only a move past the threshold swaps back.
    if (
      record.last === match &&
      !this._shouldSwap(event, state.pointerState.direction, match)
    ) {
      return;
    }

    record.swap(this, match);
  };

  private _handleDragCancel = () => {
    this._emitDragEvent('igcTileDragCancel', this._endDrag()?.restore());
  };

  private _handleDragEnd = () => {
    this._emitDragEvent('igcTileDragEnd', this._endDrag()?.swapped);
  };

  private _endDrag(): TileDragRecord | undefined {
    const record = this._dragRecord;

    this._dragRecord = undefined;
    this._setDragState(false);
    return record;
  }

  /** Emits the event when the positions apply, or before the next drag starts. */
  private _emitDragEvent(
    name: 'igcTileDragEnd' | 'igcTileDragCancel',
    applied?: Promise<void>
  ): void {
    const emit = () => {
      if (pendingDragEvents.delete(emit)) {
        this.emitEvent(name, { detail: this });
      }
    };

    pendingDragEvents.add(emit);
    Promise.resolve(applied).then(emit, emit);
  }

  private _shouldSwap(
    { clientX, clientY }: PointerEvent,
    direction: DragPointerDirection,
    match: IgcTileComponent
  ): boolean {
    const relativeX = pointToFraction(match, clientX, isLTR(this));
    const { top, height } = match.getBoundingClientRect();
    const relativeY = (clientY - top) / height;

    switch (direction) {
      case 'start':
        return this.position > match.position && relativeX <= 0.25;
      case 'end':
        return this.position < match.position && relativeX >= 0.75;
      case 'top':
        return this.position > match.position && relativeY <= 0.25;
      case 'bottom':
        return this.position < match.position && relativeY >= 0.75;
      default:
        return false;
    }
  }

  /** Skips a press on a resize handle, on the actions, or on an inner tile of a nested manager. */
  private _skipDrag = (event: Event): boolean =>
    getElementFromPath(
      (e) =>
        e instanceof IgcTileComponent ||
        e.matches('[part*=trigger], #tile-actions'),
      event
    ) !== this;

  /** Matches the other tiles of the same manager. */
  private _match = (element: Element): element is IgcTileComponent => {
    return (
      element !== this &&
      IgcTileComponent.tagName === element.localName &&
      element.parentElement === this.parentElement
    );
  };

  private _setResizeState(state = true) {
    this._isResizing = state;
    this.style.zIndex = state ? '1' : '';
    this.part.toggle('resizing', state);
  }

  private _handleResizeStart = ({ event, state }: ResizeCallbackParams) => {
    if (!this._emitStartEvent('igcTileResizeStart', state.signal)) {
      return false;
    }

    event.preventDefault();
    this._resizeState.updateState(state.initial, this, this._cssContainer!);
    this._setResizeState();
    return true;
  };

  private _handleResize(
    { state }: ResizeCallbackParams,
    direction: ResizeDirection
  ): void {
    if (direction !== 'vertical') {
      state.current.width = this._resizeState.calculateSnappedWidth(state);
    }

    if (direction !== 'horizontal') {
      state.current.height = this._resizeState.calculateSnappedHeight(state);
    }
  }

  private _handleResizeEnd = ({ state }: ResizeCallbackParams) => {
    const { colSpan, rowSpan } = this._resizeState.calculateResizedGridPosition(
      state.current
    );

    state.commit = async () => {
      await startSizeTransition(this, () => {
        this.colSpan = colSpan;
        this.rowSpan = rowSpan;
      }).updateCallbackDone;

      this._setResizeState(false);
      this.emitEvent('igcTileResizeEnd', { detail: this });
    };
  };

  private _handleResizeCancel = () => {
    this._setResizeState(false);
    this.emitEvent('igcTileResizeCancel', { detail: this });
  };

  private _handleFullscreen() {
    this._fullscreenController.setState(!this.fullscreen);
  }

  private async _handleMaximize() {
    // Read once: a second click can come before the transition applies the first.
    const maximized = !this.maximized;

    if (!this._emitStateEvent('igcTileMaximize', maximized)) {
      return;
    }

    this.style.zIndex = '1';

    await startSizeTransition(this, () => {
      this.maximized = maximized;
    }).finished;

    this.style.zIndex = '';
  }

  private _emitStateEvent(
    name: 'igcTileFullscreen' | 'igcTileMaximize',
    state: boolean,
    cancelable = true
  ) {
    return this.emitEvent(name, { detail: { tile: this, state }, cancelable });
  }

  /** Returns `false` when a listener prevents the event or ends the operation, for example by moving the tile. */
  private _emitStartEvent(
    name: 'igcTileDragStart' | 'igcTileResizeStart',
    signal: AbortSignal
  ) {
    return (
      this.emitEvent(name, { detail: this, cancelable: true }) &&
      !signal.aborted
    );
  }

  protected _renderDefaultAction(type: 'maximize' | 'fullscreen') {
    const [active, listener] =
      type === 'fullscreen'
        ? [this.fullscreen, this._handleFullscreen]
        : [this.maximized, this._handleMaximize];
    const { icon, label } = DEFAULT_ACTIONS[type][active ? 'on' : 'off'];

    return html`
      <igc-icon-button
        variant="flat"
        collection="default"
        exportparts="icon"
        name=${icon}
        aria-label=${label}
        @click=${listener}
      ></igc-icon-button>
    `;
  }

  protected _renderHeader() {
    const hasTitle = this._slots.hasAssignedElements('title');
    const hasActions = this._slots.hasAssignedElements('actions');

    const hideHeader =
      !hasTitle &&
      !hasActions &&
      this.disableMaximize &&
      this.disableFullscreen;

    const hasMaximizeSlot = !(this.disableMaximize || this.fullscreen);
    const hasFullscreenSlot = !this.disableFullscreen;

    return html`
      <section part="header" ?hidden=${hideHeader} ${ref(this._headerRef)}>
        <header part="title">
          <slot name="title"></slot>
        </header>
        <section id="tile-actions" part="actions">
          ${hasMaximizeSlot ? this._renderActionSlot('maximize') : nothing}
          ${hasFullscreenSlot ? this._renderActionSlot('fullscreen') : nothing}
          <slot name="actions"></slot>
        </section>
      </section>
      <igc-divider aria-hidden="true"></igc-divider>
    `;
  }

  private _renderActionSlot(type: 'maximize' | 'fullscreen') {
    return html`
      <slot name="${type}-action">${this._renderDefaultAction(type)}</slot>
    `;
  }

  private _createDragOptions(): DraggableOptions {
    const dragMode = this._dragMode;

    return {
      enabled: dragMode !== 'none' && !this.maximized && !this.fullscreen,
      target: () => this,
      trigger:
        dragMode === 'tile-header' ? () => this._headerRef.value : undefined,
      skip: this._skipDrag,
      matchTarget: this._match,
      ghostFactory: (initial) => createTileDragGhost(this, initial),
      start: this._handleDragStart,
      over: this._handleDragOver,
      end: this._handleDragEnd,
      cancel: this._handleDragCancel,
    };
  }

  protected _renderContent() {
    const parts = {
      base: true,
      draggable: this._dragMode !== 'none',
      fullscreen: this.fullscreen,
      dragging: this._isDragging,
      resizable: !this.disableResize && this._resizeMode !== 'none',
      resizing: this._isResizing,
      maximized: this.maximized,
    };

    return html`
      <div part=${partMap(parts)} ${draggable(this._createDragOptions())}>
        ${this._renderHeader()}
        <div part="content-container">
          <slot></slot>
        </div>
      </div>
    `;
  }

  private _handleResizeHover(event: PointerEvent): void {
    this._isResizeActive = event.type === 'pointerenter';
  }

  private _createResizeOptions(direction: ResizeDirection): ResizableOptions {
    return {
      mode: 'deferred',
      direction,
      target: () => this._containerRef.value,
      ghostFactory: (initial) => createTileGhost(this, initial),
      start: this._handleResizeStart,
      resize: (params) => this._handleResize(params, direction),
      end: this._handleResizeEnd,
      cancel: this._handleResizeCancel,
    };
  }

  private _renderAdorner(type: AdornerType) {
    const { part, direction } = IgcTileComponent._adorners[type];
    const parts = {
      [part]: true,
      custom: this._slots.hasAssignedElements(`${type}-adorner`),
    };

    return html`
      <slot
        name="${type}-adorner"
        part=${partMap(parts)}
        ${resizable(this._createResizeOptions(direction))}
      ></slot>
    `;
  }

  protected _renderAdorners() {
    return html`
      ${this._renderAdorner('side')} ${this._renderAdorner('corner')}
      ${this._renderAdorner('bottom')}
    `;
  }

  /** The wrapper renders in every resize state, so a maximize keeps the header actions and their focus. */
  protected override render() {
    const resizable = !this._resizeDisabled;
    const isHoverMode = resizable && this._resizeMode === 'hover';
    const parts = {
      'tile-container': resizable,
      active:
        resizable && (this._isResizeActive || this._resizeMode === 'always'),
    };

    return html`
      <div
        id="tile-container"
        ${ref(this._containerRef)}
        part=${partMap(parts)}
        @pointerenter=${bindIf(isHoverMode, this._handleResizeHover)}
        @pointerleave=${bindIf(isHoverMode, this._handleResizeHover)}
      >
        ${this._renderContent()}
        ${parts.active ? this._renderAdorners() : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile': IgcTileComponent;
  }
}
