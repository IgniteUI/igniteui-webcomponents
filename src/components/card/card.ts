import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { themes } from '../../theming';
import { styles as bootstrap } from './themes/light/card.bootstrap.css';
import { styles as fluent } from './themes/light/card.fluent.css';
import { styles } from './themes/light/card.material.css';

/** A container which wraps different elements related to a single subject
 * @element igc-card
 *
 * @slot - Renders card content
 */
@themes({
  bootstrap,
  fluent,
})
export default class IgcCardComponent extends LitElement {
  public static readonly tagName = 'igc-card';
  public static override styles = styles;

  /** Sets card elevated style, otherwise card looks outlined. */
  @property({ type: Boolean, reflect: true })
  public elevated = false;

  protected override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card': IgcCardComponent;
  }
}
