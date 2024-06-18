import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/divider.base.css.js';
import { styles as shared } from './themes/shared/divider.common.css.js';
import { all } from './themes/themes.js';

/**
 * The igc-divider allows the content author to easily create a horizontal/vertical rule as a break between content to better organize information on a page.
 *
 * @element igc-divider
 *
 */

@themes(all)
export default class IgcDividerComponent extends LitElement {
  public static readonly tagName = 'igc-divider';
  public static override styles = [styles, shared];

  private _internals: ElementInternals;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcDividerComponent);
  }

  /**
   * Whether to render a vertical divider line.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  private _vertical = false;

  get vertical() {
    return this._vertical;
  }

  set vertical(value) {
    const oldValue = this._vertical;
    this._vertical = value;
    this.requestUpdate('vertical', oldValue);
    this._internals.ariaOrientation = this._vertical
      ? 'vertical'
      : 'horizontal';
  }

  /**
   * When set and inset is provided, it will shrink the divider line from both sides.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public middle = false;

  /**
   * Whether to render a solid or a dashed divider line.
   * @attr
   */

  @property({ reflect: true })
  public type: 'solid' | 'dashed' = 'solid';

  constructor() {
    super();
    this._internals = this.attachInternals();

    this._internals.role = 'separator';
    this._internals.ariaOrientation = this._vertical
      ? 'vertical'
      : 'horizontal';
  }

  protected override render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-divider': IgcDividerComponent;
  }
}
