import { SplitterResourceStringsEN } from 'igniteui-i18n-core';
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
import {
  type CoercedPropertyConfig,
  coercedProperty,
} from '#internals/decorators/coerced-property.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { HostAriaMixin } from '#internals/mixins/host-aria.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
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
import { all } from '#themes/splitter/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import type { SplitterOrientation } from '../types.js';
import { styles as shared } from './themes/shared/splitter.common.css.js';
import { styles } from './themes/splitter.base.css.js';
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

const CSS_LENGTH =
  /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(%|px|em|rem|ch|ex|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|cm|mm|q|in|pt|pc)?$/i;

/** `value` when it is a valid CSS length or percentage. */
function normalizeValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim() ?? '';
  const match = CSS_LENGTH.exec(trimmed);

  if (!match) {
    return undefined;
  }

  const [, unit] = match;
  const size = Number.parseFloat(trimmed);

  // Only zero needs no unit. Another bare number is invalid CSS and drops
  // the whole `flex` shorthand.
  return (unit || size === 0) && size >= 0 && !(unit === '%' && size > 100)
    ? trimmed
    : undefined;
}

const constraint: CoercedPropertyConfig<string | undefined, object> = {
  transform: ({ value }) => normalizeValue(value),
};

const DEFAULT_RESIZE_STATE: SplitterResizeState = {
  startPane: null,
  endPane: null,
  dragStartPosition: { x: 0, y: 0 },
  dragPointerId: -1,
};

const i18n = {
  defaultEN: SplitterResourceStringsEN,
};

/**
 * A splitter component that provides a resizable split-pane layout, dividing the view
 * into two panels - *start* and *end* - separated by a draggable bar.
 *
 * Panels can be resized by dragging the bar, using keyboard shortcuts, or collapsed/expanded
 * using the built-in collapse buttons or the programmatic `toggle()` API.
 * Nested splitters are supported for more complex layouts.
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
 * | `Ctrl + Arrow Left` / `Ctrl + Arrow Up` | Expand the end pane if it is collapsed, else toggle the start pane |
 * | `Ctrl + Arrow Right` / `Ctrl + Arrow Down` | Expand the start pane if it is collapsed, else toggle the end pane |
 *
 * In a right-to-left context, `Arrow Left` and `Arrow Right` swap their actions.
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
 * @element igc-splitter
 *
 * @fires igcResizeStart - Emitted once when a resize operation begins (pointer drag or keyboard).
 * @fires igcResizing - Emitted continuously while a pane is being resized.
 * @fires igcResizeEnd - Emitted once when a resize operation completes.
 * @fires igcLayoutChanged - Emitted after a user-driven resize or expansion change, with a full
 * snapshot of the current layout (pane sizes and collapsed states).
 *
 * @slot start - Content projected into the start panel, at the inline start or the top.
 * @slot end - Content projected into the end panel, at the inline end or the bottom.
 *
 * @csspart base - The container of the panels and the splitter bar.
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
 *
 * @cssstate start-collapsed - Set while the start pane is collapsed.
 * @cssstate end-collapsed - Set while the end pane is collapsed.
 */
export default class IgcSplitterComponent extends I18nMixin(
  EventEmitterMixin<IgcSplitterComponentEventMap>(HostAriaMixin(LitElement)),
  i18n
) {
  public static readonly tagName = 'igc-splitter';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcSplitterComponent);
  }

  //#region Private Properties

  private readonly _internals = addInternalsController(this);

  private readonly _separatorRef = createRef<HTMLElement>();

  private readonly _panes: Record<PanePosition, SplitterPaneState> = {
    start: { size: 'auto', authoredSize: 'auto', styles: {} },
    end: { size: 'auto', authoredSize: 'auto', styles: {} },
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

  /** `-1` when the panes run right to left, else `1`. */
  private get _rtlSign(): -1 | 1 {
    return this._isHorizontal && !isLTR(this) ? -1 : 1;
  }

  //#endregion

  //#region Public Properties

  /**
   * The orientation of the splitter, which determines the direction of resizing and collapsing.
   *
   * Changing the orientation after the initial render returns the panes to the
   * sizes set through `startSize` and `endSize`, or to automatic sizing. The
   * sizes from a drag, a key press or a collapse were measured on the other
   * axis, so they are dropped. The minimum and maximum sizes stay.
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
   * The buttons are also hidden when `disable-collapse` is true. While a pane
   * is collapsed, only its expand button shows.
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
   * The drag handle is also hidden when `disable-resize` is true.
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
  @coercedProperty(constraint)
  public startMinSize?: string = undefined;

  /**
   * The minimum size of the end pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `100px` or `20%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 removes the constraint.
   * @attr end-min-size
   */
  @property({ attribute: 'end-min-size' })
  @coercedProperty(constraint)
  public endMinSize?: string = undefined;

  /**
   * The maximum size of the start pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `500px` or `80%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 removes the constraint.
   * @attr start-max-size
   */
  @property({ attribute: 'start-max-size' })
  @coercedProperty(constraint)
  public startMaxSize?: string = undefined;

  /**
   * The maximum size of the end pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `500px` or `80%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 removes the constraint.
   * @attr end-max-size
   */
  @property({ attribute: 'end-max-size' })
  @coercedProperty(constraint)
  public endMaxSize?: string = undefined;

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

    const keys = addKeybindings(this, { ref: this._separatorRef })
      .set(homeKey, () => this._handleMinMaxResize('min'))
      .set(endKey, () => this._handleMinMaxResize('max'));

    for (const [key, direction, orientation] of [
      [arrowUp, -1, 'vertical'],
      [arrowDown, 1, 'vertical'],
      [arrowLeft, -1, 'horizontal'],
      [arrowRight, 1, 'horizontal'],
    ] as const) {
      keys
        .set(key, () => this._handleResizePanes(direction, orientation))
        .set([ctrlKey, key], () =>
          this._handleArrowsExpandCollapse(direction, orientation)
        );
    }
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    const previous = changed.get('orientation');

    if (
      this.hasUpdated &&
      changed.has('orientation') &&
      (previous === 'horizontal') !== this._isHorizontal
    ) {
      // A drag measured on the old axis. Cancel it, as `pointercancel` does.
      if (this._isDragging) {
        this._resizeEnd(0);
        this._endDrag();
      }
      this._restoreAuthoredSizes();
    }
  }

  protected override update(changed: PropertyValues<this>): void {
    this._clearMeasurement();
    this._updatePanes();
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

  //#region Event Handlers

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

  private _handleContainerResize(): void {
    this._measurement = null;
    const size = this._getContainerSize();

    if (size !== this._observedSize) {
      this._observedSize = size;
      this.requestUpdate();
    }
  }

  private _handleResizePanes(
    direction: -1 | 1,
    validOrientation: SplitterOrientation
  ): void {
    if (this._resizeDisallowed || this.orientation !== validOrientation) {
      return;
    }
    this._runResize(KEYBOARD_RESIZE_STEP * direction * this._rtlSign);
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

  private _handleArrowsExpandCollapse(
    direction: -1 | 1,
    validOrientation: SplitterOrientation
  ): void {
    if (this.disableCollapse || this.orientation !== validOrientation) {
      return;
    }
    this._handleExpanderAction(direction * this._rtlSign < 0 ? 'start' : 'end');
  }

  private _handleExpanderClick(pane: PanePosition, event: PointerEvent): void {
    // Keep the bar from starting a resize
    event.stopPropagation();
    this._handleExpanderAction(pane);
  }

  private _handleExpanderAction(pane: PanePosition): void {
    const other = this._otherPane(pane);
    this.toggle(this._collapsedPane === other ? other : pane);
    this._emitLayoutChanged();
  }

  //#endregion

  //#region Internal API

  private _getDragDelta(e: PointerEvent): number {
    const deltaX = e.clientX - this._resizeState.dragStartPosition.x;
    const deltaY = e.clientY - this._resizeState.dragStartPosition.y;
    return this._resolveDelta(deltaX, deltaY);
  }

  private _endDrag(): void {
    const { dragPointerId } = this._resizeState;

    // `releasePointerCapture` throws for a pointer that is no longer active.
    if (this._separator?.hasPointerCapture(dragPointerId)) {
      this._separator.releasePointerCapture(dragPointerId);
    }

    this._resizeState = { ...DEFAULT_RESIZE_STATE };
  }

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
    const state = this._panes[pane];
    state.size = normalizeValue(value) ?? 'auto';
    state.authoredSize = state.size;

    // A size set while collapsed wins over the saved sizes. Drop both, or the
    // saved share of the other pane over-subscribes the container.
    if (this._collapsedPane !== null) {
      for (const target of PANES) {
        this._panes[target].savedSize = undefined;
      }
    }
  }

  /** Writes the rendered sizes. The authored sizes stay. */
  private _setSizes(...sizes: [string, string]): void {
    PANES.forEach((pane, i) => {
      const previous = this._panes[pane].size;
      this._panes[pane].size = sizes[i];
      this.requestUpdate(`${pane}Size`, previous);
    });
  }

  /**
   * Drops the sizes that a drag, a key press or a collapse measured on the old
   * axis. A collapsed pane expands to its authored size.
   */
  private _restoreAuthoredSizes(): void {
    const { start, end } = this._panes;

    if (this._collapsedPane === null) {
      this._setSizes(start.authoredSize, end.authoredSize);
    } else {
      start.savedSize = start.authoredSize;
      end.savedSize = end.authoredSize;
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
    const sizes = this._getTotalSize() === 0 ? null : this._rectSize();

    PANES.forEach((pane, i) => {
      const state = this._panes[pane];
      // Higher precision than the ARIA percent so restored layouts don't drift.
      state.savedSize = sizes
        ? `${this._asPercentOfContainer(sizes[i], 2)}%`
        : state.size;
    });
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
    return (this._isHorizontal ? deltaX : deltaY) * this._rtlSign;
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

  private _resizeStart(): void {
    const [startSize, endSize] = this._rectSize();

    this._resizeState.draggedStartSize = undefined;
    this._resizeState.minSizesDropped = this._minSizesOverflow();

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
    const current = this._panes[pane].size;

    return {
      initialSize: size,
      isPercentageBased: current === 'auto' || current.includes('%'),
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

  private _constraint(
    pane: PanePosition,
    type: 'min' | 'max'
  ): string | undefined {
    return this[`${pane}${type === 'min' ? 'Min' : 'Max'}Size` as const];
  }

  private _resolveConstraint(
    pane: PanePosition,
    type: 'min' | 'max'
  ): number | undefined {
    const value = this._constraint(pane, type);
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
    this._setSizes(`${startPaneSize}px`, `${endPaneSize}px`);

    this.emitEvent('igcResizing', {
      detail: {
        startPanelSize: startPaneSize,
        endPanelSize: endPaneSize,
        delta,
      },
    });
  }

  private _computeSize(pane: PaneResizeSnapshot, paneSize: number): string {
    return pane.isPercentageBased
      ? `${asPercent(paneSize, this._getContainerSize())}%`
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

    this._setSizes(
      this._computeSize(startPane, startPaneSize),
      this._computeSize(endPane, endPaneSize)
    );

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
    // The minimums that do not render do not limit the resize either.
    const dropped = this._resizeState.minSizesDropped;
    const minStart = (!dropped && start.minSizePx) || 0;
    const minEnd = (!dropped && end.minSizePx) || 0;
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
    // Conflicting constraints leave bounds that do not overlap: no room to move.
    const finalDelta =
      maxPosDelta < -maxNegDelta ? 0 : clamp(delta, -maxNegDelta, maxPosDelta);

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

  /** A collapsed pane renders as `auto` without constraints. */
  private _updatePanes(): void {
    const collapsed = this._collapsedPane !== null;
    const overflow = !collapsed && this._minSizesOverflow();
    const [min, max, crossMin, crossMax] = this._isHorizontal
      ? ['minWidth', 'maxWidth', 'minHeight', 'maxHeight']
      : ['minHeight', 'maxHeight', 'minWidth', 'maxWidth'];

    for (const pane of PANES) {
      const { size, styles } = this._panes[pane];
      const auto = collapsed || size === 'auto';

      Object.assign(styles, {
        flex: auto ? '1 1 0px' : `0 1 ${size}`,
        [min]: (!collapsed && !overflow && this._constraint(pane, 'min')) || 0,
        [max]: (!collapsed && this._constraint(pane, 'max')) || '100%',
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
    if (!(this.startMinSize || this.endMinSize)) {
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
        ${ariaBindings(
          hostAria(this, {
            fallback: this.resourceStrings.splitter_resize_panes,
          })
        )}
        part="splitter-bar"
        role="separator"
        tabindex=${this.disableCollapse && this.disableResize ? -1 : 0}
        aria-controls="start-pane end-pane"
        aria-orientation=${this.orientation}
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
