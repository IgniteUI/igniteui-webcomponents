import { html, LitElement } from 'lit';
import { registerComponent } from '../common/definitions/register.js';

export default class IgcSplitterPaneComponent extends LitElement {
  public static readonly tagName = 'igc-splitter-pane';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSplitterPaneComponent);
  }

  // constructor() {
  //   super();
  //   //addThemingController(this, all);
  // }

  protected override render() {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter-pane': IgcSplitterPaneComponent;
  }
}
