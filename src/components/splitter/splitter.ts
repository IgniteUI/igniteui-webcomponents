import { html, LitElement, type PropertyValues } from 'lit';
import { eventOptions, property, query, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { addInternalsController } from '../common/controllers/internals.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
  endKey,
  homeKey,
} from '../common/controllers/key-bindings.js';
import { createResizeObserverController } from '../common/controllers/resize-observer.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import {
  asNumber,
  asPercent,
  bindIf,
  clamp,
  isLTR,
  roundPrecise,
} from '../common/util.js';
import type { SplitterOrientation } from '../types.js';
import IgcVisuallyHiddenComponent from '../visually-hidden/visually-hidden.js';
import { styles as shared } from './themes/shared/splitter.common.css.js';
import { styles } from './themes/splitter.base.css.js';
import { all } from './themes/themes.js';
import type {
  IgcSplitterComponentEventMap,
  IgcSplitterResizeEventDetail,
  PanePosition,
  PaneResizeSnapshot,
  SplitterPaneState,
  SplitterResizeState,
} from './types.js';

const KEYBOARD_RESIZE_STEP = 10;

const DEFAULT_RESIZE_STATE: SplitterResizeState = {
  startPane: null,
  endPane: null,
  isDragging: false,
  dragStartPosition: { x: 0, y: 0 },
  dragPointerId: -1,
};

/**
 * The `igc-splitter` component provides a resizable split-pane layout that divides the view
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

  private _startPaneState: SplitterPaneState = { size: 'auto', styles: {} };
  private _endPaneState: SplitterPaneState = { size: 'auto', styles: {} };

  @state()
  private _collapsedPane: PanePosition | null = null;

  @state()
  private _resizeState: SplitterResizeState = { ...DEFAULT_RESIZE_STATE };

  @query('[part~="base"]', true)
  private readonly _base!: HTMLElement;

  @query('[part~="start-pane"]', true)
  private readonly _startPane!: HTMLElement;

  @query('[part~="end-pane"]', true)
  private readonly _endPane!: HTMLElement;

  private get _separator(): HTMLElement | undefined {
    return this._separatorRef.value;
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
   * @attr orientation
   * @default 'horizontal'
   */
  @property({ reflect: true })
  public orientation: SplitterOrientation = 'horizontal';

  /**
   * When true, prevents the user from collapsing either pane.
   * This also hides the expand/collapse buttons on the splitter bar.
   *
   * @attr disable-collapse
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-collapse' })
  public disableCollapse = false;

  /**
   * When true, prevents the user from resizing the panes by dragging the splitter bar or using keyboard shortcuts.
   * This also hides the drag handle on the splitter bar.
   *
   * @attr disable-resize
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-resize' })
  public disableResize = false;

  /**
   * When true, hides the expand/collapse buttons on the splitter bar.
   *
   * Note that the buttons will also be hidden if `disable-collapse` is true or
   * if a pane is currently collapsed.
   *
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
   * When true, hides the drag handle on the splitter bar.
   *
   * Note that the drag handle will also be hidden if `disable-resize` is true.
   *
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
   * @attr start-size
   */
  @property({ attribute: 'start-size' })
  public set startSize(value: string | undefined) {
    this._startPaneState.size = this._normalizeValue(value, 'auto');
  }

  public get startSize(): string | undefined {
    return this._startPaneState.size;
  }

  /**
   * The size of the end pane.
   *
   * @attr end-size
   */
  @property({ attribute: 'end-size' })
  public set endSize(value: string | undefined) {
    this._endPaneState.size = this._normalizeValue(value, 'auto');
  }

  public get endSize(): string | undefined {
    return this._endPaneState.size;
  }

  //#endregion

  //#region Lifecycle

  constructor() {
    super();

    addThemingController(this, all);

    addSlotController(this, { slots: setSlots('start', 'end') });

    createResizeObserverController(this, {
      callback: () => this.requestUpdate(),
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
    if (changed.get('orientation') != null) {
      for (const pane of ['start', 'end'] as PanePosition[]) {
        const state = this._getPaneState(pane);
        state.size = 'auto';
        state.minSize = undefined;
        state.maxSize = undefined;
      }
    }

    if (this.hasUpdated) {
      this._updatePanes();
    }

    super.update(changed);
  }

  protected override updated(): void {
    this._updateBarAria();
  }

  //#endregion

  //#region Resize Event Handlers

  private _handleBarPointerDown(e: PointerEvent): void {
    if (e.button !== 0) {
      return;
    }

    e.preventDefault();

    this._resizeState = {
      ...this._resizeState,
      isDragging: true,
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

    const delta = this._getDragDelta(e);

    if (delta !== 0) {
      this._resizeEnd(delta);
    }

    this._endDrag();
  }

  private _endDrag(): void {
    if (this._resizeState.dragPointerId !== -1) {
      this._separator?.releasePointerCapture(this._resizeState.dragPointerId);
    }
    this._resizeState = { ...DEFAULT_RESIZE_STATE };
  }

  //#endregion

  //#region Public Methods

  /** Toggles the collapsed state of the specified pane. */
  public toggle(position: PanePosition): void {
    if (this._collapsedPane === null) {
      this._savePaneSizes();
    }

    // If the requested pane is already collapsed, expand it (set to null)
    // Otherwise, collapse the requested pane (this also handles switching from one collapsed pane to another)
    this._collapsedPane = this._collapsedPane === position ? null : position;

    this._internals.setState('start-collapsed', this._isCollapsed('start'));
    this._internals.setState('end-collapsed', this._isCollapsed('end'));

    this._restoreSizesOnExpandCollapse();
  }

  //#endregion

  //#region Internal API

  private _savePaneSizes(): void {
    this._startPaneState.savedSize = `${this._paneRectAsPercent(0)}%`;
    this._endPaneState.savedSize = `${this._paneRectAsPercent(1)}%`;
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

  /** Measures the actual rendered size of a pane and returns it as a percentage of total size. */
  private _paneRectAsPercent(paneIndex: 0 | 1): number {
    const totalSize = this._getTotalSize();
    if (totalSize === 0) {
      return 0;
    }
    return roundPrecise(asPercent(this._rectSize()[paneIndex], totalSize), 0);
  }

  /** Converts a CSS size string (px or %) to a percentage of total size. */
  private _sizeToPercent(sizeValue: string): number {
    const totalSize = this._getTotalSize();
    if (totalSize === 0) {
      return 0;
    }

    if (sizeValue.includes('%')) {
      return asNumber(sizeValue);
    }

    const pxValue = asNumber(sizeValue);
    return roundPrecise(asPercent(pxValue, totalSize), 0);
  }

  private _getStartPaneSizePercent(): number {
    if (!this._startPane || this._isCollapsed('start')) {
      return 0;
    }

    if (this._isCollapsed('end')) {
      return 100;
    }

    return this._paneRectAsPercent(0);
  }

  private _getMinMaxAsPercent(type: 'min' | 'max'): number {
    const value = type === 'min' ? this.startMinSize : this.startMaxSize;
    const defaultValue = type === 'min' ? 0 : 100;

    return value ? this._sizeToPercent(value) : defaultValue;
  }

  private _isCollapsed(which: PanePosition): boolean {
    return this._collapsedPane === which;
  }

  private _updateBarAria(): void {
    if (this._separator) {
      this._separator.ariaValueNow = this._getStartPaneSizePercent().toString();
      this._separator.ariaValueMin = this._getMinMaxAsPercent('min').toString();
      this._separator.ariaValueMax = this._getMinMaxAsPercent('max').toString();
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
    if (!trimmed || trimmed === 'auto') {
      return fallback;
    }

    const numericValue = asNumber(trimmed, -1);
    if (numericValue < 0) return fallback;
    if (trimmed.includes('%') && numericValue > 100) return fallback;

    return trimmed;
  }

  private _getFlex(which: PanePosition): string {
    const isAuto = this._isAutoSize(which);
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

    this._resizeStart();
    this._resizing(delta);
    this._resizeEnd(delta);
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

  private _handleMinMaxResize(type: 'min' | 'max'): void {
    if (this._resizeDisallowed) {
      return;
    }

    const totalSize = this._getTotalSize();
    const boundaryValue =
      type === 'min' ? this.startMinSize : this.startMaxSize;
    const isPercentage = boundaryValue
      ? boundaryValue.includes('%')
      : type === 'max';

    const targetStartSizePx =
      this._setMinMaxInPx('start', type) ?? (type === 'min' ? 0 : totalSize);
    const targetEndSizePx = totalSize - targetStartSizePx;

    if (isPercentage) {
      this.startSize = `${roundPrecise(asPercent(targetStartSizePx, totalSize), 2)}%`;
      this.endSize = `${roundPrecise(asPercent(targetEndSizePx, totalSize), 2)}%`;
    } else {
      this.startSize = `${targetStartSizePx}px`;
      this.endSize = `${targetEndSizePx}px`;
    }
  }

  private _handleExpanderAction(pane: PanePosition): void {
    const other: PanePosition = pane === 'start' ? 'end' : 'start';
    this.toggle(this._collapsedPane === other ? other : pane);
  }

  private _handleArrowsExpandCollapse(
    target: PanePosition,
    validOrientation: SplitterOrientation
  ): void {
    if (this.disableCollapse || this.orientation !== validOrientation) {
      return;
    }
    const effectiveTarget: PanePosition =
      validOrientation === 'horizontal' && !isLTR(this)
        ? target === 'start'
          ? 'end'
          : 'start'
        : target;
    this._handleExpanderAction(effectiveTarget);
  }

  private _resizeStart(): void {
    const [startSize, endSize] = this._rectSize();
    const totalSize = this._getTotalSize();

    this._resizeState.startPane = this._createPaneState(
      'start',
      startSize,
      totalSize
    );
    this._resizeState.endPane = this._createPaneState(
      'end',
      endSize,
      totalSize
    );

    this.emitEvent('igcResizeStart', {
      detail: { startPanelSize: startSize, endPanelSize: endSize },
    });
  }

  private _createPaneState(
    pane: PanePosition,
    size: number,
    totalSize?: number
  ): PaneResizeSnapshot {
    return {
      initialSize: size,
      isPercentageBased: this._isPercentageSize(pane) || this._isAutoSize(pane),
      minSizePx: this._setMinMaxInPx(pane, 'min', totalSize),
      maxSizePx: this._setMinMaxInPx(pane, 'max', totalSize),
    };
  }

  private _setMinMaxInPx(
    pane: PanePosition,
    type: 'min' | 'max',
    totalSize?: number
  ): number | undefined {
    const paneState = this._getPaneState(pane);
    const value = type === 'max' ? paneState.maxSize : paneState.minSize;
    const valueAsNumber = asNumber(value);

    if (!value) {
      return undefined;
    }

    return value.includes('%')
      ? (valueAsNumber / 100) * (totalSize ?? this._getTotalSize())
      : valueAsNumber;
  }

  private _resizing(delta: number): void {
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
    totalSize: number
  ): string {
    return pane.isPercentageBased
      ? `${asPercent(paneSize, totalSize)}%`
      : `${roundPrecise(paneSize, 0)}px`;
  }

  private _resizeEnd(delta: number): void {
    if (!this._resizeState.startPane || !this._resizeState.endPane) {
      return;
    }

    const [startPaneSize, endPaneSize] = this._calcNewSizes(delta);
    const totalSize = this._getTotalSize();

    this.startSize = this._computeSize(
      this._resizeState.startPane,
      startPaneSize,
      totalSize
    );
    this.endSize = this._computeSize(
      this._resizeState.endPane,
      endPaneSize,
      totalSize
    );

    this.emitEvent('igcResizeEnd', {
      detail: {
        startPanelSize: startPaneSize,
        endPanelSize: endPaneSize,
        delta,
      },
    });
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

  private _getTotalSize(): number {
    if (!this._base) {
      return 0;
    }

    const axis = this._isHorizontal ? 'width' : 'height';
    const barSize = this._separator
      ? roundPrecise(this._separator.getBoundingClientRect()[axis])
      : 0;

    const rect = this._base.getBoundingClientRect();
    const size = rect[axis];
    return size - barSize;
  }

  private _updatePanes(): void {
    const totalSize = this._getTotalSize();
    const isCollapsed = this._collapsedPane !== null;

    for (const pane of ['start', 'end'] as PanePosition[]) {
      const state = this._getPaneState(pane);
      if (isCollapsed) {
        state.size = 'auto';
        state.minSize = undefined;
        state.maxSize = undefined;
      }
      this._setPaneMinMaxSizes(
        pane,
        isCollapsed ? '0' : state.minSize,
        isCollapsed ? '100%' : state.maxSize,
        totalSize
      );
      this._updatePaneStyles(pane, { flex: this._getFlex(pane) });
    }
  }

  private _updatePaneStyles(pane: PanePosition, styles: StyleInfo): void {
    Object.assign(this._getPaneState(pane).styles, styles);
  }

  private _setPaneMinMaxSizes(
    pane: PanePosition,
    minSize?: string,
    maxSize?: string,
    totalSize?: number
  ): void {
    const min =
      this._ensureMinConstraintIsWithinBounds(pane, minSize, totalSize) ?? 0;
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
    minSize?: string,
    totalSize?: number
  ): string | undefined {
    const total = totalSize ?? this._getTotalSize();

    if (minSize && total > 0) {
      const minPx = this._setMinMaxInPx(pane, 'min', total) ?? 0;
      const other: PanePosition = pane === 'start' ? 'end' : 'start';
      const otherMinPx = this._getPaneState(other).minSize
        ? (this._setMinMaxInPx(other, 'min', total) ?? 0)
        : 0;

      // Ignore constraint if it exceeds total or combined exceeds total to prevent content overflow
      // Once container grows to accommodate the constraint, it will be applied
      if (minPx > total || minPx + otherMinPx > total) {
        return undefined;
      }
    }
    return minSize;
  }

  private _handleExpanderClick(pane: PanePosition, event: PointerEvent): void {
    // Prevent resize action being initiated
    event.stopPropagation();
    this._handleExpanderAction(pane);
  }

  //#endregion

  //#region Rendering

  private _resolvePartNames(expander: PanePosition): Record<string, boolean> {
    const other: PanePosition = expander === 'start' ? 'end' : 'start';
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
      <igc-visually-hidden id="splitter-label">
        ${this._isCollapsed('start')
          ? 'Start pane collapsed'
          : 'Start pane expanded'}
        and
        ${this._isCollapsed('end') ? 'End pane collapsed' : 'End pane expanded'}
      </igc-visually-hidden>
    `;
  }

  private _renderSeparator() {
    const isDragging = this._resizeState.isDragging;
    const canResize = !this._resizeDisallowed;

    return html`
      <div
        ${ref(this._separatorRef)}
        part="splitter-bar"
        role="separator"
        tabindex=${this.disableCollapse && this.disableResize ? -1 : 0}
        aria-controls="start-pane end-pane"
        aria-labelledby="splitter-label"
        aria-orientation=${this.orientation}
        style=${styleMap({ '--cursor': this._separatorCursor })}
        @touchstart=${bindIf(canResize, this._preventDefaultForEvent)}
        @contextmenu=${bindIf(canResize, this._preventDefaultForEvent)}
        @pointerdown=${bindIf(canResize, this._handleBarPointerDown)}
        @pointermove=${bindIf(isDragging, this._handleBarPointerMove)}
        @pointerup=${bindIf(isDragging, this._handleEndDrag)}
        @lostpointercapture=${bindIf(isDragging, this._handleEndDrag)}
        @pointercancel=${bindIf(isDragging, this._endDrag)}
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

export type { IgcSplitterComponentEventMap, IgcSplitterResizeEventDetail };

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter': IgcSplitterComponent;
  }
}
