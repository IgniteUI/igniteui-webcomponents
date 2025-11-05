import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '../common/definitions/register.js';
import { asNumber } from '../common/util.js';
import type IgcSplitterComponent from './splitter.js';

export default class IgcSplitterPaneComponent extends LitElement {
  public static readonly tagName = 'igc-splitter-pane';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSplitterPaneComponent);
  }

  private _order = -1;
  private _minSize?: string;
  private _maxSize?: string;
  private _size = 'auto';
  private _collapsed = false;
  private _minWidth?: string;
  private _minHeight?: string;
  private _maxWidth?: string;
  private _maxHeight?: string;

  /** @hidden @internal */
  public owner: IgcSplitterComponent | undefined;

  /**
   * Gets/sets the pane's visual position in the layout.
   * @hidden @internal
   */
  @property({ type: Number })
  public set order(value: number) {
    this._order = asNumber(value);
    this.style.order = this._order.toString();
  }

  public get order(): number {
    return this._order;
  }

  /**
   * The minimum size of the pane.
   * @attr
   */
  @property({ reflect: true })
  public set minSize(value: string) {
    this._minSize = value;
    this.dispatchEvent(new CustomEvent('sizeChanged', { bubbles: true }));
  }

  public get minSize(): string | undefined {
    return this._minSize;
  }

  /**
   * The maximum size of the pane.
   * @attr
   */
  @property({ reflect: true })
  public set maxSize(value: string) {
    this._maxSize = value;
    this.dispatchEvent(new CustomEvent('sizeChanged', { bubbles: true }));
  }

  public get maxSize(): string | undefined {
    return this._maxSize;
  }

  /**
   * Gets/sets the pane's minWidth.
   * @hidden @internal
   */
  @property()
  public set minWidth(value: string) {
    this._minWidth = value;
    this.style.minWidth = this._minWidth;
  }

  public get minWidth(): string | undefined {
    return this._minWidth;
  }

  /**
   * Gets/sets the pane's maxWidth.
   * @hidden @internal
   */
  @property()
  public set maxWidth(value: string) {
    this._maxWidth = value;
    this.style.maxWidth = this._maxWidth;
  }

  public get maxWidth(): string | undefined {
    return this._maxWidth;
  }

  /**
   * Gets/sets the pane's minHeight.
   * @hidden @internal
   */
  @property()
  public set minHeight(value: string) {
    this._minHeight = value;
    this.style.minHeight = this._minHeight;
  }

  public get minHeight(): string | undefined {
    return this._minHeight;
  }

  /**
   * Gets/sets the pane's maxHeight.
   * @hidden @internal
   */
  @property()
  public set maxHeight(value: string) {
    this._maxHeight = value;
    this.style.maxHeight = this._maxHeight;
  }

  public get maxHeight(): string | undefined {
    return this._maxHeight;
  }

  /**
   * Defines if the pane is resizable or not.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public resizable = true;

  /**
   * Gets/sets the pane's maxHeight.
   * @hidden @internal
   */
  @property()
  public get flex() {
    //const size = this.dragSize || this.size;
    //const grow = this.isPercentageSize && !this.dragSize ? 1 : 0;
    const grow = this.isPercentageSize ? 1 : 0;
    return `${grow} ${grow} ${this.size}`;
    //return `${0} ${0} ${this.size}`;
  }

  /**
   * The size of the pane.
   * @attr
   */
  @property({ reflect: true })
  public set size(value: string) {
    this._size = value;
    this.style.flex = this.flex;
  }

  public get size(): string {
    return this._size;
  }

  /** @hidden @internal */
  public get isPercentageSize() {
    return this.size === 'auto' || this.size.indexOf('%') !== -1;
  }

  /**
   * Collapsed state of the pane.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public set collapsed(value: boolean) {
    this._collapsed = value;
    //this.requestUpdate();
  }

  public get collapsed(): boolean {
    return this._collapsed;
  }

  // constructor() {
  //   super();
  //   //addThemingController(this, all);
  // }

  /** Toggles the collapsed state of the pane. */
  public toggle() {
    this.collapsed = !this.collapsed;
  }

  protected override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter-pane': IgcSplitterPaneComponent;
  }
}
