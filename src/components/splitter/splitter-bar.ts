import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '../common/definitions/register.js';
import { asNumber } from '../common/util.js';
import { styles } from './themes/splitter.base.css.js';

export default class IgcSplitterBarComponent extends LitElement {
  public static readonly tagName = 'igc-splitter-bar';
  public static override styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSplitterBarComponent);
  }

  private _order = -1;

  /**
   * Gets/sets the bar's visual position in the layout.
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
    return html`
      <div part="base">
        <div part="expander--start"></div>
        <div part="handle"></div>
        <div part="expander--end"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter-bar': IgcSplitterBarComponent;
  }
}
