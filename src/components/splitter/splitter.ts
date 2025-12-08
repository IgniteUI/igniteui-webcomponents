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
import { isLTR } from '../common/util.js';
import { addResizeController } from '../resize-container/resize-controller.js';
import type { SplitterOrientation } from '../types.js';
import { styles } from './themes/splitter.base.css.js';

export interface IgcSplitterBarResizeEventArgs {
  pane: HTMLElement;
  sibling: HTMLElement;
}

export interface IgcSplitterComponentEventMap {
  igcResizeStart: CustomEvent<IgcSplitterBarResizeEventArgs>;
  igcResizing: CustomEvent<IgcSplitterBarResizeEventArgs>;
  igcResizeEnd: CustomEvent<IgcSplitterBarResizeEventArgs>;
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
 * @csspart ... - ... .
 */
export default class IgcSplitterComponent extends EventEmitterMixin<
  IgcSplitterComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-splitter';
  public static styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSplitterComponent);
  }

  //#region Private Properties

  private readonly _barRef = createRef<HTMLElement>();
  private _startPaneInternalStyles: StyleInfo = {};
  private _endPaneInternalStyles: StyleInfo = {};
  private _barInternalStyles: StyleInfo = {};
  private _startSize = 'auto';
  private _endSize = 'auto';
  private _resizeState: SplitterResizeState | null = null;

  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      ariaOrientation: 'horizontal',
    },
  });

  @query('[part~="base"]', true)
  private readonly _base!: HTMLElement;

  @query('[part~="start-pane"]', true)
  private readonly _startPane!: HTMLElement;

  @query('[part~="end-pane"]', true)
  private readonly _endPane!: HTMLElement;

  @query('[part~="bar"]', true)
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
      slots: setSlots('start', 'end'),
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

    addResizeController(this, {
      ref: [this._barRef],
      mode: 'immediate',
      updateTarget: false,
      resizeTarget: () => {
        return this.orientation === 'horizontal' && !isLTR(this)
          ? this._endPane
          : this._startPane;
      },
      start: () => {
        if (this._resizeDisallowed) {
          return false;
        }
        this._resizeStart();
        return true;
      },
      resize: ({ state }) => {
        const delta = this._resolveDelta(state.deltaX, state.deltaY);
        if (delta !== 0) {
          this._resizing(delta);
        }
      },
      end: ({ state }) => {
        const delta = this._resolveDelta(state.deltaX, state.deltaY);
        if (delta !== 0) {
          this._resizeEnd(delta);
        }
      },
      cancel: () => {},
    });
  }

  protected override firstUpdated() {
    this._initPanes();
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
    // TODO: are these event args needed?
    this.emitEvent('igcResizeStart', {
      detail: { pane: this._startPane, sibling: this._endPane },
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
    const [paneSize, siblingSize] = this._calcNewSizes(delta);

    this.startSize = `${paneSize}px`;
    this.endSize = `${siblingSize}px`;

    this.emitEvent('igcResizing', {
      detail: { pane: this._startPane, sibling: this._endPane },
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
    const [paneSize, siblingSize] = this._calcNewSizes(delta);

    this.startSize = this._computeSize(this._resizeState.startPane, paneSize);
    this.endSize = this._computeSize(this._resizeState.endPane, siblingSize);

    this.emitEvent('igcResizeEnd', {
      detail: { pane: this._startPane, sibling: this._endPane },
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

    this._setPaneFlex(this._startPaneInternalStyles, this._getFlex('start'));
    this._setPaneMinMaxSizes(this._startPaneInternalStyles, '0', '100%');
    this._setPaneFlex(this._endPaneInternalStyles, this._getFlex('end'));
    this._setPaneMinMaxSizes(this._endPaneInternalStyles, '0', '100%');
  }

  private _initPanes() {
    // TODO: discuss if panes should be reset if one is collapsed (as in Angular currently)
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
    const minProp = isHorizontal ? 'minWidth' : 'minHeight';
    const maxProp = isHorizontal ? 'maxWidth' : 'maxHeight';

    const sizes = {
      [minProp]: minSize ?? 0,
      [maxProp]: maxSize ?? '100%',
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
    return html`
      <div
        part="start-expander"
        ?hidden=${prevButtonHidden}
        @pointerdown=${(e: PointerEvent) =>
          this._handleExpanderClick('start', e)}
      ></div>
      <div part="handle"></div>
      <div
        part="end-expander"
        ?hidden=${nextButtonHidden}
        @pointerdown=${(e: PointerEvent) => this._handleExpanderClick('end', e)}
      ></div>
    `;
  }

  protected override render() {
    return html`
      <div part="base">
        <div part="start-pane" style=${styleMap(this._startPaneInternalStyles)}>
          <slot name="start"></slot>
        </div>
        <div
          ${ref(this._barRef)}
          part="bar"
          tabindex="0"
          style=${styleMap(this._barInternalStyles)}
        >
          ${this._renderBarControls()}
        </div>
        <div part="end-pane" style=${styleMap(this._endPaneInternalStyles)}>
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
