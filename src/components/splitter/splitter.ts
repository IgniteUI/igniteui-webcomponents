import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { registerComponent } from '../common/definitions/register.js';
import type { SplitterOrientation } from '../types.js';
import IgcSplitterPaneComponent from './splitter-pane.js';

export default class IgcSplitterComponent extends LitElement {
  public static readonly tagName = 'igc-splitter';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSplitterComponent, IgcSplitterPaneComponent);
  }

  /** Returns all of the splitter's panes. */
  @queryAssignedElements({ selector: 'igc-splitter-pane' })
  public panes!: Array<IgcSplitterPaneComponent>;

  /** Gets/Sets the orientation of the stepper.
   *
   * @remarks
   * Default value is `horizontal`.
   */
  @property({ reflect: true })
  public orientation: SplitterOrientation = 'horizontal';

  // constructor() {
  //   super();
  // }

  private _onSlotChange = () => {
    // panes updates after slot distribution; trigger re-render
    this.requestUpdate();
  };

  private _renderBar() {
    return html` <igc-splitter-bar></igc-splitter-bar> `;
  }

  protected override render() {
    return html`
      <slot @slotchange=${this._onSlotChange}></slot>
      ${this.panes.slice(0, -1).map(() => html` ${this._renderBar()} `)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter': IgcSplitterComponent;
  }
}
