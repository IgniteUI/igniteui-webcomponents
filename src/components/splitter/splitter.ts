import { html, LitElement, type PropertyValues } from 'lit';
import { eventOptions, property, query, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { addThemingController } from '../../theming/theming-controller.js';
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
import { styles as shared } from './themes/shared/splitter.common.css.js';
import { styles } from './themes/splitter.base.css.js';
import { all } from './themes/themes.js';

export interface IgcSplitterResizeEventDetail {
  /** The current size of the start panel in pixels */
  startPanelSize: number;
  /** The current size of the end panel in pixels */
  endPanelSize: number;
  /** The change in size since the resize operation started (only for igcResizing and igcResizeEnd) */
  delta?: number;
}

export interface IgcSplitterComponentEventMap {
  igcResizeStart: CustomEvent<IgcSplitterResizeEventDetail>;
  igcResizing: CustomEvent<IgcSplitterResizeEventDetail>;
  igcResizeEnd: CustomEvent<IgcSplitterResizeEventDetail>;
}

interface PaneResizeSnapshot {
  initialSize: number;
  isPercentageBased: boolean;
  minSizePx?: number;
  maxSizePx?: number;
}

interface SplitterResizeState {
  startPane: PaneResizeSnapshot | null;
  endPane: PaneResizeSnapshot | null;
  isDragging: boolean;
  dragStartPosition: { x: number; y: number };
  dragPointerId: number;
}

const DEFAULT_RESIZE_STATE: SplitterResizeState = {
  startPane: null,
  endPane: null,
  isDragging: false,
  dragStartPosition: { x: 0, y: 0 },
  dragPointerId: -1,
};

interface SplitterPaneState {
  size?: string;
  minSize?: string;
  maxSize?: string;
  savedSize?: string;
}

const DEFAULT_PANE_STATE: SplitterPaneState = {
  size: 'auto',
};

type PanePosition = 'start' | 'end';

/**
 * The Splitter component provides a framework for a simple layout, splitting the view horizontally or vertically
 * into multiple smaller resizable and collapsible areas.
 *
 * @element igc-splitter
 *
 * @fires igcResizeStart - Emitted when resizing starts.
 * @fires igcResizing - Emitted while resizing.
 * @fires igcResizeEnd - Emitted when resizing ends.
 *
 * @slot start - Content for the start pane.
 * @slot end - Content for the end pane.
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
    registerComponent(IgcSplitterComponent);
  }

  //#region Private Properties

  private readonly _barRef = createRef<HTMLElement>();
  private _startPaneInternalStyles: StyleInfo = {};
  private _endPaneInternalStyles: StyleInfo = {};
  private _barInternalStyles: StyleInfo = {};

  @state()
  private _collapsedPane: PanePosition | null = null;

  @state()
  private _startPaneState: SplitterPaneState = { ...DEFAULT_PANE_STATE };

  @state()
  private _endPaneState: SplitterPaneState = { ...DEFAULT_PANE_STATE };

  @state()
  private _resizeState: SplitterResizeState = { ...DEFAULT_RESIZE_STATE };

  @query('[part~="base"]', true)
  private readonly _base!: HTMLElement;

  @query('[part~="start-pane"]', true)
  private readonly _startPane!: HTMLElement;

  @query('[part~="end-pane"]', true)
  private readonly _endPane!: HTMLElement;

  private get _resizeDisallowed() {
    return this.disableResize || this._collapsedPane !== null;
  }

  private get _barCursor(): string {
    if (this._resizeDisallowed) {
      return 'default';
    }
    return this.orientation === 'horizontal' ? 'col-resize' : 'row-resize';
  }

  private get _barTabIndex(): number {
    return this.disableCollapse && this.disableResize ? -1 : 0;
  }

  private get _isStartCollapsed(): boolean {
    return this._collapsedPane === 'start';
  }

  private get _isEndCollapsed(): boolean {
    return this._collapsedPane === 'end';
  }

  //#endregion

  //#region Public Properties

  /** Gets/Sets the orientation of the splitter.
   * @remarks
   * Default value is `horizontal`.
   * @attr
   */
  @property({ reflect: true })
  public orientation: SplitterOrientation = 'horizontal';

  /**
   * Sets whether collapsing the panes is disabled.
   * @remarks
   * Default value is `false`.
   * @attr
   */
  @property({ type: Boolean, attribute: 'disable-collapse', reflect: true })
  public disableCollapse = false;

  /**
   * Sets whether the user can resize the panels by interacting with the splitter bar.
   * @attr
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-resize' })
  public disableResize = false;

  /**
   * Controls the visibility of the expand/collapse buttons on the splitter bar.
   * @remarks
   * Default value is `false`.
   * @attr
   */
  @property({
    type: Boolean,
    attribute: 'hide-collapse-buttons',
    reflect: true,
  })
  public hideCollapseButtons = false;

  /**
   * Controls the visibility of the drag handle on the splitter bar.
   * @remarks
   * Default value is `false`.
   * @attr
   */
  @property({
    type: Boolean,
    attribute: 'hide-drag-handle',
    reflect: true,
  })
  public hideDragHandle = false;

  /**
   * The minimum size of the start pane.
   * @attr
   */
  @property({ attribute: 'start-min-size', reflect: true })
  public get startMinSize(): string | undefined {
    return this._startPaneState.minSize;
  }

  public set startMinSize(value: string | undefined) {
    this._startPaneState = {
      ...this._startPaneState,
      minSize: this._normalizeValue(value),
    };
  }

  /**
   * The minimum size of the end pane.
   * @attr
   */
  @property({ attribute: 'end-min-size', reflect: true })
  public get endMinSize(): string | undefined {
    return this._endPaneState.minSize;
  }

  public set endMinSize(value: string | undefined) {
    this._endPaneState = {
      ...this._endPaneState,
      minSize: this._normalizeValue(value),
    };
  }

  /**
   * The maximum size of the start pane.
   * @attr
   */
  @property({ attribute: 'start-max-size', reflect: true })
  public get startMaxSize(): string | undefined {
    return this._startPaneState.maxSize;
  }

  public set startMaxSize(value: string | undefined) {
    this._startPaneState = {
      ...this._startPaneState,
      maxSize: this._normalizeValue(value),
    };
  }

  /**
   * The maximum size of the end pane.
   * @attr
   */
  @property({ attribute: 'end-max-size', reflect: true })
  public get endMaxSize(): string | undefined {
    return this._endPaneState.maxSize;
  }

  public set endMaxSize(value: string | undefined) {
    this._endPaneState = {
      ...this._endPaneState,
      maxSize: this._normalizeValue(value),
    };
  }

  /**
   * The size of the start pane.
   * @attr
   */
  @property({ attribute: 'start-size', reflect: true })
  public get startSize(): string | undefined {
    return this._startPaneState.size;
  }

  public set startSize(value: string | undefined) {
    this._startPaneState = {
      ...this._startPaneState,
      size: this._normalizeValue(value, 'auto')!,
    };
  }

  /**
   * The size of the end pane.
   * @attr
   */
  @property({ attribute: 'end-size', reflect: true })
  public get endSize(): string | undefined {
    return this._endPaneState.size;
  }

  public set endSize(value: string | undefined) {
    this._endPaneState = {
      ...this._endPaneState,
      size: this._normalizeValue(value, 'auto')!,
    };
  }

  //#endregion

  //#region Lifecycle

  constructor() {
    super();
    addThemingController(this, all);

    addSlotController(this, {
      slots: setSlots('start', 'end'),
    });
    addKeybindings(this, {
      ref: this._barRef,
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

    createResizeObserverController(this, {
      callback: () => this.requestUpdate(),
    });
  }

  protected override update(changed: PropertyValues<this>): void {
    if (
      changed.has('orientation') &&
      changed.get('orientation') !== undefined
    ) {
      this._resetPanes();
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
    this._barRef.value?.setPointerCapture(this._resizeState.dragPointerId);
  }

  private _handleBarPointerMove(e: PointerEvent): void {
    if (e.pointerId !== this._resizeState.dragPointerId) {
      return;
    }

    const deltaX = e.clientX - this._resizeState.dragStartPosition.x;
    const deltaY = e.clientY - this._resizeState.dragStartPosition.y;
    const delta = this._resolveDelta(deltaX, deltaY);

    if (delta !== 0) {
      this._resizing(delta);
    }
  }

  private _handleEndDrag(e: PointerEvent): void {
    if (e.pointerId !== this._resizeState.dragPointerId) {
      return;
    }

    const deltaX = e.clientX - this._resizeState.dragStartPosition.x;
    const deltaY = e.clientY - this._resizeState.dragStartPosition.y;
    const delta = this._resolveDelta(deltaX, deltaY);

    if (delta !== 0) {
      this._resizeEnd(delta);
    }

    this._endDrag();
  }

  private _endDrag(): void {
    if (this._resizeState.dragPointerId !== -1) {
      this._barRef.value?.releasePointerCapture(
        this._resizeState.dragPointerId
      );
    }
    this._resizeState = { ...DEFAULT_RESIZE_STATE };
  }

  //#endregion

  //#region Public Methods

  /** Toggles the collapsed state of the specified pane. */
  public toggle(position: PanePosition): void {
    const isCollapsing = this._collapsedPane === null;

    if (isCollapsing) {
      this._savePaneSizes();
    }

    // If the requested pane is already collapsed, expand it (set to null)
    // Otherwise, collapse the requested pane (this also handles switching from one collapsed pane to another)
    this._collapsedPane = this._collapsedPane === position ? null : position;

    this.toggleAttribute('start-collapsed', this._isStartCollapsed);
    this.toggleAttribute('end-collapsed', this._isEndCollapsed);

    this._restoreSizesOnExpandCollapse();
    this._updateCursor();
  }

  //#endregion

  //#region Internal API

  private _savePaneSizes() {
    this._startPaneState = {
      ...this._startPaneState,
      savedSize: `${this._paneRectAsPercent(0)}%`,
    };
    this._endPaneState = {
      ...this._endPaneState,
      savedSize: `${this._paneRectAsPercent(1)}%`,
    };
  }

  /* Reset sizes on collapse; restore saved sizes on expand */
  private _restoreSizesOnExpandCollapse() {
    if (this._collapsedPane !== null) {
      this._startPaneState = { ...this._startPaneState, size: 'auto' };
      this._endPaneState = { ...this._endPaneState, size: 'auto' };
    } else {
      this._startPaneState = {
        ...this._startPaneState,
        size: this._startPaneState.savedSize ?? this.startSize,
      };
      this._endPaneState = {
        ...this._endPaneState,
        size: this._endPaneState.savedSize ?? this.endSize,
      };
    }
  }

  private _updateCursor() {
    Object.assign(this._barInternalStyles, { '--cursor': this._barCursor });
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
    if (!this._startPane || this._isStartCollapsed) {
      return 0;
    }
    if (this._isEndCollapsed) {
      return 100;
    }
    return this._paneRectAsPercent(0);
  }

  private _getMinMaxAsPercent(type: 'min' | 'max'): number {
    const value = type === 'min' ? this.startMinSize : this.startMaxSize;
    const defaultValue = type === 'min' ? 0 : 100;

    return value ? this._sizeToPercent(value) : defaultValue;
  }

  private _updateBarAria(): void {
    const bar = this._barRef.value;
    if (!bar) return;

    bar.setAttribute('aria-valuenow', String(this._getStartPaneSizePercent()));
    bar.setAttribute('aria-valuemin', String(this._getMinMaxAsPercent('min')));
    bar.setAttribute('aria-valuemax', String(this._getMinMaxAsPercent('max')));
  }

  private _isPercentageSize(which: PanePosition): boolean {
    const targetSize =
      which === 'start' ? this._startPaneState.size : this._endPaneState.size;
    return !!targetSize && targetSize.includes('%');
  }

  private _isAutoSize(which: PanePosition): boolean {
    const targetSize =
      which === 'start' ? this._startPaneState.size : this._endPaneState.size;
    return !!targetSize && targetSize === 'auto';
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
    const grow = this._isAutoSize(which) ? 1 : 0;
    const shrink = 1;
    const size = this._isAutoSize(which)
      ? '0px'
      : which === 'start'
        ? this._startPaneState.size
        : this._endPaneState.size;
    return `${grow} ${shrink} ${size}`;
  }

  private _handleResizePanes(
    direction: -1 | 1,
    validOrientation: SplitterOrientation
  ): void {
    if (this._resizeDisallowed || this.orientation !== validOrientation) {
      return;
    }
    const delta = this._resolveDelta(10, 10, direction);

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
    const isHorizontal = this.orientation === 'horizontal';
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

  private _handleExpanderStartAction(): void {
    const target = this._isEndCollapsed ? 'end' : 'start';
    this.toggle(target);
  }

  private _handleExpanderEndAction() {
    const target = this._isStartCollapsed ? 'start' : 'end';
    this.toggle(target);
  }

  private _handleArrowsExpandCollapse(
    target: PanePosition,
    validOrientation: SplitterOrientation
  ): void {
    if (this.disableCollapse || this.orientation !== validOrientation) {
      return;
    }
    let effectiveTarget = target;
    if (validOrientation === 'horizontal' && !isLTR(this)) {
      effectiveTarget = target === 'start' ? 'end' : 'start';
    }

    effectiveTarget === 'start'
      ? this._handleExpanderStartAction()
      : this._handleExpanderEndAction();
  }

  private _resizeStart(): void {
    const [startSize, endSize] = this._rectSize();

    this._resizeState = {
      ...this._resizeState,
      startPane: this._createPaneState('start', startSize),
      endPane: this._createPaneState('end', endSize),
    };
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
      minSizePx: this._setMinMaxInPx(pane, 'min'),
      maxSizePx: this._setMinMaxInPx(pane, 'max'),
    };
  }

  private _setMinMaxInPx(
    pane: PanePosition,
    type: 'min' | 'max'
  ): number | undefined {
    const paneState =
      pane === 'start' ? this._startPaneState : this._endPaneState;
    const value = type === 'max' ? paneState.maxSize : paneState.minSize;
    if (!value) {
      return undefined;
    }
    const totalSize = this._getTotalSize();
    const result = value.includes('%')
      ? (asNumber(value) / 100) * totalSize
      : asNumber(value);
    return result;
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

  private _computeSize(pane: PaneResizeSnapshot, paneSize: number): string {
    const totalSize = this._getTotalSize();
    if (pane.isPercentageBased) {
      const percentPaneSize = asPercent(paneSize, totalSize);
      return `${percentPaneSize}%`;
    }
    return `${roundPrecise(paneSize, 0)}px`;
  }

  private _resizeEnd(delta: number): void {
    if (!this._resizeState.startPane || !this._resizeState.endPane) return;
    const [startPaneSize, endPaneSize] = this._calcNewSizes(delta);

    this.startSize = this._computeSize(
      this._resizeState.startPane,
      startPaneSize
    );
    this.endSize = this._computeSize(this._resizeState.endPane, endPaneSize);

    this.emitEvent('igcResizeEnd', {
      detail: {
        startPanelSize: startPaneSize,
        endPanelSize: endPaneSize,
        delta,
      },
    });
  }

  private _rectSize(): [number, number] {
    const relevantDimension =
      this.orientation === 'horizontal' ? 'width' : 'height';
    const startPaneRect = this._startPane.getBoundingClientRect();
    const endPaneRect = this._endPane.getBoundingClientRect();
    return [startPaneRect[relevantDimension], endPaneRect[relevantDimension]];
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

    const dimension = this.orientation === 'horizontal' ? 'width' : 'height';
    const barSize = this._barRef.value
      ? roundPrecise(this._barRef.value.getBoundingClientRect()[dimension])
      : 0;

    const rect = this._base.getBoundingClientRect();
    const size = rect[dimension];
    return size - barSize;
  }

  private _resetPanes(): void {
    this._startPaneState = {
      ...this._startPaneState,
      size: 'auto',
      minSize: undefined,
      maxSize: undefined,
    };
    this._endPaneState = {
      ...this._endPaneState,
      size: 'auto',
      minSize: undefined,
      maxSize: undefined,
    };

    this._setPaneMinMaxSizes('start', '0', '100%');
    this._setPaneMinMaxSizes('end', '0', '100%');
  }

  private _updatePanes(): void {
    if (this._collapsedPane) {
      this._resetPanes();
    } else {
      this._setPaneMinMaxSizes(
        'start',
        this._startPaneState.minSize,
        this._startPaneState.maxSize
      );
      this._setPaneMinMaxSizes(
        'end',
        this._endPaneState.minSize,
        this._endPaneState.maxSize
      );
    }

    this._setPaneFlex(this._startPaneInternalStyles, this._getFlex('start'));
    this._setPaneFlex(this._endPaneInternalStyles, this._getFlex('end'));
    this._updateCursor();
  }

  private _setPaneMinMaxSizes(
    pane: PanePosition,
    minSize?: string,
    maxSize?: string
  ): void {
    const isHorizontal = this.orientation === 'horizontal';

    const min = this._ensureMinConstraintIsWithinBounds(pane, minSize) ?? 0;
    const max = maxSize ?? '100%';

    const sizes = isHorizontal
      ? {
          minWidth: min,
          maxWidth: max,
          minHeight: 0,
          maxHeight: '100%',
        }
      : {
          minWidth: 0,
          maxWidth: '100%',
          minHeight: min,
          maxHeight: max,
        };

    if (pane === 'start') {
      this._startPaneInternalStyles = {
        ...this._startPaneInternalStyles,
        ...sizes,
      };
    } else {
      this._endPaneInternalStyles = {
        ...this._endPaneInternalStyles,
        ...sizes,
      };
    }
  }

  private _ensureMinConstraintIsWithinBounds(
    pane: PanePosition,
    minSize?: string
  ): string | undefined {
    const totalSize = this._getTotalSize();

    let validatedMin = minSize;
    if (minSize && totalSize > 0) {
      const minPx = this._setMinMaxInPx(pane, 'min') ?? 0;

      const otherMinSize =
        pane === 'start'
          ? this._endPaneState.minSize
          : this._startPaneState.minSize;
      const otherMinPx = otherMinSize
        ? (this._setMinMaxInPx(pane === 'start' ? 'end' : 'start', 'min') ?? 0)
        : 0;

      // Ignore constraint if it exceeds total or combined exceeds total to prevent content overflow
      // Once container grows to accommodate the constraint, it will be applied
      if (minPx > totalSize || minPx + otherMinPx > totalSize) {
        validatedMin = undefined;
      }
    }
    return validatedMin;
  }

  private _setPaneFlex(styles: StyleInfo, flex: string): void {
    Object.assign(styles, {
      flex: flex,
    });
  }

  private _handleExpanderClick(pane: PanePosition, event: PointerEvent): void {
    // Prevent resize action being initiated
    event.stopPropagation();

    pane === 'start'
      ? this._handleExpanderStartAction()
      : this._handleExpanderEndAction();
  }

  //#endregion

  //#region Rendering

  private _resolvePartNames(expander: PanePosition): Record<string, boolean> {
    if (expander === 'start') {
      return {
        'end-expand-btn': this._isEndCollapsed,
        'start-collapse-btn': !this._isEndCollapsed,
      };
    }

    return {
      'start-expand-btn': this._isStartCollapsed,
      'end-collapse-btn': !this._isStartCollapsed,
    };
  }

  private _resolveExpanderLabel(expander: PanePosition): string {
    if (expander === 'start') {
      return this._isEndCollapsed ? 'Expand end pane' : 'Collapse start pane';
    }
    return this._isStartCollapsed ? 'Expand start pane' : 'Collapse end pane';
  }

  private _getExpanderHiddenState(): {
    prevButtonHidden: boolean;
    nextButtonHidden: boolean;
  } {
    const hidden = this.disableCollapse || this.hideCollapseButtons;
    return {
      prevButtonHidden: hidden || !!this._isStartCollapsed,
      nextButtonHidden: hidden || !!this._isEndCollapsed,
    };
  }

  private _renderBarControls() {
    const dragHandleHidden = this.hideDragHandle || this.disableResize;
    const { prevButtonHidden, nextButtonHidden } =
      this._getExpanderHiddenState();

    return html`
      <div
        part="${partMap(this._resolvePartNames('start'))}"
        ?hidden=${prevButtonHidden}
        role="button"
        aria-label=${this._resolveExpanderLabel('start')}
        @pointerdown=${(e: PointerEvent) =>
          this._handleExpanderClick('start', e)}
      ></div>
      <div part="drag-handle" ?hidden=${dragHandleHidden}></div>
      <div
        part="${partMap(this._resolvePartNames('end'))}"
        ?hidden=${nextButtonHidden}
        role="button"
        aria-label=${this._resolveExpanderLabel('end')}
        @pointerdown=${(e: PointerEvent) => this._handleExpanderClick('end', e)}
      ></div>
    `;
  }

  protected override render() {
    const isDragging = this._resizeState.isDragging;
    const canResize = !this._resizeDisallowed;

    return html`
      <div part="base">
        <div
          part="start-pane"
          id="start-pane"
          style=${styleMap(this._startPaneInternalStyles)}
        >
          <slot name="start"></slot>
        </div>
        <div
          ${ref(this._barRef)}
          part="splitter-bar"
          role="separator"
          tabindex=${this._barTabIndex}
          aria-controls="start-pane end-pane"
          aria-orientation=${this.orientation}
          style=${styleMap(this._barInternalStyles)}
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
        <div
          part="end-pane"
          id="end-pane"
          style=${styleMap(this._endPaneInternalStyles)}
        >
          <slot name="end"></slot>
        </div>
      </div>
    `;
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter': IgcSplitterComponent;
  }
}
