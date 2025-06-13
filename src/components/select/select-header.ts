import { LitElement, html } from 'lit';

import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from '../dropdown/themes/dropdown-header.base.css.js';
import { all } from '../dropdown/themes/header.js';
import { styles as shared } from '../dropdown/themes/shared/header/dropdown-header.common.css.js';

/**
 * Represents a header item in an igc-select component.
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
    addThemingController(this, all);
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
