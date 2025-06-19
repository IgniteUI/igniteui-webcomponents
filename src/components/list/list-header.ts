import { html, LitElement } from 'lit';
import { addThemingController } from '../../theming/theming-controller.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/header.base.css.js';
import { all } from './themes/header.js';
import { styles as shared } from './themes/shared/header/list-header.common.css.js';

/**
 * Header list item.
 *
 * @element igc-list-header
 *
 * @slot - Renders header list item's content.
 */
export default class IgcListHeaderComponent extends LitElement {
  public static readonly tagName = 'igc-list-header';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcListHeaderComponent);
  }

  constructor() {
    super();

    addThemingController(this, all);

    addInternalsController(this, {
      initialARIA: { role: 'separator' },
    });
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-list-header': IgcListHeaderComponent;
  }
}
