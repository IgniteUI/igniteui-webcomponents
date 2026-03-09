import { html, LitElement } from 'lit';
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
import { watch } from '../common/decorators/watch.js';
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

const INITIAL_RESIZE_STATE: SplitterResizeState = {
  startPane: null,
  endPane: null,
  isDragging: false,
  dragStartPosition: { x: 0, y: 0 },
  dragPointerId: -1,
};

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
  public static register() {
    registerComponent(IgcSplitterComponent);
  }

  //#region Private Properties

  private readonly _barRef = createRef<HTMLElement>();
  private _startPaneInternalStyles: StyleInfo = {};
  private _endPaneInternalStyles: StyleInfo = {};
  private _barInternalStyles: StyleInfo = {};
  private _startCollapsed = false;
  private _endCollapsed = false;
  private _startSize = 'auto';
  private _endSize = 'auto';
  private _startMinSize: string | undefined;
  private _startMaxSize: string | undefined;
  private _endMinSize: string | undefined;
  private _endMaxSize: string | undefined;
  private _savedStartSize: string | undefined;
  private _savedEndSize: string | undefined;

  @state()
  private _resizeState: SplitterResizeState = { ...INITIAL_RESIZE_STATE };

  @query('[part~="base"]', true)
  private readonly _base!: HTMLElement;

  @query('[part~="start-pane"]', true)
  private readonly _startPane!: HTMLElement;

  @query('[part~="end-pane"]', true)
  private readonly _endPane!: HTMLElement;

  private get _resizeDisallowed() {
    return this.disableResize || this.startCollapsed || this.endCollapsed;
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

  //#endregion

  //#region Public Properties

  /** Gets/Sets the orientation of the splitter.
   *
   * @remarks
   * Default value is `horizontal`.
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
  public set startMinSize(value: string | undefined) {
    this._startMinSize = this._normalizeValue(value);
  }

  public get startMinSize(): string | undefined {
    return this._startMinSize;
  }

  /**
   * The minimum size of the end pane.
   * @attr
   */
  @property({ attribute: 'end-min-size', reflect: true })
  public set endMinSize(value: string | undefined) {
    this._endMinSize = this._normalizeValue(value);
  }

  public get endMinSize(): string | undefined {
    return this._endMinSize;
  }

  /**
   * The maximum size of the start pane.
   * @attr
   */
  @property({ attribute: 'start-max-size', reflect: true })
  public set startMaxSize(value: string | undefined) {
    this._startMaxSize = this._normalizeValue(value);
  }

  public get startMaxSize(): string | undefined {
    return this._startMaxSize;
  }

  /**
   * The maximum size of the end pane.
   * @attr
   */
  @property({ attribute: 'end-max-size', reflect: true })
  public set endMaxSize(value: string | undefined) {
    this._endMaxSize = this._normalizeValue(value);
  }

  public get endMaxSize(): string | undefined {
    return this._endMaxSize;
  }

  /**
   * The size of the start pane.
   * @attr
   */
  @property({ attribute: 'start-size', reflect: true })
  public set startSize(value: string | undefined) {
    this._startSize = this._normalizeValue(value, 'auto')!;
    this._setPaneFlex(this._startPaneInternalStyles, this._getFlex('start'));
  }

  public get startSize(): string | undefined {
    return this._startSize;
  }

  /**
   * The size of the end pane.
   * @attr
   */
  @property({ attribute: 'end-size', reflect: true })
  public set endSize(value: string | undefined) {
    this._endSize = this._normalizeValue(value, 'auto')!;
    this._setPaneFlex(this._endPaneInternalStyles, this._getFlex('end'));
  }

  public get endSize(): string | undefined {
    return this._endSize;
  }

  /**
   * Collapsed state of the start pane.
   * @attr
   */
  @property({ type: Boolean, attribute: 'start-collapsed', reflect: true })
  public get startCollapsed() {
    return this._startCollapsed;
  }

  public set startCollapsed(value: boolean) {
    if (value && !this._startCollapsed && this._getTotalSize() > 0) {
      this._savedStartSize = `${this._sizeToPercent(undefined, 0)}%`;
    }
    this._startCollapsed = value;
    if (this._startCollapsed && this._endCollapsed) {
      this.endCollapsed = false;
    }
    this._collapsedChange(value);
  }

  /**
   * Collapsed state of the end pane.
   * @attr
   */
  @property({ type: Boolean, attribute: 'end-collapsed', reflect: true })
  public get endCollapsed() {
    return this._endCollapsed;
  }

  public set endCollapsed(value: boolean) {
    if (value && !this._endCollapsed && this._getTotalSize() > 0) {
      this._savedEndSize = `${this._sizeToPercent(undefined, 1)}%`;
    }
    this._endCollapsed = value;
    if (this._startCollapsed && this._endCollapsed) {
      this.startCollapsed = false;
    }
    this._collapsedChange(value);
  }

  //#endregion

  //#region Watchers

  @watch('orientation', { waitUntilFirstUpdate: true })
  protected _orientationChange(): void {
    this._changeCursor();
    this._resetPanes();
  }

  @watch('disableResize')
  protected _changeCursor(): void {
    Object.assign(this._barInternalStyles, { '--cursor': this._barCursor });
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
  }

  protected override firstUpdated() {
    this._initPanes();

    createResizeObserverController(this, {
      callback: this._initPanes,
    });
  }

  //#endregion

  //#region Resize Event Handlers

  private _handleBarPointerDown(e: PointerEvent) {
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

  private _handleBarPointerMove(e: PointerEvent) {
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

  private _handleEndDrag(e: PointerEvent) {
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

  private _endDrag() {
    if (this._resizeState.dragPointerId !== -1) {
      this._barRef.value?.releasePointerCapture(
        this._resizeState.dragPointerId
      );
    }
    this._resizeState = { ...INITIAL_RESIZE_STATE };
  }

  //#endregion

  //#region Public Methods

  /** Toggles the collapsed state of the pane. */
  public toggle(position: 'start' | 'end') {
    if (position === 'start') {
      this.startCollapsed = !this.startCollapsed;
    } else {
      this.endCollapsed = !this.endCollapsed;
    }

    if (!this.startCollapsed || !this.endCollapsed) {
      this.updateComplete.then(() => this.requestUpdate());
    }
  }

  //#endregion

  //#region Internal API

  private _sizeToPercent(sizeValue?: string, paneIndex: 0 | 1 = 0): number {
    const totalSize = this._getTotalSize();
    if (totalSize === 0) {
      return 0;
    }

    if (!sizeValue || sizeValue === 'auto') {
      return roundPrecise(asPercent(this._rectSize()[paneIndex], totalSize), 0);
    }

    if (sizeValue.includes('%')) {
      return asNumber(sizeValue);
    }

    const pxValue = asNumber(sizeValue);
    return roundPrecise(asPercent(pxValue, totalSize), 0);
  }

  private _getStartPaneSizePercent(): number {
    if (!this._startPane || this.startCollapsed) {
      return 0;
    }
    if (this.endCollapsed) {
      return 100;
    }
    return this._sizeToPercent(this.startSize);
  }

  private _getMinMaxAsPercent(type: 'min' | 'max'): number {
    const value = type === 'min' ? this.startMinSize : this.startMaxSize;
    const defaultValue = type === 'min' ? 0 : 100;

    return value ? this._sizeToPercent(value) : defaultValue;
  }

  private _isPercentageSize(which: 'start' | 'end') {
    const targetSize = which === 'start' ? this._startSize : this._endSize;
    return !!targetSize && targetSize.includes('%');
  }

  private _isAutoSize(which: 'start' | 'end') {
    const targetSize = which === 'start' ? this._startSize : this._endSize;
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

  private _getFlex(which: 'start' | 'end'): string {
    const grow = this._isAutoSize(which) ? 1 : 0;
    const shrink = 1;
    const size = this._isAutoSize(which)
      ? '0px'
      : which === 'start'
        ? this._startSize
        : this._endSize;
    return `${grow} ${shrink} ${size}`;
  }

  private _collapsedChange(isCollapsed: boolean): void {
    this.startSize = 'auto';
    this.endSize = 'auto';
    this._changeCursor();
    if (isCollapsed) {
      return;
    }
    this.startSize = this._savedStartSize ?? this.startSize;
    this.endSize = this._savedEndSize ?? this.endSize;
  }

  private _handleResizePanes(
    direction: -1 | 1,
    validOrientation: 'horizontal' | 'vertical'
  ) {
    if (this._resizeDisallowed || this.orientation !== validOrientation) {
      return;
    }
    const delta = this._resolveDelta(10, 10, direction);

    this._resizeStart();
    this._resizing(delta);
    this._resizeEnd(delta);
    return true;
  }

  @eventOptions({ passive: false })
  private _preventDefaultForEvent(e: Event) {
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

  private _handleMinMaxResize(type: 'min' | 'max') {
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

  private _handleExpanderStartAction() {
    const target = this.endCollapsed ? 'end' : 'start';
    this.toggle(target);
  }

  private _handleExpanderEndAction() {
    const target = this.startCollapsed ? 'start' : 'end';
    this.toggle(target);
  }

  private _handleArrowsExpandCollapse(
    target: 'start' | 'end',
    validOrientation: 'horizontal' | 'vertical'
  ) {
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

  private _resizeStart() {
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
    pane: 'start' | 'end',
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
    pane: 'start' | 'end',
    type: 'min' | 'max'
  ): number | undefined {
    let value: string | undefined;
    if (type === 'max') {
      value = pane === 'start' ? this.startMaxSize : this.endMaxSize;
    } else {
      value = pane === 'start' ? this.startMinSize : this.endMinSize;
    }
    if (!value) {
      return undefined;
    }
    const totalSize = this._getTotalSize();
    const result = value.includes('%')
      ? (asNumber(value) / 100) * totalSize
      : asNumber(value);
    return result;
  }

  private _resizing(delta: number) {
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

  private _resizeEnd(delta: number) {
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
    this._resizeState = { ...INITIAL_RESIZE_STATE };
  }

  private _rectSize() {
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

  private _getTotalSize() {
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

  private _resetPanes() {
    this.startSize = 'auto';
    this.endSize = 'auto';
    this.startMinSize = undefined;
    this.startMaxSize = undefined;
    this.endMinSize = undefined;
    this.endMaxSize = undefined;

    this._setPaneFlex(this._startPaneInternalStyles, this._getFlex('start'));
    this._setPaneMinMaxSizes('start', '0', '100%');
    this._setPaneFlex(this._endPaneInternalStyles, this._getFlex('end'));
    this._setPaneMinMaxSizes('end', '0', '100%');
  }

  private _initPanes() {
    if (this.startCollapsed || this.endCollapsed) {
      this._resetPanes();
    } else {
      this._setPaneMinMaxSizes('start', this.startMinSize, this.startMaxSize);
      this._setPaneMinMaxSizes('end', this.endMinSize, this.endMaxSize);
    }

    this._setPaneFlex(this._startPaneInternalStyles, this._getFlex('start'));
    this._setPaneFlex(this._endPaneInternalStyles, this._getFlex('end'));
    this.requestUpdate();
  }

  private _setPaneMinMaxSizes(
    pane: 'start' | 'end',
    minSize?: string,
    maxSize?: string
  ) {
    const isHorizontal = this.orientation === 'horizontal';

    const min = this._ensureMinConstraintIsWithinBounds(pane, minSize) ?? 0;
    const max = maxSize ?? '100%';
    const styles =
      pane === 'start'
        ? this._startPaneInternalStyles
        : this._endPaneInternalStyles;

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

    Object.assign(styles, sizes);
  }

  private _ensureMinConstraintIsWithinBounds(
    pane: 'start' | 'end',
    minSize?: string
  ): string | undefined {
    const totalSize = this._getTotalSize();

    let validatedMin = minSize;
    if (minSize && totalSize > 0) {
      const minPx = this._setMinMaxInPx(pane, 'min') ?? 0;

      const otherMinSize =
        pane === 'start' ? this._endMinSize : this._startMinSize;
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

  private _setPaneFlex(styles: StyleInfo, flex: string) {
    Object.assign(styles, {
      flex: flex,
    });
  }

  private _handleExpanderClick(pane: 'start' | 'end', event: PointerEvent) {
    // Prevent resize action being initiated
    event.stopPropagation();

    pane === 'start'
      ? this._handleExpanderStartAction()
      : this._handleExpanderEndAction();
  }

  //#endregion

  //#region Rendering

  private _resolvePartNames(expander: 'start' | 'end') {
    if (expander === 'start') {
      return {
        'end-expand-btn': this.endCollapsed,
        'start-collapse-btn': !this.endCollapsed,
      };
    }

    return {
      'start-expand-btn': this.startCollapsed,
      'end-collapse-btn': !this.startCollapsed,
    };
  }

  private _resolveExpanderLabel(expander: 'start' | 'end'): string {
    if (expander === 'start') {
      return this.endCollapsed ? 'Expand end pane' : 'Collapse start pane';
    }
    return this.startCollapsed ? 'Expand start pane' : 'Collapse end pane';
  }

  private _getExpanderHiddenState() {
    const hidden = this.disableCollapse || this.hideCollapseButtons;
    return {
      prevButtonHidden: hidden || !!(this.startCollapsed && !this.endCollapsed),
      nextButtonHidden: hidden || !!(this.endCollapsed && !this.startCollapsed),
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
          aria-valuenow=${this._getStartPaneSizePercent()}
          aria-valuemin=${this._getMinMaxAsPercent('min')}
          aria-valuemax=${this._getMinMaxAsPercent('max')}
          style=${styleMap(this._barInternalStyles)}
          @touchstart=${this._preventDefaultForEvent}
          @contextmenu=${this._preventDefaultForEvent}
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
