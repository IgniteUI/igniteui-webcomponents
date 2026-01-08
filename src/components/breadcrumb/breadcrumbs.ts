import { css, html, LitElement } from 'lit';
import { addInternalsController } from '../common/controllers/internals.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcBreadcrumbComponent from './breadcrumb.js';

/**
 * @element igc-breadcrumbs
 *
 * @slot - Default slot where igc-breadcrumbs are slotted.
 */
export default class IgcBreadcrumbsComponent extends LitElement {
  public static readonly tagName = 'igc-breadcrumbs';

  static override styles = css`
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
  `;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcBreadcrumbsComponent, IgcBreadcrumbComponent);
  }

  constructor() {
    super();

    addInternalsController(this, {
      initialARIA: {
        role: 'list',
        ariaLabel: 'breadcrumbs',
      },
    });
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-breadcrumbs': IgcBreadcrumbsComponent;
  }
}
