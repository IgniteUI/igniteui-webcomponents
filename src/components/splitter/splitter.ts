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
  private _baseResizeObserver?: ResizeObserver;

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

  private get _startFlex() {
    const grow = this._isAutoSize('start') ? 1 : 0;
    const shrink =
      this._isAutoSize('start') || this._isPercentageSize('start') ? 1 : 0;
    return `${grow} ${shrink} ${this._startSize}`;
  }

  private get _endFlex() {
    const grow = this._isAutoSize('end') ? 1 : 0;
    const shrink =
      this._isAutoSize('end') || this._isPercentageSize('end') ? 1 : 0;
    return `${grow} ${shrink} ${this._endSize}`;
  }

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
  public set startSize(value: string) {
    this._startSize = value;
    Object.assign(this._startPaneInternalStyles, {
      flex: this._startFlex,
    });
  }

  public get startSize(): string | undefined {
    return this._startSize;
  }

  /**
   * The size of the end pane.
   * @attr
   */
  @property({ attribute: 'end-size', reflect: true })
  public set endSize(value: string) {
    this._endSize = value;
    Object.assign(this._endPaneInternalStyles, {
      flex: this._endFlex,
    });
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

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._baseResizeObserver) {
      this._baseResizeObserver.disconnect();
      this._baseResizeObserver = undefined;
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
        return this._startPane;
      },
      start: () => {
        if (this._resizeDisallowed) {
          return false;
        }
        this._resizeStart();
        return true;
      },
      resize: ({ state }) => {
        const isHorizontal = this.orientation === 'horizontal';
        const delta = isHorizontal ? state.deltaX : state.deltaY;
        if (delta !== 0) {
          this._resizing(delta);
        }
      },
      end: ({ state }) => {
        const isHorizontal = this.orientation === 'horizontal';
        const delta = isHorizontal ? state.deltaX : state.deltaY;
        if (delta !== 0) {
          this._resizeEnd(delta);
        }
      },
      cancel: () => {},
    });
  }

  protected override firstUpdated() {
    this._initPanes();
    this._baseResizeObserver = new ResizeObserver(() =>
      this._onContainerResized()
    );
    this._baseResizeObserver.observe(this._base);
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

  private _onContainerResized = () => {
    window.setTimeout(() => {
      const [startSize, endSize] = this._rectSize();
      const total = this.getTotalSize();
      if (
        !this._isPercentageSize('end') &&
        !this._isAutoSize('end') &&
        startSize + endSize > total
      ) {
        this.endSize = `${total - startSize}px`;
      }
      if (
        !this._isPercentageSize('start') &&
        !this._isAutoSize('start') &&
        startSize + endSize > total
      ) {
        this.startSize = `${total - endSize}px`;
      }
    }, 100);
  };

  private _isPercentageSize(which: 'start' | 'end') {
    const targetSize = which === 'start' ? this._startSize : this._endSize;
    return !!targetSize && targetSize.indexOf('%') !== -1;
  }

  private _isAutoSize(which: 'start' | 'end') {
    const targetSize = which === 'start' ? this._startSize : this._endSize;
    return !!targetSize && targetSize === 'auto';
  }

  private _handleResizePanes(
    direction: -1 | 1,
    validOrientation: 'horizontal' | 'vertical'
  ) {
    if (this._resizeDisallowed || this.orientation !== validOrientation) {
      return;
    }
    const delta = 10 * direction * (isLTR(this) ? 1 : -1);

    this._resizeStart();
    this._resizing(delta);
    this._resizeEnd(delta);
    return true;
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
    target === 'start'
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
    };
  }

  private _resizing(delta: number) {
    let [paneSize, siblingSize] = this._calcNewSizes(delta);
    const totalSize = this.getTotalSize();
    [paneSize, siblingSize] = this._fitInSplitter(
      totalSize,
      paneSize,
      siblingSize,
      delta
    );

    this.startSize = `${paneSize}px`;
    this.endSize = `${siblingSize}px`;

    this.emitEvent('igcResizing', {
      detail: { pane: this._startPane, sibling: this._endPane },
    });
  }

  private _resizeEnd(delta: number) {
    if (!this._resizeState) return;
    let [paneSize, siblingSize] = this._calcNewSizes(delta);
    const totalSize = this.getTotalSize();

    [paneSize, siblingSize] = this._fitInSplitter(
      totalSize,
      paneSize,
      siblingSize,
      delta
    );

    if (this._resizeState.startPane.isPercentageBased) {
      // handle % resizes
      const percentPaneSize = (paneSize / totalSize) * 100;
      this.startSize = `${percentPaneSize}%`;
    } else {
      // px resize
      this.startSize = `${paneSize}px`;
    }

    if (this._resizeState.endPane.isPercentageBased) {
      // handle % resizes
      const percentSiblingSize = (siblingSize / totalSize) * 100;
      this.endSize = `${percentSiblingSize}%`;
    } else {
      // px resize
      this.endSize = `${siblingSize}px`;
    }
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

  private _fitInSplitter(
    total: number,
    startSize: number,
    endSize: number,
    delta: number
  ): [number, number] {
    let newStartSize = startSize;
    let newEndSize = endSize;
    if (startSize + endSize > total && delta > 0) {
      newEndSize = total - newStartSize;
    } else if (newStartSize + newEndSize > total && delta < 0) {
      newStartSize = total - newEndSize;
    }
    return [newStartSize, newEndSize];
  }

  // TODO: handle RTL
  private _calcNewSizes(delta: number): [number, number] {
    if (!this._resizeState) return [0, 0];

    let finalDelta: number;
    const min = Number.parseInt(this.startMinSize ?? '0', 10) || 0;
    const minSibling = Number.parseInt(this.endMinSize ?? '0', 10) || 0;
    const max =
      Number.parseInt(this.startMaxSize ?? '0', 10) ||
      this._resizeState.startPane.initialSize +
        this._resizeState.endPane.initialSize -
        minSibling;
    const maxSibling =
      Number.parseInt(this.endMaxSize ?? '0', 10) ||
      this._resizeState.startPane.initialSize +
        this._resizeState.endPane.initialSize -
        min;

    if (delta < 0) {
      const maxPossibleDelta = Math.min(
        this._resizeState.startPane.initialSize - min,
        maxSibling - this._resizeState.endPane.initialSize
      );
      finalDelta = Math.min(maxPossibleDelta, Math.abs(delta)) * -1;
    } else {
      const maxPossibleDelta = Math.min(
        max - this._resizeState.startPane.initialSize,
        this._resizeState.endPane.initialSize - minSibling
      );
      finalDelta = Math.min(maxPossibleDelta, Math.abs(delta));
    }
    return [
      this._resizeState.startPane.initialSize + finalDelta,
      this._resizeState.endPane.initialSize - finalDelta,
    ];
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
    const commonStyles = {
      minWidth: 0,
      maxWidth: '100%',
      minHeight: 0,
      maxHeight: '100%',
    };
    Object.assign(this._startPaneInternalStyles, {
      ...commonStyles,
      flex: this._startFlex,
    });
    Object.assign(this._endPaneInternalStyles, {
      ...commonStyles,
      flex: this._endFlex,
    });
  }

  private _initPanes() {
    const isHorizontal = this.orientation === 'horizontal';
    const minProp = isHorizontal ? 'minWidth' : 'minHeight';
    const maxProp = isHorizontal ? 'maxWidth' : 'maxHeight';

    const startSizes = {
      [minProp]: this.startMinSize ?? 0,
      [maxProp]: this.startMaxSize ?? '100%',
    };

    const endSizes = {
      [minProp]: this.endMinSize ?? 0,
      [maxProp]: this.endMaxSize ?? '100%',
    };

    Object.assign(this._startPaneInternalStyles, {
      ...startSizes,
      flex: this._startFlex,
    });
    Object.assign(this._endPaneInternalStyles, {
      ...endSizes,
      flex: this._endFlex,
    });
    this.requestUpdate();
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
