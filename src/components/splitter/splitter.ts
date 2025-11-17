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

/**
 * The Splitter component provides a framework for a simple layout, splitting the view horizontally or vertically
 * into multiple smaller resizable and collapsible areas.
 *
 * @element igc-splitter
 * *
 * @fires igc... - Emitted when ... .
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

  private readonly _barRef = createRef<HTMLElement>();
  private _startPaneInternalStyles: StyleInfo = {};
  private _endPaneInternalStyles: StyleInfo = {};
  private _startSize = 'auto';
  private _endSize = 'auto';
  private _startPaneInitialSize!: number;
  private _endPaneInitialSize!: number;
  private _isStartPanePercentage = false;
  private _isEndPanePercentage = false;

  //#region Properties

  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      ariaOrientation: 'horizontal',
    },
  });

  @query('[part~="base"]', true)
  private readonly _base!: HTMLElement;

  @query('[part~="startPane"]', true)
  private readonly _startPane!: HTMLElement;

  @query('[part~="endPane"]', true)
  private readonly _endPane!: HTMLElement;

  @query('[part~="bar"]', true)
  private readonly _bar!: HTMLElement;

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

  private get _isStartPercentageSize() {
    return this._startSize.indexOf('%') !== -1;
  }

  private get _isEndPercentageSize() {
    return this._endSize.indexOf('%') !== -1;
  }

  private get _isStartAutoSize() {
    return this._startSize === 'auto';
  }

  private get _isEndAutoSize() {
    return this._endSize === 'auto';
  }

  private get _startFlex() {
    const grow = this._isStartAutoSize ? 1 : 0;
    const shrink = this._isStartAutoSize || this._isStartPercentageSize ? 1 : 0;
    return `${grow} ${shrink} ${this._startSize}`;
  }

  private get _endFlex() {
    const grow = this._isEndAutoSize ? 1 : 0;
    const shrink = this._isEndAutoSize || this._isEndPercentageSize ? 1 : 0;
    return `${grow} ${shrink} ${this._endSize}`;
  }

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

  public get startSize(): string {
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

  public get endSize(): string {
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

  //#region Internal API

  @watch('orientation', { waitUntilFirstUpdate: true })
  protected _orientationChange(): void {
    this._internals.setARIA({ ariaOrientation: this.orientation });
    this._resetPane();
  }

  @watch('startCollapsed', { waitUntilFirstUpdate: true })
  @watch('endCollapsed', { waitUntilFirstUpdate: true })
  protected _collapsedChange(): void {
    this.startSize = 'auto';
    this.endSize = 'auto';
  }

  protected override willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    if (
      changed.has('startMinSize') ||
      changed.has('startMaxSize') ||
      changed.has('endMinSize') ||
      changed.has('endMaxSize')
    ) {
      this._initPane(
        this.startMinSize!,
        this.startMaxSize!,
        this._startFlex,
        this._startPaneInternalStyles
      );
      this._initPane(
        this.endMinSize!,
        this.endMaxSize!,
        this._endFlex,
        this._endPaneInternalStyles
      );
    }
  }

  constructor() {
    super();

    addSlotController(this, {
      slots: setSlots('start', 'end'),
    });
    addKeybindings(this, {
      ref: this._barRef,
      skip: this._shouldSkipResize,
    })
      .set(arrowUp, this._handleResizePanes)
      .set(arrowDown, this._handleResizePanes)
      .set(arrowLeft, this._handleResizePanes)
      .set(arrowRight, this._handleResizePanes)
      .set([ctrlKey, arrowUp], this._handleExpandPanes)
      .set([ctrlKey, arrowDown], this._handleExpandPanes)
      .set([ctrlKey, arrowLeft], this._handleExpandPanes)
      .set([ctrlKey, arrowRight], this._handleExpandPanes);

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

  //#endregion

  /** Toggles the collapsed state of the pane. */
  public toggle(position: 'start' | 'end') {
    if (position === 'start') {
      this.startCollapsed = !this.startCollapsed;
    } else {
      this.endCollapsed = !this.endCollapsed;
    }
  }

  private _shouldSkipResize(_node: Element, event: KeyboardEvent): boolean {
    if (this._resizeDisallowed && !event.ctrlKey) {
      return true;
    }
    if (
      (event.key === arrowUp || event.key === arrowDown) &&
      this.orientation === 'horizontal' &&
      !event.ctrlKey
    ) {
      return true;
    }
    if (
      (event.key === arrowLeft || event.key === arrowRight) &&
      this.orientation === 'vertical' &&
      !event.ctrlKey
    ) {
      return true;
    }
    return false;
  }

  private _handleResizePanes(event: KeyboardEvent) {
    const delta = event.key === arrowUp || event.key === arrowLeft ? -10 : 10;

    this._resizeStart();
    this._resizing(delta);
    this._resizeEnd(delta);
    return true;
  }

  private _handleExpandPanes(event: KeyboardEvent) {
    if (this.nonCollapsible) {
      return;
    }
    const { prevButtonHidden, nextButtonHidden } =
      this._getExpanderHiddenState();

    if (
      ((event.key === arrowUp && this.orientation === 'vertical') ||
        (event.key === arrowLeft && this.orientation === 'horizontal')) &&
      !prevButtonHidden
    ) {
      this._handleExpanderClick(true);
    }
    if (
      ((event.key === arrowDown && this.orientation === 'vertical') ||
        (event.key === arrowRight && this.orientation === 'horizontal')) &&
      !nextButtonHidden
    ) {
      this._handleExpanderClick(false);
    }
  }

  private get _resizeDisallowed() {
    return this.nonResizable || this.startCollapsed || this.endCollapsed;
  }

  private _resizeStart() {
    this._isStartPanePercentage =
      this._isStartPercentageSize || this._isStartAutoSize;
    this._isEndPanePercentage =
      this._isEndPercentageSize || this._isEndAutoSize;

    [this._startPaneInitialSize, this._endPaneInitialSize] = this._rectSize();
    this.emitEvent('igcResizeStart', {
      detail: { pane: this._startPane, sibling: this._endPane },
    });
  }

  private _resizing(delta: number) {
    const [paneSize, siblingSize] = this._calcNewSizes(delta);

    this.startSize = `${paneSize}px`;
    this.endSize = `${siblingSize}px`;

    this.emitEvent('igcResizing', {
      detail: { pane: this._startPane, sibling: this._endPane },
    });
  }

  private _resizeEnd(delta: number) {
    const [paneSize, siblingSize] = this._calcNewSizes(delta);
    if (this._isStartPanePercentage) {
      // handle % resizes
      const totalSize = this.getTotalSize();
      const percentPaneSize = (paneSize / totalSize) * 100;
      this.startSize = `${percentPaneSize}%`;
    } else {
      // px resize
      this.startSize = `${paneSize}px`;
    }

    if (this._isEndPanePercentage) {
      // handle % resizes
      const totalSize = this.getTotalSize();
      const percentSiblingSize = (siblingSize / totalSize) * 100;
      this.endSize = `${percentSiblingSize}%`;
    } else {
      // px resize
      this.endSize = `${siblingSize}px`;
    }
    this.emitEvent('igcResizeEnd', {
      detail: { pane: this._startPane, sibling: this._endPane },
    });
  }

  private _rectSize() {
    const relevantDimension =
      this.orientation === 'horizontal' ? 'width' : 'height';
    const startPaneRect = this._startPane.getBoundingClientRect();
    const endPaneRect = this._endPane.getBoundingClientRect();
    return [startPaneRect[relevantDimension], endPaneRect[relevantDimension]];
  }

  private _calcNewSizes(delta: number): [number, number] {
    let finalDelta: number;
    const min = Number.parseInt(this.startMinSize ?? '0', 10) || 0;
    const minSibling = Number.parseInt(this.endMinSize ?? '0', 10) || 0;
    const max =
      Number.parseInt(this.startMaxSize ?? '0', 10) ||
      this._startPaneInitialSize + this._endPaneInitialSize - minSibling;
    const maxSibling =
      Number.parseInt(this.endMaxSize ?? '0', 10) ||
      this._startPaneInitialSize + this._endPaneInitialSize - min;

    if (delta < 0) {
      const maxPossibleDelta = Math.min(
        this._startPaneInitialSize - min,
        maxSibling - this._endPaneInitialSize
      );
      finalDelta = Math.min(maxPossibleDelta, Math.abs(delta)) * -1;
    } else {
      const maxPossibleDelta = Math.min(
        max - this._startPaneInitialSize,
        this._endPaneInitialSize - minSibling
      );
      finalDelta = Math.min(maxPossibleDelta, Math.abs(delta));
    }
    return [
      this._startPaneInitialSize + finalDelta,
      this._endPaneInitialSize - finalDelta,
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

  private _resetPane() {
    this.startSize = 'auto';
    this.endSize = 'auto';
    Object.assign(this._startPaneInternalStyles, {
      minWidth: 0,
      maxWidth: '100%',
      minHeight: 0,
      maxHeight: '100%',
      flex: this._startFlex,
    });
    Object.assign(this._endPaneInternalStyles, {
      minWidth: 0,
      maxWidth: '100%',
      minHeight: 0,
      maxHeight: '100%',
      flex: this._endFlex,
    });
  }

  private _initPane(
    minSize: string,
    maxSize: string,
    flex: string,
    internalStyles: StyleInfo
  ) {
    let sizes = {};
    if (this.orientation === 'horizontal') {
      sizes = {
        minWidth: minSize ?? 0,
        maxWidth: maxSize ?? '100%',
      };
    } else {
      sizes = {
        minHeight: minSize ?? 0,
        maxHeight: maxSize ?? '100%',
      };
    }
    Object.assign(internalStyles, { ...sizes, flex: flex });
    this.requestUpdate();
  }

  private _handleExpanderClick(start: boolean, event?: PointerEvent) {
    // Prevent resize controller from starting
    event?.stopPropagation();

    let target: 'start' | 'end';
    if (start) {
      // if prev is clicked when next pane is hidden, show next pane, else hide prev pane.
      target = this.endCollapsed ? 'end' : 'start';
    } else {
      // if next is clicked when prev pane is hidden, show prev pane, else hide next pane.
      target = this.startCollapsed ? 'start' : 'end';
    }
    this.toggle(target);
  }

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
        part="expander-start"
        ?hidden=${prevButtonHidden}
        @pointerdown=${(e: PointerEvent) => this._handleExpanderClick(true, e)}
      ></div>
      <div part="handle"></div>
      <div
        part="expander-end"
        ?hidden=${nextButtonHidden}
        @pointerdown=${(e: PointerEvent) => this._handleExpanderClick(false, e)}
      ></div>
    `;
  }

  protected override render() {
    return html`
      <div part="base">
        <div part="startPane" style=${styleMap(this._startPaneInternalStyles)}>
          <slot name="start"></slot>
        </div>
        <div ${ref(this._barRef)} part="bar" tabindex="0">
          ${this._renderBarControls()}
        </div>
        <div part="endPane" style=${styleMap(this._endPaneInternalStyles)}>
          <slot name="end"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter': IgcSplitterComponent;
  }
}
