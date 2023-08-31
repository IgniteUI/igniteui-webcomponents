import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles as bootstrap } from './themes/light/navbar.bootstrap.css.js';
import { styles as fluent } from './themes/light/navbar.fluent.css.js';
import { styles as indigo } from './themes/light/navbar.indigo.css.js';
import { styles as material } from './themes/light/navbar.material.css.js';
import { styles } from './themes/navbar.base.css.js';

/**
 * A navigation bar component is used to facilitate navigation through
 * a series of hierarchical screens within an app.
 *
 * @element igc-navbar
 *
 * @slot - Renders a title inside the default slot.
 * @slot start - Renders left aligned icons.
 * @slot end - Renders right aligned action icons.
 *
 * @csspart base - The base wrapper of the navigation bar.
 * @csspart start - The left aligned icon container.
 * @csspart middle - The navigation bar title container.
 * @csspart end - The right aligned action icons container.
 */
@themes({ material, bootstrap, fluent, indigo })
export default class IgcNavbarComponent extends LitElement {
  public static readonly tagName = 'igc-navbar';
  public static override styles = styles;

  public static register() {
    registerComponent(this);
  }

  protected override render() {
    return html`
      <div part="base">
        <span part="start">
          <slot name="start"></slot>
        </span>
        <span part="middle">
          <slot></slot>
        </span>
        <span part="end">
          <slot name="end"></slot>
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-navbar': IgcNavbarComponent;
  }
}
