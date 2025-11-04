import { html, LitElement } from 'lit';
import { registerComponent } from '../common/definitions/register.js';

export default class IgcSplitterBarComponent extends LitElement {
  public static readonly tagName = 'igc-splitter-bar';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSplitterBarComponent);
  }

  // constructor() {
  //   super();
  //   //addThemingController(this, all);
  // }

  protected override render() {
    return html`
      <div>
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
