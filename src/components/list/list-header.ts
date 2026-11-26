import { html, LitElement, type TemplateResult } from 'lit';
import { listContext } from '#internals/context.js';
import { addAsyncContextConsumer } from '#internals/controllers/async-consumer.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { registerComponent } from '#internals/definitions/register.js';
import { all } from '#themes/list/themes/header.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles } from './themes/header.base.css.js';
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

  private readonly _context = addAsyncContextConsumer(this, listContext);

  constructor() {
    super();

    addThemingController(this, all);

    // A list owns only list items. A separator would also hide the content of
    // the header. In a navigating list, it is hidden and describes its items.
    addInternalsController(this, {
      initialARIA: { role: 'listitem' },
      aria: () => ({
        ariaHidden: this._context.value?.navigates(this) ? 'true' : null,
      }),
    });
  }

  protected override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-list-header': IgcListHeaderComponent;
  }
}
