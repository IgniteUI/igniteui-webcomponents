import { html, LitElement } from 'lit';
import { addInternalsController } from '#internals/controllers/internals.js';
import { registerComponent } from '#internals/definitions/register.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles } from '../dropdown/themes/dropdown-header.base.css.js';
import { all } from '../dropdown/themes/header.js';
import { styles as shared } from '../dropdown/themes/shared/header/dropdown-header.common.css.js';

/**
 * Represents a header item in a select component.
 *
 * @element igc-select-header
 *
 * @slot - Renders the header.
 */
export default class IgcSelectHeaderComponent extends LitElement {
  public static readonly tagName = 'igc-select-header';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcSelectHeaderComponent);
  }

  constructor() {
    super();

    // A `listbox` may only own `option` and `group` nodes, so this purely
    // visual separator is taken out of the accessibility tree.
    addInternalsController(this, { initialARIA: { role: 'presentation' } });
    addThemingController(this, all);
  }

  /** @internal */
  public override connectedCallback(): void {
    // R.K. Workaround for Axe accessibility unit tests.
    // I guess it does not support ElementInternals ARIAMixin state yet
    super.connectedCallback();
    this.role = 'presentation';
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-header': IgcSelectHeaderComponent;
  }
}
