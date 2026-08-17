import { html, LitElement, type PropertyValues } from 'lit';
import { eventOptions, property, query, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
  endKey,
  homeKey,
} from '#internals/controllers/key-bindings.js';
import { createResizeObserverController } from '#internals/controllers/resize-observer.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { partMap } from '#internals/part-map.js';
import { isLTR, resolveCssLength } from '#internals/utils/dom.js';
import { bindIf } from '#internals/utils/lit.js';
import {
  asNumber,
  asPercent,
  clamp,
  roundPrecise,
} from '#internals/utils/math.js';
import { addThemingController } from '#theming/theming-controller.js';
import type { SplitterOrientation } from '../types.js';
import IgcVisuallyHiddenComponent from '../visually-hidden/visually-hidden.js';
import { styles as shared } from './themes/shared/splitter.common.css.js';
import { styles } from './themes/splitter.base.css.js';
import { all } from './themes/themes.js';
import type {
  IgcSplitterComponentEventMap,
  IgcSplitterLayoutChangedEventArgs,
  IgcSplitterResizeEventArgs,
  IgcSplitterResizeEventDetail,
  PanePosition,
  PaneResizeSnapshot,
  SplitterPaneState,
  SplitterResizeState,
} from './types.js';

const KEYBOARD_RESIZE_STEP = 10;

const PANES = ['start', 'end'] as const satisfies readonly PanePosition[];

/** Unitless values are rejected - they produce an invalid `flex` shorthand. */
const CSS_LENGTH =
  /^[+-]?(\d+\.?\d*|\.\d+)(%|px|em|rem|ch|ex|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|cm|mm|q|in|pt|pc)$/i;

const DEFAULT_RESIZE_STATE: SplitterResizeState = {
  startPane: null,
  endPane: null,
  dragStartPosition: { x: 0, y: 0 },
  dragPointerId: -1,
};

/**
 * A splitter component that provides a resizable split-pane layout, dividing the view
 * into two panels — *start* and *end* — separated by a draggable bar.
 *
 * Panels can be resized by dragging the bar, using keyboard shortcuts, or collapsed/expanded
 * using the built-in collapse buttons or the programmatic `toggle()` API.
 * Nested splitters are supported for more complex layouts.
 *
 * @example
 * ```html
 * <!-- Basic horizontal splitter -->
 * <igc-splitter>
 *   <div slot="start">Start panel</div>
 *   <div slot="end">End panel</div>
 * </igc-splitter>
 * ```
 *
 * @example
 * ```html
 * <!-- Vertical splitter with size constraints -->
 * <igc-splitter orientation="vertical" start-min-size="100px" end-min-size="100px">
 *   <div slot="start">Top panel</div>
 *   <div slot="end">Bottom panel</div>
 * </igc-splitter>
 * ```
 *
 * @example
 * ```html
 * <!-- Nested splitters for a multi-pane layout -->
 * <igc-splitter style="height: 600px;">
 *   <igc-splitter slot="start" orientation="vertical">
 *     <div slot="start">Top left</div>
 *     <div slot="end">Bottom left</div>
 *   </igc-splitter>
 *   <div slot="end">Right panel</div>
 * </igc-splitter>
 * ```
 *
 * @example
 * ```ts
 * // Programmatically collapse/expand a pane
 * const splitter = document.querySelector('igc-splitter');
 * splitter.toggle('start'); // collapse start pane
 * splitter.toggle('start'); // expand start pane
 * ```
 *
 * ## Keyboard interactions
 *
 * When the splitter bar is focused:
 *
 * | Key | Action |
 * |---|---|
 * | `Arrow Left` / `Arrow Right` | Resize panes (horizontal orientation) |
 * | `Arrow Up` / `Arrow Down` | Resize panes (vertical orientation) |
 * | `Home` | Snap start pane to its minimum size |
 * | `End` | Snap start pane to its maximum size |
 * | `Ctrl + Arrow Left` / `Ctrl + Arrow Up` | Collapse or expand the start pane |
 * | `Ctrl + Arrow Right` / `Ctrl + Arrow Down` | Collapse or expand the end pane |
 *
 * @element igc-splitter
 *
 * @fires igcResizeStart - Emitted once when a resize operation begins (pointer drag or keyboard).
 * @fires igcResizing - Emitted continuously while a pane is being resized.
 * @fires igcResizeEnd - Emitted once when a resize operation completes.
 * @fires igcLayoutChanged - Emitted after a user-driven resize or expansion change, with a full
 * snapshot of the current layout (pane sizes and collapsed states).
 *
 * @slot start - Content projected into the start (left/top) panel.
 * @slot end - Content projected into the end (right/bottom) panel.
 *
 * @csspart splitter-bar - The resizable bar element between the two panels.
 * @csspart drag-handle - The drag handle icon/element on the splitter bar.
 * @csspart start-pane - The container for the start panel content.
 * @csspart end-pane - The container for the end panel content.
 * @csspart start-collapse-btn - The button to collapse the start panel.
 * @csspart end-collapse-btn - The button to collapse the end panel.
 * @csspart start-expand-btn - The button to expand the start panel when collapsed.
 * @csspart end-expand-btn - The button to expand the end panel when collapsed.
 *
 * @remarks
 * The bar holds two expander elements, one on either side of the drag handle,
 * and each carries whichever part name applies to the current collapsed state.
 * A part name is therefore not tied to a fixed side: with the end pane
 * collapsed, `end-expand-btn` lands on the *first* of the two.
 */
export default class IgcSplitterComponent extends EventEmitterMixin<
  IgcSplitterComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-splitter';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcSplitterComponent, IgcVisuallyHiddenComponent);
  }

  //#region Private Properties

  private readonly _internals = addInternalsController(this);

  private readonly _separatorRef = createRef<HTMLElement>();

  private readonly _startPaneState: SplitterPaneState = {
    size: 'auto',
    styles: {},
  };
  private readonly _endPaneState: SplitterPaneState = {
    size: 'auto',
    styles: {},
  };

  @state()
  private _collapsedPane: PanePosition | null = null;

  /** Nothing in `render()` reads this, so it stays out of the reactive state. */
  private _resizeState: SplitterResizeState = { ...DEFAULT_RESIZE_STATE };

  private _measurement: { container: number; bar: number } | null = null;

  /** Container extent at the last resize notification we acted on. */
  private _observedSize = -1;

  @query('[part~="base"]')
  private readonly _base!: HTMLElement;

  @query('[part~="start-pane"]', true)
  private readonly _startPane!: HTMLElement;

  @query('[part~="end-pane"]', true)
  private readonly _endPane!: HTMLElement;

  private get _separator(): HTMLElement | undefined {
    return this._separatorRef.value;
  }

  private get _isDragging(): boolean {
    return this._resizeState.dragPointerId !== -1;
  }

  private get _resizeDisallowed(): boolean {
    return this.disableResize || this._collapsedPane != null;
  }

  private get _isHorizontal(): boolean {
    return this.orientation === 'horizontal';
  }

  private get _separatorCursor(): string {
    if (this._resizeDisallowed) {
      return 'default';
    }
    return this._isHorizontal ? 'col-resize' : 'row-resize';
  }

  //#endregion

  //#region Public Properties

  /**
   * The orientation of the splitter, which determines the direction of resizing and collapsing.
   *
   * Changing the orientation after the initial render clears the pane sizes and
   * their min/max constraints, along with the corresponding attributes - a size
   * authored for one axis rarely makes sense on the other.
   * @attr orientation
   * @default 'horizontal'
   */
  @property({ reflect: true })
  public orientation: SplitterOrientation = 'horizontal';

  /**
   * Whether collapsing either pane is disabled. When `true`, this also hides
   * the expand/collapse buttons on the splitter bar.
   * @attr disable-collapse
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-collapse' })
  public disableCollapse = false;

  /**
   * Whether resizing the panes by dragging the splitter bar or using keyboard
   * shortcuts is disabled. When `true`, this also hides the drag handle on the
   * splitter bar.
   * @attr disable-resize
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-resize' })
  public disableResize = false;

  /**
   * Whether the expand/collapse buttons on the splitter bar are hidden.
   *
   * Note that the buttons will also be hidden if `disable-collapse` is true or
   * if a pane is currently collapsed.
   * @attr hide-collapse-buttons
   * @default false
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'hide-collapse-buttons',
  })
  public hideCollapseButtons = false;

  /**
   * Whether the drag handle on the splitter bar is hidden.
   *
   * Note that the drag handle will also be hidden if `disable-resize` is true.
   * @attr hide-drag-handle
   * @default false
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'hide-drag-handle',
  })
  public hideDragHandle = false;

  /**
   * The minimum size of the start pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `100px` or `20%`. Setting
   * `auto`, a unitless or otherwise unparsable value, a negative value, or a
   * percentage above 100 removes the constraint.
   * @attr start-min-size
   */
  @property({ attribute: 'start-min-size' })
  public set startMinSize(value: string | undefined) {
    this._startPaneState.minSize = this._normalizeValue(value);
  }

  public get startMinSize(): string | undefined {
    return this._startPaneState.minSize;
  }

  /**
   * The minimum size of the end pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `100px` or `20%`. Setting
   * `auto`, a unitless or otherwise unparsable value, a negative value, or a
   * percentage above 100 removes the constraint.
   * @attr end-min-size
   */
  @property({ attribute: 'end-min-size' })
  public set endMinSize(value: string | undefined) {
    this._endPaneState.minSize = this._normalizeValue(value);
  }

  public get endMinSize(): string | undefined {
    return this._endPaneState.minSize;
  }

  /**
   * The maximum size of the start pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `500px` or `80%`. Setting
   * `auto`, a unitless or otherwise unparsable value, a negative value, or a
   * percentage above 100 removes the constraint.
   * @attr start-max-size
   */
  @property({ attribute: 'start-max-size' })
  public set startMaxSize(value: string | undefined) {
    this._startPaneState.maxSize = this._normalizeValue(value);
  }

  public get startMaxSize(): string | undefined {
    return this._startPaneState.maxSize;
  }

  /**
   * The maximum size of the end pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `500px` or `80%`. Setting
   * `auto`, a unitless or otherwise unparsable value, a negative value, or a
   * percentage above 100 removes the constraint.
   * @attr end-max-size
   */
  @property({ attribute: 'end-max-size' })
  public set endMaxSize(value: string | undefined) {
    this._endPaneState.maxSize = this._normalizeValue(value);
  }

  public get endMaxSize(): string | undefined {
    return this._endPaneState.maxSize;
  }

  /**
   * The size of the start pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `200px` or `50%`. Setting
   * `auto`, a unitless or otherwise unparsable value, a negative value, or a
   * percentage above 100 falls back to automatic sizing.
   * @attr start-size
   */
  @property({ attribute: 'start-size' })
  public set startSize(value: string | undefined) {
    this._setPaneSize('start', value);
  }

  public get startSize(): string | undefined {
    return this._startPaneState.size;
  }

  /**
   * The size of the end pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `200px` or `50%`. Setting
   * `auto`, a unitless or otherwise unparsable value, a negative value, or a
   * percentage above 100 falls back to automatic sizing.
   * @attr end-size
   */
  @property({ attribute: 'end-size' })
  public set endSize(value: string | undefined) {
    this._setPaneSize('end', value);
  }

  public get endSize(): string | undefined {
    return this._endPaneState.size;
  }

  /**
   * Whether the start pane is currently collapsed. Set this property to
   * collapse or expand the pane programmatically.
   * @attr start-collapsed
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'start-collapsed' })
  public set startCollapsed(value: boolean) {
    this._setCollapsed('start', value);
  }

  public get startCollapsed(): boolean {
    return this._isCollapsed('start');
  }

  /**
   * Whether the end pane is currently collapsed. Set this property to
   * collapse or expand the pane programmatically.
   * @attr end-collapsed
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'end-collapsed' })
  public set endCollapsed(value: boolean) {
    this._setCollapsed('end', value);
  }

  public get endCollapsed(): boolean {
    return this._isCollapsed('end');
  }

  //#endregion

  //#region Lifecycle

  constructor() {
    super();

    addThemingController(this, all);

    addSlotController(this, { slots: setSlots('start', 'end') });

    createResizeObserverController(this, {
      callback: () => this._handleContainerResize(),
    });

    addKeybindings(this, {
      ref: this._separatorRef,
    })
      .set(arrowUp, () => this._handleResizePanes(-1, 'vertical'))
      .set(arrowDown, () => this._handleResizePanes(1, 'vertical'))
      .set(arrowLeft, () => this._handleResizePanes(-1, 'horizontal'))
      .set(arrowRight, () => this._handleResizePanes(1, 'horizontal'))
      .set(homeKey, () => this._handleMinMaxResize('min'))
      .set(endKey, () => this._handleMinMaxResize('max'))
      .set([ctrlKey, arrowUp], () =>
        this._handleArrowsExpandCollapse('start', 'vertical')
      )
      .set([ctrlKey, arrowDown], () =>
        this._handleArrowsExpandCollapse('end', 'vertical')
      )
      .set([ctrlKey, arrowLeft], () =>
        this._handleArrowsExpandCollapse('start', 'horizontal')
      )
      .set([ctrlKey, arrowRight], () =>
        this._handleArrowsExpandCollapse('end', 'horizontal')
      );
  }

  protected override update(changed: PropertyValues<this>): void {
    this._measurement = null;

    if (changed.get('orientation') != null) {
      this._resetPaneSizes();
    }

    if (this.hasUpdated) {
      this._updatePanes();
    }

    super.update(changed);
  }

  protected override updated(): void {
    // Layout has just been committed; the `update()` measurements are stale.
    this._measurement = null;
    this._updateBarAria();
  }

  public override disconnectedCallback(): void {
    this._endDrag();
    super.disconnectedCallback();
  }

  //#endregion

  //#region Resize Event Handlers

  private _handleBarPointerDown(e: PointerEvent): void {
    if (e.button !== 0 || this._isDragging) {
      return;
    }

    e.preventDefault();

    this._resizeState = {
      ...this._resizeState,
      dragPointerId: e.pointerId,
      dragStartPosition: { x: e.clientX, y: e.clientY },
    };

    this._resizeStart();
    this._separator?.setPointerCapture(this._resizeState.dragPointerId);
  }

  private _getDragDelta(e: PointerEvent): number {
    const deltaX = e.clientX - this._resizeState.dragStartPosition.x;
    const deltaY = e.clientY - this._resizeState.dragStartPosition.y;
    return this._resolveDelta(deltaX, deltaY);
  }

  private _handleBarPointerMove(e: PointerEvent): void {
    if (e.pointerId !== this._resizeState.dragPointerId) {
      return;
    }

    const delta = this._getDragDelta(e);

    if (delta !== 0) {
      this._resizing(delta);
    }
  }

  private _handleEndDrag(e: PointerEvent): void {
    if (e.pointerId !== this._resizeState.dragPointerId) {
      return;
    }

    this._resizeEnd(this._getDragDelta(e));
    this._endDrag();
  }

  /** A cancelled gesture reverts, but still reports an end for the start it emitted. */
  private _handleCancelDrag(e: PointerEvent): void {
    if (e.pointerId !== this._resizeState.dragPointerId) {
      return;
    }

    this._resizeEnd(0);
    this._endDrag();
  }

  private _endDrag(): void {
    const { dragPointerId } = this._resizeState;

    // `releasePointerCapture` throws for a pointer that is no longer active.
    if (this._separator?.hasPointerCapture(dragPointerId)) {
      this._separator.releasePointerCapture(dragPointerId);
    }

    this._resizeState = { ...DEFAULT_RESIZE_STATE };
  }

  //#endregion

  //#region Public Methods

  /**
   * Toggles the collapsed state of the specified pane.
   *
   * Does not emit `igcLayoutChanged` - that event reports user-driven changes,
   * and a programmatic call is already known to the caller.
   */
  public toggle(position: PanePosition): void {
    this._applyCollapse(this._collapsedPane === position ? null : position);
  }

  //#endregion

  //#region Internal API

  private _applyCollapse(target: PanePosition | null): void {
    if (this._collapsedPane === null && target !== null) {
      this._savePaneSizes();
    }

    const wasStartCollapsed = this._isCollapsed('start');
    const wasEndCollapsed = this._isCollapsed('end');

    this._collapsedPane = target;

    // `toggle()`, the expanders and Ctrl + arrow bypass the decorated accessors,
    // and one assignment can change both flags. Request both so Lit reflects
    // them from their getters instead of leaving one stale.
    this.requestUpdate('startCollapsed', wasStartCollapsed);
    this.requestUpdate('endCollapsed', wasEndCollapsed);

    this._internals.setState('start-collapsed', this._isCollapsed('start'));
    this._internals.setState('end-collapsed', this._isCollapsed('end'));

    this._restoreSizesOnExpandCollapse();
  }

  private _setPaneSize(pane: PanePosition, value: string | undefined): void {
    this._getPaneState(pane).size = this._normalizeValue(value, 'auto');

    // A size authored while collapsed outranks the pre-collapse snapshot. The
    // whole snapshot goes - keeping the other pane's share would over-subscribe
    // the container and leave both panes shrinking to fit.
    if (this._collapsedPane !== null) {
      for (const target of PANES) {
        this._getPaneState(target).savedSize = undefined;
      }
    }
  }

  /** Drops the authored sizes and their attributes, which would otherwise diverge. */
  private _resetPaneSizes(): void {
    for (const pane of PANES) {
      const state = this._getPaneState(pane);
      state.size = 'auto';
      state.minSize = undefined;
      state.maxSize = undefined;
      state.savedSize = undefined;

      for (const suffix of ['size', 'min-size', 'max-size']) {
        this.removeAttribute(`${pane}-${suffix}`);
      }
    }
  }

  private _setCollapsed(pane: PanePosition, value: boolean): void {
    if (this._isCollapsed(pane) === value) {
      return;
    }
    this._applyCollapse(value ? pane : null);
  }

  private _savePaneSizes(): void {
    // Not measurable yet (collapsed before the first render) - keep the
    // explicit size rather than lose it to the 'auto' reset.
    if (this._getTotalSize() === 0) {
      this._startPaneState.savedSize = this._startPaneState.size;
      this._endPaneState.savedSize = this._endPaneState.size;
      return;
    }
    // Higher precision than the ARIA percent so restored layouts don't drift.
    const [start, end] = this._rectSize();
    this._startPaneState.savedSize = `${this._asPercentOfContainer(start, 2)}%`;
    this._endPaneState.savedSize = `${this._asPercentOfContainer(end, 2)}%`;
  }

  /* Reset sizes on collapse; restore saved sizes on expand */
  private _restoreSizesOnExpandCollapse(): void {
    if (this._collapsedPane !== null) {
      this._startPaneState.size = 'auto';
      this._endPaneState.size = 'auto';
    } else {
      this._startPaneState.size =
        this._startPaneState.savedSize ?? this.startSize;
      this._endPaneState.size = this._endPaneState.savedSize ?? this.endSize;
    }
  }

  /**
   * The container is what the browser resolves a percentage `flex-basis`
   * against, so a value measured this way survives a round trip through CSS.
   */
  private _asPercentOfContainer(size: number, precision = 0): number {
    const containerSize = this._getContainerSize();
    return containerSize === 0
      ? 0
      : roundPrecise(asPercent(size, containerSize), precision);
  }

  /** Resolves a CSS length to pixels, percentages against the container. */
  private _toPixels(value: string): number {
    if (value.endsWith('%')) {
      return (asNumber(value) / 100) * this._getContainerSize();
    }

    return this._base ? resolveCssLength(this._base, value) : 0;
  }

  private _getStartPaneSizePercent(): number {
    if (!this._startPane || this._isCollapsed('start')) {
      return 0;
    }

    if (this._isCollapsed('end')) {
      return 100;
    }

    return this._asPercentOfContainer(this._rectSize()[0]);
  }

  private _getMinMaxAsPercent(type: 'min' | 'max'): number {
    const value = type === 'min' ? this.startMinSize : this.startMaxSize;

    if (!value) {
      return type === 'min' ? 0 : 100;
    }

    return this._asPercentOfContainer(this._toPixels(value));
  }

  private _isCollapsed(which: PanePosition): boolean {
    return this._collapsedPane === which;
  }

  private _otherPane(pane: PanePosition): PanePosition {
    return pane === 'start' ? 'end' : 'start';
  }

  private _updateBarAria(): void {
    const separator = this._separator;

    if (separator) {
      const value = this._getStartPaneSizePercent();

      separator.ariaValueNow = value.toString();
      separator.ariaValueText = `${value}%`;
      separator.ariaValueMin = this._getMinMaxAsPercent('min').toString();
      separator.ariaValueMax = this._getMinMaxAsPercent('max').toString();
    }
  }

  private _getPaneState(which: PanePosition): SplitterPaneState {
    return which === 'start' ? this._startPaneState : this._endPaneState;
  }

  private _isPercentageSize(which: PanePosition): boolean {
    const { size } = this._getPaneState(which);
    return !!size && size.includes('%');
  }

  private _isAutoSize(which: PanePosition): boolean {
    return this._getPaneState(which).size === 'auto';
  }

  private _normalizeValue(
    value: string | undefined,
    fallback?: 'auto'
  ): string | undefined {
    const trimmed = value?.trim();
    if (!trimmed || trimmed === 'auto' || !CSS_LENGTH.test(trimmed)) {
      return fallback;
    }

    const numericValue = asNumber(trimmed, -1);
    if (numericValue < 0) return fallback;
    if (trimmed.includes('%') && numericValue > 100) return fallback;

    return trimmed;
  }

  private _getFlex(which: PanePosition, forceAuto = false): string {
    const isAuto = forceAuto || this._isAutoSize(which);
    const size = isAuto ? '0px' : this._getPaneState(which).size;
    return `${isAuto ? 1 : 0} 1 ${size}`;
  }

  private _handleResizePanes(
    direction: -1 | 1,
    validOrientation: SplitterOrientation
  ): void {
    if (this._resizeDisallowed || this.orientation !== validOrientation) {
      return;
    }
    const delta = this._resolveDelta(
      KEYBOARD_RESIZE_STEP,
      KEYBOARD_RESIZE_STEP,
      direction
    );

    this._runResize(delta);
  }

  /**
   * A complete resize for a non-pointer gesture. Sharing `_calcNewSizes` with
   * the drag path is what keeps both panes' constraints honoured and the
   * emitted sizes equal to the ones that actually render.
   */
  private _runResize(delta: number): void {
    this._resizeStart();
    this._resizing(delta);
    this._resizeEnd(delta);
    this._endDrag();
  }

  @eventOptions({ passive: false })
  private _preventDefaultForEvent(e: Event): void {
    e.preventDefault();
  }

  private _resolveDelta(
    deltaX: number,
    deltaY: number,
    direction?: -1 | 1
  ): number {
    const isHorizontal = this._isHorizontal;
    const rtlMultiplier = isHorizontal && !isLTR(this) ? -1 : 1;
    const delta = isHorizontal ? deltaX : deltaY;
    return delta * rtlMultiplier * (direction ?? 1);
  }

  /** Snaps the start pane to its minimum or maximum size. */
  private _handleMinMaxResize(type: 'min' | 'max'): void {
    if (this._resizeDisallowed) {
      return;
    }

    const targetStartSizePx =
      this._getConstraintInPx('start', type) ??
      (type === 'min' ? 0 : this._getTotalSize());

    this._runResize(targetStartSizePx - this._rectSize()[0]);
  }

  private _handleExpanderAction(pane: PanePosition): void {
    const other = this._otherPane(pane);
    this._toggleWithEvent(this._collapsedPane === other ? other : pane);
  }

  private _toggleWithEvent(position: PanePosition): void {
    this.toggle(position);
    this._emitLayoutChanged();
  }

  // Both sizes render as 'auto' while collapsed, so report the pre-collapse
  // ones instead - those are what a consumer needs to restore the layout.
  private _reportedSize(pane: PanePosition): string {
    const state = this._getPaneState(pane);
    return (
      (this._collapsedPane !== null ? state.savedSize : state.size) ?? 'auto'
    );
  }

  private _emitLayoutChanged(): void {
    const detail: IgcSplitterLayoutChangedEventArgs = {
      startSize: this._reportedSize('start'),
      endSize: this._reportedSize('end'),
      startCollapsed: this.startCollapsed,
      endCollapsed: this.endCollapsed,
    };
    this.emitEvent('igcLayoutChanged', { detail });
  }

  private _handleArrowsExpandCollapse(
    target: PanePosition,
    validOrientation: SplitterOrientation
  ): void {
    if (this.disableCollapse || this.orientation !== validOrientation) {
      return;
    }
    const isFlipped = validOrientation === 'horizontal' && !isLTR(this);
    this._handleExpanderAction(isFlipped ? this._otherPane(target) : target);
  }

  private _resizeStart(): void {
    const [startSize, endSize] = this._rectSize();

    this._resizeState.startPane = this._createPaneState('start', startSize);
    this._resizeState.endPane = this._createPaneState('end', endSize);

    this.emitEvent('igcResizeStart', {
      detail: { startPanelSize: startSize, endPanelSize: endSize },
    });
  }

  private _createPaneState(
    pane: PanePosition,
    size: number
  ): PaneResizeSnapshot {
    return {
      initialSize: size,
      isPercentageBased: this._isPercentageSize(pane) || this._isAutoSize(pane),
      minSizePx: this._getConstraintInPx(pane, 'min'),
      maxSizePx: this._getConstraintInPx(pane, 'max'),
    };
  }

  private _getConstraintInPx(
    pane: PanePosition,
    type: 'min' | 'max'
  ): number | undefined {
    const { minSize, maxSize } = this._getPaneState(pane);
    const value = type === 'max' ? maxSize : minSize;

    return value ? this._toPixels(value) : undefined;
  }

  private _resizing(delta: number): void {
    if (!this._resizeState.startPane || !this._resizeState.endPane) {
      return;
    }

    const [startPaneSize, endPaneSize] = this._calcNewSizes(delta);

    this.startSize = `${startPaneSize}px`;
    this.endSize = `${endPaneSize}px`;

    this.emitEvent('igcResizing', {
      detail: {
        startPanelSize: startPaneSize,
        endPanelSize: endPaneSize,
        delta,
      },
    });
  }

  private _computeSize(
    pane: PaneResizeSnapshot,
    paneSize: number,
    containerSize: number
  ): string {
    return pane.isPercentageBased
      ? `${asPercent(paneSize, containerSize)}%`
      : `${roundPrecise(paneSize, 0)}px`;
  }

  private _resizeEnd(delta: number): void {
    const { startPane, endPane } = this._resizeState;

    if (!startPane || !endPane) {
      return;
    }

    // A cancelled gesture reverts to the sizes captured at `_resizeStart`.
    const [startPaneSize, endPaneSize] =
      delta === 0
        ? [startPane.initialSize, endPane.initialSize]
        : this._calcNewSizes(delta);
    const containerSize = this._getContainerSize();

    this.startSize = this._computeSize(startPane, startPaneSize, containerSize);
    this.endSize = this._computeSize(endPane, endPaneSize, containerSize);

    this.emitEvent('igcResizeEnd', {
      detail: {
        startPanelSize: startPaneSize,
        endPanelSize: endPaneSize,
        delta,
      },
    });
    this._emitLayoutChanged();
  }

  private _rectSize(): [number, number] {
    const axis = this._isHorizontal ? 'width' : 'height';
    const startPaneRect = this._startPane.getBoundingClientRect();
    const endPaneRect = this._endPane.getBoundingClientRect();

    return [startPaneRect[axis], endPaneRect[axis]];
  }

  private _calcNewSizes(delta: number): [number, number] {
    if (!this._resizeState.startPane || !this._resizeState.endPane)
      return [0, 0];

    const start = this._resizeState.startPane;
    const end = this._resizeState.endPane;
    const minStart = start.minSizePx || 0;
    const minEnd = end.minSizePx || 0;
    const maxStart =
      start.maxSizePx || start.initialSize + end.initialSize - minEnd;
    const maxEnd =
      end.maxSizePx || start.initialSize + end.initialSize - minStart;

    const maxPosDelta = Math.min(
      maxStart - start.initialSize,
      end.initialSize - minEnd
    );
    const maxNegDelta = Math.min(
      start.initialSize - minStart,
      maxEnd - end.initialSize
    );
    const finalDelta = clamp(delta, -maxNegDelta, maxPosDelta);

    return [start.initialSize + finalDelta, end.initialSize - finalDelta];
  }

  /**
   * Reads the container and bar extents once per update pass - both
   * `_updatePanes` and `_updateBarAria` need them, and the style writes in
   * between would force a reflow for every repeated read.
   */
  private _measure(): { container: number; bar: number } {
    const axis = this._isHorizontal ? 'width' : 'height';

    this._measurement ??= {
      container: this._base ? this._base.getBoundingClientRect()[axis] : 0,
      bar: this._separator
        ? roundPrecise(this._separator.getBoundingClientRect()[axis])
        : 0,
    };

    return this._measurement;
  }

  /** The content box of the flex container - the basis for every percentage. */
  private _getContainerSize(): number {
    return this._measure().container;
  }

  /** The space left for the panes once the bar has taken its own. */
  private _getTotalSize(): number {
    const { container, bar } = this._measure();
    return container === 0 ? 0 : container - bar;
  }

  private _handleContainerResize(): void {
    this._measurement = null;
    const size = this._getContainerSize();

    if (size !== this._observedSize) {
      this._observedSize = size;
      this.requestUpdate();
    }
  }

  private _updatePanes(): void {
    const isCollapsed = this._collapsedPane !== null;

    // A collapsed pane renders as `auto` with its constraints lifted, while the
    // authored values stay untouched so they survive the round trip.
    for (const pane of PANES) {
      const { minSize, maxSize } = this._getPaneState(pane);

      this._setPaneMinMaxSizes(
        pane,
        isCollapsed ? '0' : minSize,
        isCollapsed ? '100%' : maxSize
      );
      this._updatePaneStyles(pane, { flex: this._getFlex(pane, isCollapsed) });
    }
  }

  private _updatePaneStyles(pane: PanePosition, styles: StyleInfo): void {
    Object.assign(this._getPaneState(pane).styles, styles);
  }

  private _setPaneMinMaxSizes(
    pane: PanePosition,
    minSize?: string,
    maxSize?: string
  ): void {
    const min = this._ensureMinConstraintIsWithinBounds(pane, minSize) ?? 0;
    const max = maxSize ?? '100%';

    this._updatePaneStyles(
      pane,
      this._isHorizontal
        ? { minWidth: min, maxWidth: max, minHeight: 0, maxHeight: '100%' }
        : { minWidth: 0, maxWidth: '100%', minHeight: min, maxHeight: max }
    );
  }

  private _ensureMinConstraintIsWithinBounds(
    pane: PanePosition,
    minSize?: string
  ): string | undefined {
    const total = this._getTotalSize();

    if (!minSize || total <= 0) {
      return minSize;
    }

    const minPx = this._getConstraintInPx(pane, 'min') ?? 0;
    const otherMinPx =
      this._getConstraintInPx(this._otherPane(pane), 'min') ?? 0;

    // Dropping a constraint the panes cannot both satisfy keeps content from
    // overflowing. It is reapplied once the container grows to accommodate it.
    return minPx + otherMinPx > total ? undefined : minSize;
  }

  private _handleExpanderClick(pane: PanePosition, event: PointerEvent): void {
    // Keep the bar from starting a resize
    event.stopPropagation();
    this._handleExpanderAction(pane);
  }

  //#endregion

  //#region Rendering

  private _resolvePartNames(expander: PanePosition): Record<string, boolean> {
    const other = this._otherPane(expander);
    const otherIsCollapsed = this._isCollapsed(other);

    return {
      [`${other}-expand-btn`]: otherIsCollapsed,
      [`${expander}-collapse-btn`]: !otherIsCollapsed,
    };
  }

  private _renderBarControls() {
    const dragHandleHidden = this.hideDragHandle || this.disableResize;
    const hidden = this.disableCollapse || this.hideCollapseButtons;
    const prevButtonHidden = hidden || this._isCollapsed('start');
    const nextButtonHidden = hidden || this._isCollapsed('end');

    return html`
      <div
        part="${partMap(this._resolvePartNames('start'))}"
        ?hidden=${prevButtonHidden}
        @pointerdown=${(e: PointerEvent) =>
          this._handleExpanderClick('start', e)}
      ></div>
      <div part="drag-handle" ?hidden=${dragHandleHidden}></div>
      <div
        part="${partMap(this._resolvePartNames('end'))}"
        ?hidden=${nextButtonHidden}
        @pointerdown=${(e: PointerEvent) => this._handleExpanderClick('end', e)}
      ></div>
    `;
  }

  private _renderAccessibleLabel() {
    return html`
      <igc-visually-hidden id="splitter-label"
        >Resize panes</igc-visually-hidden
      >
      <igc-visually-hidden id="splitter-state">
        ${
          this._isCollapsed('start')
            ? 'Start pane collapsed'
            : 'Start pane expanded'
        }
        and
        ${this._isCollapsed('end') ? 'End pane collapsed' : 'End pane expanded'}
      </igc-visually-hidden>
    `;
  }

  private _renderSeparator() {
    const canResize = !this._resizeDisallowed;

    return html`
      <div
        ${ref(this._separatorRef)}
        part="splitter-bar"
        role="separator"
        tabindex=${this.disableCollapse && this.disableResize ? -1 : 0}
        aria-controls="start-pane end-pane"
        aria-labelledby="splitter-label"
        aria-describedby="splitter-state"
        aria-orientation=${this.orientation}
        style=${styleMap({ '--cursor': this._separatorCursor })}
        @touchstart=${bindIf(canResize, this._preventDefaultForEvent)}
        @contextmenu=${bindIf(canResize, this._preventDefaultForEvent)}
        @pointerdown=${bindIf(canResize, this._handleBarPointerDown)}
        @pointermove=${this._handleBarPointerMove}
        @pointerup=${this._handleEndDrag}
        @lostpointercapture=${this._handleEndDrag}
        @pointercancel=${this._handleCancelDrag}
      >
        ${this._renderBarControls()}
      </div>
    `;
  }

  protected override render() {
    return html`
      ${this._renderAccessibleLabel()}
      <div part="base">
        <div
          part="start-pane"
          id="start-pane"
          style=${styleMap(this._startPaneState.styles)}
        >
          <slot name="start"></slot>
        </div>
        ${this._renderSeparator()}
        <div
          part="end-pane"
          id="end-pane"
          style=${styleMap(this._endPaneState.styles)}
        >
          <slot name="end"></slot>
        </div>
      </div>
    `;
  }

  //#endregion
}

export type {
  IgcSplitterComponentEventMap,
  IgcSplitterLayoutChangedEventArgs,
  IgcSplitterResizeEventArgs,
  IgcSplitterResizeEventDetail,
};

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter': IgcSplitterComponent;
  }
}
