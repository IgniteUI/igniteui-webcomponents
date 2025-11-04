import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '../common/definitions/register.js';
import { asNumber } from '../common/util.js';

export default class IgcSplitterPaneComponent extends LitElement {
  public static readonly tagName = 'igc-splitter-pane';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSplitterPaneComponent);
  }

  private _order = -1;

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

  // constructor() {
  //   super();
  //   //addThemingController(this, all);
  // }

  protected override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter-pane': IgcSplitterPaneComponent;
  }
}
