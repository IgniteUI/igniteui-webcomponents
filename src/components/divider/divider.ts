import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/divider.base.css.js';

/**
 * The igc-divider allows the content author to easily create a horizontal/vertical rule as a break between content to better organize information on a page.
 *
 * @element igc-divider
 *
 */

/**
 * Enum for the type, determining if the divider is solid or dashed.
 */

export default class IgcDividerComponent extends LitElement {
  public static readonly tagName = 'igc-divider';
  public static override styles = [styles];

  private _internals: ElementInternals;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcDividerComponent);
  }

  /**
   * Determines Whether to render a vertical divider line.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public vertical = false;

  /**
   * When set and inset is provided, it will shrink the divider line from both sides.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public middle = false;

  /**
   * Determines whether to render a solid or a dashed divider line.
   * @attr
   */

  @property({ reflect: true })
  public type: 'solid' | 'dashed' = 'solid';

  constructor() {
    super();
    this._internals = this.attachInternals();

    this._internals.role = 'separator';
    this._internals.ariaOrientation = this.vertical ? 'vertical' : 'horizontal';
  }

  protected override render() {
    return html`
      <hr>
      </hr>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-divider': IgcDividerComponent;
  }
}
