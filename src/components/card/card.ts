import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { DynamicTheme, theme } from '../../theming';

/** A container which wraps different elements related to a single subject
 * @element igc-card
 *
 * @slot - Renders card content
 */
export default class IgcCardComponent extends LitElement {
  @theme({
    material: './card/themes/light/card.material.scss',
    bootstrap: './card/themes/light/card.bootstrap.scss',
    fluent: './card/themes/light/card.fluent.scss',
    indigo: './card/themes/light/card.material.scss',
  })
  protected theme!: DynamicTheme;
  public static readonly tagName = 'igc-card';

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
