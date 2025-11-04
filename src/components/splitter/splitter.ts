import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { addSlotController } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import type { SplitterOrientation } from '../types.js';
import IgcSplitterBarComponent from './splitter-bar.js';
import IgcSplitterPaneComponent from './splitter-pane.js';
import { styles } from './themes/splitter.base.css.js';

export default class IgcSplitterComponent extends LitElement {
  public static readonly tagName = 'igc-splitter';
  public static override styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcSplitterComponent,
      IgcSplitterPaneComponent,
      IgcSplitterBarComponent
    );
  }

  private readonly _slots = addSlotController(this, {
    onChange: this._handleSlotChange,
  });

  /** Returns all of the splitter's panes. */
  @queryAssignedElements({ selector: 'igc-splitter-pane' })
  public panes!: Array<IgcSplitterPaneComponent>;

  /** Gets/Sets the orientation of the splitter.
   *
   * @remarks
   * Default value is `horizontal`.
   */
  @property({ reflect: true })
  public orientation: SplitterOrientation = 'horizontal';

  protected _handleSlotChange(): void {
    this._assignFlexOrder();
  }

  private _assignFlexOrder() {
    let k = 0;
    this.panes.forEach((pane) => {
      pane.order = k;
      k += 2;
    });
  }

  private _renderBar(order: number) {
    return html` <igc-splitter-bar .order=${order}></igc-splitter-bar> `;
  }

  protected override render() {
    return html`
      <slot></slot>
      ${this.panes.map((pane, i) => {
        const isLast = i === this.panes.length - 1;
        return html`${!isLast ? this._renderBar(pane.order + 1) : ''}`;
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter': IgcSplitterComponent;
  }
}
