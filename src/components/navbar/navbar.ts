import { html, LitElement } from 'lit';
import { themes } from '../../theming';

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
@themes({
  material: './navbar/navbar.material.scss',
  bootstrap: './navbar/navbar.bootstrap.scss',
  fluent: './navbar/navbar.fluent.scss',
  indigo: './navbar/navbar.indigo.scss',
})
export default class IgcNavbarComponent extends LitElement {
  public static readonly tagName = 'igc-navbar';

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
