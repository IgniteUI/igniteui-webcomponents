import { LitElement, html } from 'lit';

import { styles } from './themes/light/card.content.base.css.js';
import { styles as bootstrap } from './themes/light/card.content.bootstrap.css.js';
import { styles as fluent } from './themes/light/card.content.fluent.css.js';
import { styles as indigo } from './themes/light/card.content.indigo.css.js';
import { styles as material } from './themes/light/card.content.material.css.js';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';

/** A container for card's text content
 * @element igc-card-content
 *
 * @slot - Renders the card text content
 */
@themes({
  light: {
    material,
    bootstrap,
    fluent,
    indigo,
  },
  dark: {
    material,
    bootstrap,
    fluent,
    indigo,
  },
})
export default class IgcCardContentComponent extends LitElement {
  public static readonly tagName = 'igc-card-content';
  public static override styles = styles;

  public static register() {
    registerComponent(this);
  }

  protected override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-card-content': IgcCardContentComponent;
  }
}
