import { ContextConsumer } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { splitterContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import type { SplitterOrientation } from '../types.js';
import type IgcSplitterComponent from './splitter.js';
import IgcSplitterBarComponent from './splitter-bar.js';
import { styles } from './themes/splitter-pane.css.js';

export default class IgcSplitterPaneComponent extends LitElement {
  public static readonly tagName = 'igc-splitter-pane';
  public static override styles = [styles];

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

  private get _isPercentageSize() {
    return this._size === 'auto' || this._size.indexOf('%') !== -1;
  }

  private get _splitter(): IgcSplitterComponent | undefined {
    return this._splitterContext.value;
  }

  private get _flex() {
    //const size = this.dragSize || this.size;
    //const grow = this.isPercentageSize && !this.dragSize ? 1 : 0;

    const grow = this._isPercentageSize ? 1 : 0;
    return `${grow} ${grow} ${this._size}`;
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

  private paneBefore!: IgcSplitterPaneComponent;
  private paneAfter!: IgcSplitterPaneComponent;
  private initialPaneBeforeSize!: number;
  private initialPaneAfterSize!: number;
  private isPaneBeforePercentage = false;
  private isPaneAfterPercentage = false;

  private _handleMovingStart(event: CustomEvent<IgcSplitterPaneComponent>) {
    // Only handle if this is the pane that owns the bar
    if (event.detail !== this) {
      return;
    }

    // Handle the moving start event
    const panes = this._splitter!.panes;
    this.paneBefore = this;
    this.paneAfter = panes[panes.indexOf(this) + 1];

    // Store original size types before we start changing them
    this.isPaneBeforePercentage = this.paneBefore._isPercentageSize;
    this.isPaneAfterPercentage = this.paneAfter._isPercentageSize;

    const paneBeforeBase =
      this.paneBefore.shadowRoot?.querySelector('[part="base"]');
    const paneAfterBase =
      this.paneAfter.shadowRoot?.querySelector('[part="base"]');

    const paneRect = paneBeforeBase!.getBoundingClientRect();
    this.initialPaneBeforeSize =
      this._orientation === 'horizontal' ? paneRect.width : paneRect.height;

    const siblingRect = paneAfterBase!.getBoundingClientRect();
    this.initialPaneAfterSize =
      this._orientation === 'horizontal'
        ? siblingRect.width
        : siblingRect.height;
  }

  private _handleMoving(event: CustomEvent<number>) {
    // Only handle if this pane owns the bar (is the one before the bar)
    if (!this.paneBefore || this.paneBefore !== this) {
      return;
    }

    const [paneSize, siblingSize] = this._calcNewSizes(event.detail);

    this.paneBefore.size = `${paneSize}px`;
    this.paneAfter.size = `${siblingSize}px`;
  }

  private _handleMovingEnd(event: CustomEvent<number>) {
    // Only handle if this pane owns the bar (is the one before the bar)
    if (!this.paneBefore || this.paneBefore !== this) {
      return;
    }

    const [paneSize, siblingSize] = this._calcNewSizes(event.detail);

    if (this.isPaneBeforePercentage) {
      // handle % resizes
      const totalSize = this.getTotalSize();
      const percentPaneSize = (paneSize / totalSize) * 100;
      this.paneBefore.size = `${percentPaneSize}%`;
    } else {
      // px resize
      this.paneBefore.size = `${paneSize}px`;
    }

    if (this.isPaneAfterPercentage) {
      // handle % resizes
      const totalSize = this.getTotalSize();
      const percentPaneSize = (paneSize / totalSize) * 100;
      this.paneBefore.size = `${percentPaneSize}%`;
    } else {
      // px resize
      this.paneAfter.size = `${siblingSize}px`;
    }
  }

  private _calcNewSizes(delta: number): [number, number] {
    let finalDelta: number;
    const min = Number.parseInt(this.paneBefore.minSize ?? '0', 10) || 0;
    const minSibling = Number.parseInt(this.paneAfter.minSize ?? '0', 10) || 0;
    const max =
      Number.parseInt(this.paneBefore.maxSize ?? '0', 10) ||
      this.initialPaneBeforeSize + this.initialPaneAfterSize - minSibling;
    const maxSibling =
      Number.parseInt(this.paneAfter.maxSize ?? '0', 10) ||
      this.initialPaneBeforeSize + this.initialPaneAfterSize - min;

    if (delta < 0) {
      const maxPossibleDelta = Math.min(
        this.initialPaneBeforeSize - min,
        maxSibling - this.initialPaneAfterSize
      );
      finalDelta = Math.min(maxPossibleDelta, Math.abs(delta)) * -1;
    } else {
      const maxPossibleDelta = Math.min(
        max - this.initialPaneBeforeSize,
        this.initialPaneAfterSize - minSibling
      );
      finalDelta = Math.min(maxPossibleDelta, Math.abs(delta));
    }
    return [
      this.initialPaneBeforeSize + finalDelta,
      this.initialPaneAfterSize - finalDelta,
    ];
  }

  private getTotalSize() {
    if (!this._splitter) {
      return 0;
    }
    // get the size of part base
    const splitterBase =
      this._splitter.shadowRoot?.querySelector('[part="base"]');
    if (!splitterBase) {
      return 0;
    }
    const rect = splitterBase.getBoundingClientRect();
    return this._orientation === 'horizontal' ? rect.width : rect.height;
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
