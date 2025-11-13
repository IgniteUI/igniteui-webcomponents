import { ContextConsumer } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { splitterContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import type { SplitterOrientation } from '../types.js';
import type IgcSplitterComponent from './splitter.js';
import IgcSplitterBarComponent from './splitter-bar.js';
import { styles } from './themes/splitter-pane.css.js';

export interface IgcSplitterPaneComponentEventMap {
  igcToggle: CustomEvent<IgcSplitterPaneComponent>;
}
export default class IgcSplitterPaneComponent extends EventEmitterMixin<
  IgcSplitterPaneComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-splitter-pane';
  public static styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSplitterPaneComponent, IgcSplitterBarComponent);
  }

  private _splitterContext = new ContextConsumer(this, {
    context: splitterContext,
    subscribe: true,
    callback: (value) => {
      this._handleContextChange(value);
    },
  });

  private _internalStyles: StyleInfo = {};
  private _minSize?: string;
  private _maxSize?: string;
  private _size = 'auto';
  private _collapsed = false;
  private _orientation?: SplitterOrientation;

  private _prevPane!: IgcSplitterPaneComponent;
  private _nextPane!: IgcSplitterPaneComponent;
  private _prevPaneInitialSize!: number;
  private _nextPaneInitialSize!: number;
  private _isPrevPanePercentage = false;
  private _isNextPanePercentage = false;

  @query('[part~="base"]', true)
  private readonly _base!: HTMLElement;

  private get _splitter(): IgcSplitterComponent | undefined {
    return this._splitterContext.value;
  }

  private get _isPercentageSize() {
    return this._size.indexOf('%') !== -1;
  }

  private get _isAutoSize() {
    return this._size === 'auto';
  }

  private get _flex() {
    const grow = this._isAutoSize ? 1 : 0;
    const shrink = this._isAutoSize || this._isPercentageSize ? 1 : 0;
    return `${grow} ${shrink} ${this._size}`;
  }

  private get _rectSize() {
    const relevantDimension =
      this._orientation === 'horizontal' ? 'width' : 'height';
    const paneRect = this._base.getBoundingClientRect();
    return paneRect[relevantDimension];
  }

  /**
   * The minimum size of the pane.
   * @attr
   */
  @property({ attribute: 'min-size', reflect: true })
  public set minSize(value: string) {
    this._minSize = value;
    this._initPane();
  }

  public get minSize(): string | undefined {
    return this._minSize;
  }

  /**
   * The maximum size of the pane.
   * @attr
   */
  @property({ attribute: 'max-size', reflect: true })
  public set maxSize(value: string) {
    this._maxSize = value;
    this._initPane();
  }

  public get maxSize(): string | undefined {
    return this._maxSize;
  }

  /**
   * The size of the pane.
   * @attr
   */
  @property({ reflect: true })
  public set size(value: string) {
    this._size = value;
    Object.assign(this._internalStyles, {
      flex: this._flex,
    });
  }

  public get size(): string {
    return this._size;
  }

  /**
   * Defines if the pane is resizable or not.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public resizable = true;

  /**
   * Collapsed state of the pane.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public set collapsed(value: boolean) {
    if (this._splitter) {
      // reset sibling sizes when pane collapse state changes.
      this._splitter.panes.forEach((pane) => {
        pane.size = 'auto';
      });
    }
    this._collapsed = value;
  }

  public get collapsed(): boolean {
    return this._collapsed;
  }

  // constructor() {
  //   super();
  //   //addThemingController(this, all);
  // }

  protected override firstUpdated() {
    this._initPane();
  }

  private _handleContextChange(splitter: IgcSplitterComponent) {
    if (this._orientation && this._orientation !== splitter.orientation) {
      this._resetPane();
    }
    this._orientation = splitter.orientation;
    this.requestUpdate();
  }

  private _resetPane() {
    this.size = 'auto';
    Object.assign(this._internalStyles, {
      minWidth: 0,
      maxWidth: '100%',
      minHeight: 0,
      maxHeight: '100%',
      flex: this._flex,
    });
  }

  private _initPane() {
    let sizes = {};
    if (this._orientation === 'horizontal') {
      sizes = {
        minWidth: this.minSize ?? 0,
        maxWidth: this.maxSize ?? '100%',
      };
    } else {
      sizes = {
        minHeight: this.minSize ?? 0,
        maxHeight: this.maxSize ?? '100%',
      };
    }
    Object.assign(this._internalStyles, { ...sizes, flex: this._flex });
    this.requestUpdate();
  }

  private _handleMovingStart(event: CustomEvent<IgcSplitterPaneComponent>) {
    if (event.detail !== this) {
      return;
    }

    const panes = this._splitter!.panes;
    this._prevPane = this;
    this._nextPane = panes[panes.indexOf(this) + 1];

    // Store original size types before we start changing them
    this._isPrevPanePercentage =
      this._prevPane._isPercentageSize || this._prevPane._isAutoSize;
    this._isNextPanePercentage =
      this._nextPane._isPercentageSize || this._nextPane._isAutoSize;

    this._prevPaneInitialSize = this._rectSize;
    this._nextPaneInitialSize = this._nextPane._rectSize;

    this._splitter!.emitEvent('igcResizeStart', {
      detail: { pane: this, sibling: this._nextPane },
    });
  }

  private _handleMoving(event: CustomEvent<number>) {
    const [paneSize, siblingSize] = this._calcNewSizes(event.detail);

    this._prevPane.size = `${paneSize}px`;
    this._nextPane.size = `${siblingSize}px`;

    this._splitter!.emitEvent('igcResizing', {
      detail: { pane: this, sibling: this._nextPane },
    });
  }

  private _handleMovingEnd(event: CustomEvent<number>) {
    const [paneSize, siblingSize] = this._calcNewSizes(event.detail);

    const totalSize = this.getTotalSize();

    this._adjustPaneSize(
      this._prevPane,
      this._isPrevPanePercentage,
      paneSize,
      totalSize
    );
    this._adjustPaneSize(
      this._nextPane,
      this._isNextPanePercentage,
      siblingSize,
      totalSize
    );

    this._splitter!.panes.filter(
      (pane) => pane !== this && pane !== this._nextPane
    ).forEach((pane) => {
      const size = pane._rectSize;
      this._adjustPaneSize(
        pane,
        pane._isPercentageSize || pane._isAutoSize,
        size,
        totalSize
      );
    });

    this._splitter!.emitEvent('igcResizeEnd', {
      detail: { pane: this, sibling: this._nextPane },
    });
  }

  private _adjustPaneSize(
    pane: IgcSplitterPaneComponent,
    isPercentOrAuto: boolean,
    size: number,
    totalSize: number
  ) {
    if (isPercentOrAuto) {
      const percentPaneSize = (size / totalSize) * 100;
      pane.size = `${percentPaneSize}%`;
    } else {
      pane.size = `${size}px`;
    }
  }

  private _calcNewSizes(delta: number): [number, number] {
    let finalDelta: number;
    const min = Number.parseInt(this._prevPane.minSize ?? '0', 10) || 0;
    const minSibling = Number.parseInt(this._nextPane.minSize ?? '0', 10) || 0;
    const max =
      Number.parseInt(this._prevPane.maxSize ?? '0', 10) ||
      this._prevPaneInitialSize + this._nextPaneInitialSize - minSibling;
    const maxSibling =
      Number.parseInt(this._nextPane.maxSize ?? '0', 10) ||
      this._prevPaneInitialSize + this._nextPaneInitialSize - min;

    if (delta < 0) {
      const maxPossibleDelta = Math.min(
        this._prevPaneInitialSize - min,
        maxSibling - this._nextPaneInitialSize
      );
      finalDelta = Math.min(maxPossibleDelta, Math.abs(delta)) * -1;
    } else {
      const maxPossibleDelta = Math.min(
        max - this._prevPaneInitialSize,
        this._nextPaneInitialSize - minSibling
      );
      finalDelta = Math.min(maxPossibleDelta, Math.abs(delta));
    }
    return [
      this._prevPaneInitialSize + finalDelta,
      this._nextPaneInitialSize - finalDelta,
    ];
  }

  private getTotalSize() {
    if (!this._splitter) {
      return 0;
    }
    const splitterBase =
      this._splitter.shadowRoot?.querySelector('[part="base"]');
    if (!splitterBase) {
      return 0;
    }

    const bar = this.shadowRoot?.querySelector('igc-splitter-bar');
    const barSize = bar
      ? Number.parseInt(
          getComputedStyle(bar).getPropertyValue('--bar-size').trim(),
          10
        ) || 0
      : 0;

    const rect = splitterBase.getBoundingClientRect();
    const barsLength = this._splitter.panes.length - 1;
    const barsSize = barsLength * barSize;
    const size = this._orientation === 'horizontal' ? rect.width : rect.height;
    return size - barsSize;
  }

  /** Toggles the collapsed state of the pane. */
  public toggle() {
    this.collapsed = !this.collapsed;
  }

  private get _isLastPane(): boolean {
    if (!this._splitter || !this._splitter.panes) {
      return false;
    }
    const panes = this._splitter.panes;
    return panes.indexOf(this) === panes.length - 1;
  }

  private _renderBar() {
    return html`
      <igc-splitter-bar
        @igcMovingStart=${this._handleMovingStart}
        @igcMoving=${this._handleMoving}
        @igcMovingEnd=${this._handleMovingEnd}
      ></igc-splitter-bar>
    `;
  }

  protected override render() {
    return html`
      <div part="base" style=${styleMap(this._internalStyles)}>
        <slot></slot>
      </div>
      ${this._isLastPane ? nothing : this._renderBar()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter-pane': IgcSplitterPaneComponent;
  }
}
