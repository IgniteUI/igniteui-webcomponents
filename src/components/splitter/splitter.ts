import { html, LitElement, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  ariaBindings,
  hostAria,
} from '#internals/controllers/aria-projection.js';
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
import { addResizeObserverController } from '#internals/controllers/resize-observer.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { HostAriaMixin } from '#internals/mixins/host-aria.js';
import { partMap } from '#internals/part-map.js';
import { isLTR, resolveCssLength } from '#internals/utils/dom.js';
import { preventDefault } from '#internals/utils/events.js';
import { bindIf } from '#internals/utils/lit.js';
import {
  asNumber,
  asPercent,
  clamp,
  roundPrecise,
} from '#internals/utils/math.js';
import { addThemingController } from '#theming/theming-controller.js';
import type { SplitterOrientation } from '../types.js';
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

/** A number carrying a percentage sign or one of the CSS length units. */
const CSS_LENGTH =
  /^[+-]?(\d+\.?\d*|\.\d+)(%|px|em|rem|ch|ex|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|cm|mm|q|in|pt|pc)$/i;

const UNITLESS_NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)$/;

/** A valid CSS length or percentage of `value`, else `fallback`. */
function normalizeValue(
  value: string | undefined,
  fallback?: 'auto'
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === 'auto') {
    return fallback;
  }

  const numericValue = asNumber(trimmed, -1);
  if (numericValue < 0) return fallback;
  if (trimmed.includes('%') && numericValue > 100) return fallback;

  // Only zero needs no unit. Another bare number is invalid CSS and drops
  // the whole `flex` shorthand.
  const isUnitlessZero = numericValue === 0 && UNITLESS_NUMBER.test(trimmed);

  return isUnitlessZero || CSS_LENGTH.test(trimmed) ? trimmed : fallback;
}

const DEFAULT_RESIZE_STATE: SplitterResizeState = {
  startPane: null,
  endPane: null,
  dragStartPosition: { x: 0, y: 0 },
  dragPointerId: -1,
};

/**
 * A splitter component that provides a resizable split-pane layout, dividing the view
 * into two panels - *start* and *end* - separated by a draggable bar.
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
>(HostAriaMixin(LitElement)) {
  public static readonly tagName = 'igc-splitter';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcSplitterComponent);
  }

  //#region Private Properties

  private readonly _internals = addInternalsController(this);

  private readonly _separatorRef = createRef<HTMLElement>();

  private readonly _panes: Record<PanePosition, SplitterPaneState> = {
    start: { size: 'auto', styles: {} },
    end: { size: 'auto', styles: {} },
  };

  @state()
  private _collapsedPane: PanePosition | null = null;

  private _resizeState: SplitterResizeState = { ...DEFAULT_RESIZE_STATE };

  private _measurement: { container: number; bar: number } | null = null;

  /** Container extent at the last handled resize. */
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
   * Accepts a CSS length with an explicit unit, e.g. `100px` or `20%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 removes the constraint.
   * @attr start-min-size
   */
  @property({ attribute: 'start-min-size' })
  public set startMinSize(value: string | undefined) {
    this._panes.start.minSize = normalizeValue(value);
  }

  public get startMinSize(): string | undefined {
    return this._panes.start.minSize;
  }

  /**
   * The minimum size of the end pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `100px` or `20%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 removes the constraint.
   * @attr end-min-size
   */
  @property({ attribute: 'end-min-size' })
  public set endMinSize(value: string | undefined) {
    this._panes.end.minSize = normalizeValue(value);
  }

  public get endMinSize(): string | undefined {
    return this._panes.end.minSize;
  }

  /**
   * The maximum size of the start pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `500px` or `80%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 removes the constraint.
   * @attr start-max-size
   */
  @property({ attribute: 'start-max-size' })
  public set startMaxSize(value: string | undefined) {
    this._panes.start.maxSize = normalizeValue(value);
  }

  public get startMaxSize(): string | undefined {
    return this._panes.start.maxSize;
  }

  /**
   * The maximum size of the end pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `500px` or `80%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 removes the constraint.
   * @attr end-max-size
   */
  @property({ attribute: 'end-max-size' })
  public set endMaxSize(value: string | undefined) {
    this._panes.end.maxSize = normalizeValue(value);
  }

  public get endMaxSize(): string | undefined {
    return this._panes.end.maxSize;
  }

  /**
   * The size of the start pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `200px` or `50%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 falls back to automatic sizing.
   * @attr start-size
   */
  @property({ attribute: 'start-size' })
  public set startSize(value: string | undefined) {
    this._setPaneSize('start', value);
  }

  public get startSize(): string | undefined {
    return this._panes.start.size;
  }

  /**
   * The size of the end pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `200px` or `50%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 falls back to automatic sizing.
   * @attr end-size
   */
  @property({ attribute: 'end-size' })
  public set endSize(value: string | undefined) {
    this._setPaneSize('end', value);
  }

  public get endSize(): string | undefined {
    return this._panes.end.size;
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

    addResizeObserverController(this, {
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
    this._clearMeasurement();

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
    this._clearMeasurement();
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

  /** A cancelled gesture reverts, but still reports an end for the start it emitted. */
  private _handleEndDrag(e: PointerEvent): void {
    if (e.pointerId !== this._resizeState.dragPointerId) {
      return;
    }

    this._resizeEnd(e.type === 'pointercancel' ? 0 : this._getDragDelta(e));
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
    const previous = this._collapsedPane;

    if (previous === null && target !== null) {
      this._savePaneSizes();
    }

    this._collapsedPane = target;

    // This path skips the decorated accessors and can change both flags,
    // so request an update for both.
    for (const pane of PANES) {
      const state = this._panes[pane];

      this.requestUpdate(`${pane}Collapsed`, previous === pane);
      this._internals.setState(`${pane}-collapsed`, target === pane);
      state.size = target !== null ? 'auto' : (state.savedSize ?? state.size);
    }
  }

  private _setPaneSize(pane: PanePosition, value: string | undefined): void {
    this._panes[pane].size = normalizeValue(value, 'auto');

    // A size set while collapsed wins over the saved sizes. Drop both, or the
    // saved share of the other pane over-subscribes the container.
    if (this._collapsedPane !== null) {
      for (const target of PANES) {
        this._panes[target].savedSize = undefined;
      }
    }
  }

  /** Drops the authored sizes and their attributes, which would otherwise diverge. */
  private _resetPaneSizes(): void {
    for (const pane of PANES) {
      const state = this._panes[pane];
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
    // Not measurable before the first render, so keep the authored sizes.
    if (this._getTotalSize() === 0) {
      this._panes.start.savedSize = this._panes.start.size;
      this._panes.end.savedSize = this._panes.end.size;
      return;
    }
    // Higher precision than the ARIA percent so restored layouts don't drift.
    const [start, end] = this._rectSize();
    this._panes.start.savedSize = `${this._asPercentOfContainer(start, 2)}%`;
    this._panes.end.savedSize = `${this._asPercentOfContainer(end, 2)}%`;
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

    const dragged = this._isDragging
      ? this._resizeState.draggedStartSize
      : undefined;

    return this._asPercentOfContainer(dragged ?? this._rectSize()[0]);
  }

  private _getMinMaxAsPercent(type: 'min' | 'max'): number {
    const size = this._getConstraintInPx('start', type);

    if (size === undefined) {
      return type === 'min' ? 0 : 100;
    }

    return this._asPercentOfContainer(size);
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

  private _handleResizePanes(
    direction: -1 | 1,
    validOrientation: SplitterOrientation
  ): void {
    if (this._resizeDisallowed || this.orientation !== validOrientation) {
      return;
    }
    this._runResize(
      this._resolveDelta(KEYBOARD_RESIZE_STEP, KEYBOARD_RESIZE_STEP) * direction
    );
  }

  /**
   * Runs a full resize for a keyboard gesture. It shares `_calcNewSizes` with
   * the drag path, so the emitted sizes equal the rendered ones.
   */
  private _runResize(delta: number): void {
    this._resizeStart();
    this._resizing(delta);
    this._resizeEnd(delta);
    this._endDrag();
  }

  private _resolveDelta(deltaX: number, deltaY: number): number {
    const isHorizontal = this._isHorizontal;
    const rtlMultiplier = isHorizontal && !isLTR(this) ? -1 : 1;
    const delta = isHorizontal ? deltaX : deltaY;
    return delta * rtlMultiplier;
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
    this.toggle(this._collapsedPane === other ? other : pane);
    this._emitLayoutChanged();
  }

  // While collapsed, both sizes render as 'auto', so report the saved sizes.
  private _reportedSize(pane: PanePosition): string {
    const state = this._panes[pane];
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

    this._resizeState.draggedStartSize = undefined;

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
    const authored = this._panes[pane].size;

    return {
      initialSize: size,
      isPercentageBased: authored === 'auto' || !!authored?.includes('%'),
      minSizePx: this._resolveConstraint(pane, 'min'),
      maxSizePx: this._resolveConstraint(pane, 'max'),
    };
  }

  /** The constraint in pixels, from the drag snapshot while dragging. */
  private _getConstraintInPx(
    pane: PanePosition,
    type: 'min' | 'max'
  ): number | undefined {
    const { startPane, endPane } = this._resizeState;
    const snapshot = pane === 'start' ? startPane : endPane;

    if (this._isDragging && snapshot) {
      return type === 'max' ? snapshot.maxSizePx : snapshot.minSizePx;
    }

    return this._resolveConstraint(pane, type);
  }

  private _resolveConstraint(
    pane: PanePosition,
    type: 'min' | 'max'
  ): number | undefined {
    const { minSize, maxSize } = this._panes[pane];
    const value = type === 'max' ? maxSize : minSize;

    return value ? this._toPixels(value) : undefined;
  }

  private _resizing(delta: number): void {
    const { startPane, endPane } = this._resizeState;

    if (!startPane || !endPane) {
      return;
    }

    const [startPaneSize, endPaneSize] = this._calcNewSizes(
      delta,
      startPane,
      endPane
    );

    this._resizeState.draggedStartSize = startPaneSize;
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
        : this._calcNewSizes(delta, startPane, endPane);
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

  private _calcNewSizes(
    delta: number,
    start: PaneResizeSnapshot,
    end: PaneResizeSnapshot
  ): [number, number] {
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
   * Reads the container and bar extents once per update pass. The style writes
   * between the reads would force a reflow for each read.
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

  /** A drag move resizes only the panes, so it keeps the measurements. */
  private _clearMeasurement(): void {
    if (!this._isDragging) {
      this._measurement = null;
    }
  }

  private _handleContainerResize(): void {
    this._measurement = null;
    const size = this._getContainerSize();

    if (size !== this._observedSize) {
      this._observedSize = size;
      this.requestUpdate();
    }
  }

  /**
   * Writes the flex and size constraints of both panes. A collapsed pane
   * renders as `auto` without constraints; the authored values stay for the expand.
   */
  private _updatePanes(): void {
    const collapsed = this._collapsedPane !== null;
    const overflow = !collapsed && this._minSizesOverflow();
    const [min, max, crossMin, crossMax] = this._isHorizontal
      ? ['minWidth', 'maxWidth', 'minHeight', 'maxHeight']
      : ['minHeight', 'maxHeight', 'minWidth', 'maxWidth'];

    for (const pane of PANES) {
      const { size, minSize, maxSize, styles } = this._panes[pane];
      const auto = collapsed || size === 'auto';

      Object.assign(styles, {
        flex: auto ? '1 1 0px' : `0 1 ${size}`,
        [min]: (!collapsed && !overflow && minSize) || 0,
        [max]: (!collapsed && maxSize) || '100%',
        [crossMin]: 0,
        [crossMax]: '100%',
      });
    }
  }

  /**
   * Whether both minimums do not fit the container. Then neither applies, to
   * prevent overflow, until the container grows.
   */
  private _minSizesOverflow(): boolean {
    if (!(this._panes.start.minSize || this._panes.end.minSize)) {
      return false;
    }

    const total = this._getTotalSize();

    return (
      total > 0 &&
      (this._getConstraintInPx('start', 'min') ?? 0) +
        (this._getConstraintInPx('end', 'min') ?? 0) >
        total
    );
  }

  private _handleExpanderClick(pane: PanePosition, event: PointerEvent): void {
    // Keep the bar from starting a resize
    event.stopPropagation();
    this._handleExpanderAction(pane);
  }

  //#endregion

  //#region Rendering

  private _renderBarControls() {
    const hidden = this.disableCollapse || this.hideCollapseButtons;
    const expander = (pane: PanePosition) => {
      const other = this._otherPane(pane);
      const otherCollapsed = this._isCollapsed(other);
      const part = partMap({
        [`${other}-expand-btn`]: otherCollapsed,
        [`${pane}-collapse-btn`]: !otherCollapsed,
      });

      return html`
        <div
          part=${part}
          ?hidden=${hidden || this._isCollapsed(pane)}
          @pointerdown=${(e: PointerEvent) =>
            this._handleExpanderClick(pane, e)}
        ></div>
      `;
    };

    return html`
      ${expander('start')}
      <div
        part="drag-handle"
        ?hidden=${this.hideDragHandle || this.disableResize}
      ></div>
      ${expander('end')}
    `;
  }

  private _renderSeparator() {
    const canResize = !this._resizeDisallowed;

    return html`
      <div
        ${ref(this._separatorRef)}
        ${ariaBindings(hostAria(this, { fallback: 'Resize panes' }))}
        part="splitter-bar"
        role="separator"
        tabindex=${this.disableCollapse && this.disableResize ? -1 : 0}
        aria-controls="start-pane end-pane"
        aria-orientation=${this.orientation}
        style=${styleMap({ '--cursor': this._separatorCursor })}
        @touchstart=${bindIf(canResize, preventDefault)}
        @contextmenu=${bindIf(canResize, preventDefault)}
        @pointerdown=${bindIf(canResize, this._handleBarPointerDown)}
        @pointermove=${this._handleBarPointerMove}
        @pointerup=${this._handleEndDrag}
        @lostpointercapture=${this._handleEndDrag}
        @pointercancel=${this._handleEndDrag}
      >
        ${this._renderBarControls()}
      </div>
    `;
  }

  protected override render() {
    return html`
      <div part="base">
        <div
          part="start-pane"
          id="start-pane"
          style=${styleMap(this._panes.start.styles)}
        >
          <slot name="start"></slot>
        </div>
        ${this._renderSeparator()}
        <div
          part="end-pane"
          id="end-pane"
          style=${styleMap(this._panes.end.styles)}
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
