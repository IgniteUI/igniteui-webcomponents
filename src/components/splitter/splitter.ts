import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { addInternalsController } from '../common/controllers/internals.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
} from '../common/controllers/key-bindings.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import { isLTR } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import type { SplitterOrientation } from '../types.js';
import { styles } from './themes/splitter.base.css.js';

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

interface PaneResizeState {
  initialSize: number;
  isPercentageBased: boolean;
  minSizePx?: number;
  maxSizePx?: number;
}

interface SplitterResizeState {
  startPane: PaneResizeState;
  endPane: PaneResizeState;
}

/**
 * The Splitter component provides a framework for a simple layout, splitting the view horizontally or vertically
 * into multiple smaller resizable and collapsible areas.
 *
 * @element igc-splitter
 * *
 * @fires igcResizeStart - Emitted when resizing starts.
 * @fires igcResizing - Emitted while resizing.
 * @fires igcResizeEnd - Emitted when resizing ends.
 *
 * @slot start - Content for the start pane.
 * @slot end - Content for the end pane.
 * @slot drag-handle - Optional slot for custom cursor content (not visually rendered, can be used for cursor customization).
 * @slot start-expand - Optional slot to customize the icon for expanding the start panel.
 * @slot start-collapse - Optional slot to customize the icon for collapsing the start panel.
 * @slot end-expand - Optional slot to customize the icon for expanding the end panel.
 * @slot end-collapse - Optional slot to customize the icon for collapsing the end panel.
 *
 * @csspart splitter-bar - The resizable bar element between the two panels.
 * @csspart drag-handle - The drag handle icon/element on the splitter bar.
 * @csspart start-panel - The container for the start panel content.
 * @csspart end-panel - The container for the end panel content.
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
  public static styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSplitterComponent, IgcIconComponent);
  }

  //#region Private Properties

  private readonly _barRef = createRef<HTMLElement>();
  private _startPaneInternalStyles: StyleInfo = {};
  private _endPaneInternalStyles: StyleInfo = {};
  private _barInternalStyles: StyleInfo = {};
  private _startSize = 'auto';
  private _endSize = 'auto';
  private _resizeState: SplitterResizeState | null = null;
  private _isDragging = false;
  private _dragPointerId = -1;
  private _dragStartPosition = { x: 0, y: 0 };

  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      ariaOrientation: 'horizontal',
    },
  });

  @query('[part~="base"]', true)
  private readonly _base!: HTMLElement;

  @query('[part~="start-panel"]', true)
  private readonly _startPane!: HTMLElement;

  @query('[part~="end-panel"]', true)
  private readonly _endPane!: HTMLElement;

  @query('[part~="splitter-bar"]', true)
  private readonly _bar!: HTMLElement;

  private get _resizeDisallowed() {
    return this.nonResizable || this.startCollapsed || this.endCollapsed;
  }

  private get _barCursor(): string {
    if (this._resizeDisallowed) {
      return 'default';
    }
    return this.orientation === 'horizontal' ? 'col-resize' : 'row-resize';
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
   * Sets the visibility of the handle and expanders in the splitter bar.
   * @remarks
   * Default value is `false`.
   * @attr
   */
  @property({ type: Boolean, attribute: 'non-collapsible', reflect: true })
  public nonCollapsible = false;

  /**
   * Defines if the splitter is resizable or not.
   * @attr
   */
  @property({ type: Boolean, reflect: true, attribute: 'non-resizable' })
  public nonResizable = false;

  /**
   * The minimum size of the start pane.
   * @attr
   */
  @property({ attribute: 'start-min-size', reflect: true })
  public startMinSize: string | undefined;

  /**
   * The minimum size of the end pane.
   * @attr
   */
  @property({ attribute: 'end-min-size', reflect: true })
  public endMinSize: string | undefined;

  /**
   * The maximum size of the start pane.
   * @attr
   */
  @property({ attribute: 'start-max-size', reflect: true })
  public startMaxSize: string | undefined;

  /**
   * The maximum size of the end pane.
   * @attr
   */
  @property({ attribute: 'end-max-size', reflect: true })
  public endMaxSize: string | undefined;

  /**
   * The size of the start pane.
   * @attr
   */
  @property({ attribute: 'start-size', reflect: true })
  public set startSize(value: string | undefined) {
    this._startSize = value ? value : 'auto';
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
    this._endSize = value ? value : 'auto';
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
  public startCollapsed = false;

  /**
   * Collapsed state of the end pane.
   * @attr
   */
  @property({ type: Boolean, attribute: 'end-collapsed', reflect: true })
  public endCollapsed = false;

  //#endregion

  //#region Watchers

  @watch('orientation', { waitUntilFirstUpdate: true })
  protected _orientationChange(): void {
    this._internals.setARIA({ ariaOrientation: this.orientation });
    Object.assign(this._barInternalStyles, { '--cursor': this._barCursor });
    this._resetPanes();
  }

  @watch('nonResizable')
  protected _changeCursor(): void {
    Object.assign(this._barInternalStyles, { '--cursor': this._barCursor });
  }

  @watch('startCollapsed', { waitUntilFirstUpdate: true })
  @watch('endCollapsed', { waitUntilFirstUpdate: true })
  protected _collapsedChange(): void {
    this.startSize = 'auto';
    this.endSize = 'auto';
    this._changeCursor();
  }

  //#endregion

  //#region Lifecycle

  protected override willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    if (
      changed.has('startMinSize') ||
      changed.has('startMaxSize') ||
      changed.has('endMinSize') ||
      changed.has('endMaxSize')
    ) {
      this._initPanes();
    }
  }

  constructor() {
    super();

    addSlotController(this, {
      slots: setSlots(
        'start',
        'end',
        'drag-handle',
        'start-expand',
        'start-collapse',
        'end-expand',
        'end-collapse'
      ),
    });
    addKeybindings(this, {
      ref: this._barRef,
    })
      .set(arrowUp, () => this._handleResizePanes(-1, 'vertical'))
      .set(arrowDown, () => this._handleResizePanes(1, 'vertical'))
      .set(arrowLeft, () => this._handleResizePanes(-1, 'horizontal'))
      .set(arrowRight, () => this._handleResizePanes(1, 'horizontal'))
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
  }

  //#endregion

  //#region Resize Event Handlers

  private _handleBarPointerDown(e: PointerEvent) {
    if (e.button !== 0 || this._resizeDisallowed) {
      return;
    }

    e.preventDefault();

    this._isDragging = true;
    this._dragPointerId = e.pointerId;
    this._dragStartPosition = { x: e.clientX, y: e.clientY };

    this._resizeStart();
    this._bar.setPointerCapture(this._dragPointerId);
  }

  private _handleBarPointerMove(e: PointerEvent) {
    if (!this._isDragging || e.pointerId !== this._dragPointerId) {
      return;
    }

    const deltaX = e.clientX - this._dragStartPosition.x;
    const deltaY = e.clientY - this._dragStartPosition.y;
    const delta = this._resolveDelta(deltaX, deltaY);

    if (delta !== 0) {
      this._resizing(delta);
    }
  }

  private _handleEndDrag(e: PointerEvent) {
    if (!this._isDragging || e.pointerId !== this._dragPointerId) {
      return;
    }

    const deltaX = e.clientX - this._dragStartPosition.x;
    const deltaY = e.clientY - this._dragStartPosition.y;
    const delta = this._resolveDelta(deltaX, deltaY);

    if (delta !== 0) {
      this._resizeEnd(delta);
    }

    this._endDrag();
  }

  private _handleBarPointerCancel() {
    if (!this._isDragging) {
      return;
    }

    this._resizeState = null;
    this._endDrag();
  }

  private _endDrag() {
    if (this._isDragging && this._dragPointerId !== -1) {
      this._bar.releasePointerCapture(this._dragPointerId);
    }
    this._isDragging = false;
    this._dragPointerId = -1;
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
  }

  //#endregion

  //#region Internal API

  private _isPercentageSize(which: 'start' | 'end') {
    const targetSize = which === 'start' ? this._startSize : this._endSize;
    return !!targetSize && targetSize.indexOf('%') !== -1;
  }

  private _isAutoSize(which: 'start' | 'end') {
    const targetSize = which === 'start' ? this._startSize : this._endSize;
    return !!targetSize && targetSize === 'auto';
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

  // TODO: should there be events on expand/collapse?
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
    if (this.nonCollapsible || this.orientation !== validOrientation) {
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
  ): PaneResizeState {
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
    const totalSize = this.getTotalSize();
    let result: number;
    if (value.indexOf('%') !== -1) {
      const percentageValue = Number.parseInt(value, 10) || 0;
      result = (percentageValue / 100) * totalSize;
    } else {
      result = Number.parseInt(value, 10) || 0;
    }
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

  private _computeSize(pane: PaneResizeState, paneSize: number): string {
    const totalSize = this.getTotalSize();
    if (pane.isPercentageBased) {
      const percentPaneSize = (paneSize / totalSize) * 100;
      return `${percentPaneSize}%`;
    }
    return `${paneSize}px`;
  }

  private _resizeEnd(delta: number) {
    if (!this._resizeState) return;
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
    this._resizeState = null;
  }

  private _rectSize() {
    const relevantDimension =
      this.orientation === 'horizontal' ? 'width' : 'height';
    const startPaneRect = this._startPane.getBoundingClientRect();
    const endPaneRect = this._endPane.getBoundingClientRect();
    return [startPaneRect[relevantDimension], endPaneRect[relevantDimension]];
  }

  private _calcNewSizes(delta: number): [number, number] {
    if (!this._resizeState) return [0, 0];

    const start = this._resizeState.startPane;
    const end = this._resizeState.endPane;
    const minStart = start.minSizePx || 0;
    const minEnd = end.minSizePx || 0;
    const maxStart =
      start.maxSizePx || start.initialSize + end.initialSize - minEnd;
    const maxEnd =
      end.maxSizePx || start.initialSize + end.initialSize - minStart;

    let finalDelta: number;

    if (delta < 0) {
      const maxPossibleDelta = Math.min(
        start.initialSize - minStart,
        maxEnd - end.initialSize
      );
      finalDelta = Math.min(maxPossibleDelta, Math.abs(delta)) * -1;
    } else {
      const maxPossibleDelta = Math.min(
        maxStart - start.initialSize,
        end.initialSize - minEnd
      );
      finalDelta = Math.min(maxPossibleDelta, Math.abs(delta));
    }
    return [start.initialSize + finalDelta, end.initialSize - finalDelta];
  }

  private getTotalSize() {
    if (!this._base) {
      return 0;
    }

    const barSize = this._bar
      ? Number.parseInt(
          getComputedStyle(this._bar).getPropertyValue('--bar-size').trim(),
          10
        ) || 0
      : 0;

    const rect = this._base.getBoundingClientRect();
    const size = this.orientation === 'horizontal' ? rect.width : rect.height;
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
    this._setPaneMinMaxSizes(this._startPaneInternalStyles, '0', '100%');
    this._setPaneFlex(this._endPaneInternalStyles, this._getFlex('end'));
    this._setPaneMinMaxSizes(this._endPaneInternalStyles, '0', '100%');
  }

  private _initPanes() {
    if (this.startCollapsed || this.endCollapsed) {
      this._resetPanes();
    } else {
      this._setPaneMinMaxSizes(
        this._startPaneInternalStyles,
        this.startMinSize,
        this.startMaxSize
      );
      this._setPaneMinMaxSizes(
        this._endPaneInternalStyles,
        this.endMinSize,
        this.endMaxSize
      );
    }

    this._setPaneFlex(this._startPaneInternalStyles, this._getFlex('start'));
    this._setPaneFlex(this._endPaneInternalStyles, this._getFlex('end'));
    this.requestUpdate();
  }

  private _setPaneMinMaxSizes(
    styles: StyleInfo,
    minSize?: string,
    maxSize?: string
  ) {
    const isHorizontal = this.orientation === 'horizontal';

    const min = minSize ?? 0;
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

    Object.assign(styles, {
      ...sizes,
    });
  }

  private _setPaneFlex(styles: StyleInfo, flex: string) {
    Object.assign(styles, {
      flex: flex,
    });
  }

  private _handleExpanderClick(pane: 'start' | 'end', event: PointerEvent) {
    // Prevent resize controller from starting
    event.stopPropagation();

    pane === 'start'
      ? this._handleExpanderStartAction()
      : this._handleExpanderEndAction();
  }

  //#endregion

  //#region Rendering

  private _getExpanderHiddenState() {
    return {
      prevButtonHidden: !!(this.startCollapsed && !this.endCollapsed),
      nextButtonHidden: !!(this.endCollapsed && !this.startCollapsed),
    };
  }

  private _renderBarControls() {
    if (this.nonCollapsible) {
      return nothing;
    }
    const { prevButtonHidden, nextButtonHidden } =
      this._getExpanderHiddenState();

    const startExpanderSlot = this.endCollapsed
      ? 'end-expand'
      : 'start-collapse';
    const endExpanderSlot = this.startCollapsed
      ? 'start-expand'
      : 'end-collapse';

    const startExpanderParts = {
      'end-expand-btn': this.endCollapsed,
      'start-collapse-btn': !this.endCollapsed,
    };

    const endExpanderParts = {
      'start-expand-btn': this.startCollapsed,
      'end-collapse-btn': !this.startCollapsed,
    };

    return html`
      <div
        part="${partMap(startExpanderParts)}"
        ?hidden=${prevButtonHidden}
        @pointerdown=${(e: PointerEvent) =>
          this._handleExpanderClick('start', e)}
      >
        <slot name="${startExpanderSlot}"></slot>
      </div>
      <div part="drag-handle">
        <slot name="drag-handle"></slot>
      </div>
      <div
        part="${partMap(endExpanderParts)}"
        ?hidden=${nextButtonHidden}
        @pointerdown=${(e: PointerEvent) => this._handleExpanderClick('end', e)}
      >
        <slot name="${endExpanderSlot}"></slot>
      </div>
    `;
  }

  protected override render() {
    return html`
      <div part="base">
        <div
          part="start-panel"
          style=${styleMap(this._startPaneInternalStyles)}
        >
          <slot name="start"></slot>
        </div>
        <div
          ${ref(this._barRef)}
          part="splitter-bar"
          tabindex="0"
          style=${styleMap(this._barInternalStyles)}
          @touchstart=${(e: TouchEvent) => e.preventDefault()}
          @contextmenu=${(e: PointerEvent) => e.preventDefault()}
          @pointerdown=${this._handleBarPointerDown}
          @pointermove=${this._handleBarPointerMove}
          @pointerup=${this._handleEndDrag}
          @lostpointercapture=${this._handleEndDrag}
          @pointercancel=${this._handleBarPointerCancel}
        >
          ${this._renderBarControls()}
        </div>
        <div part="end-panel" style=${styleMap(this._endPaneInternalStyles)}>
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
