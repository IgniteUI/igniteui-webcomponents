import { css, html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcIconComponent from '../icon/icon.js';

/**
 * @element igc-breadcrumb
 *
 * @slot - Default slot for the breadcrumb item. One will usually put an anchor tag here.
 * @slot prefix - Renders content before the default content of the breadcrumb item.
 * @slot suffix - Renders content after the default content of the breadcrumb item.
 * @slot separator - Renders a custom separator content after the breadcrumb item.
 */
export default class IgcBreadcrumbComponent extends LitElement {
  public static readonly tagName = 'igc-breadcrumb';

  static override styles = css`
    :host {
      display: inline-flex;
      flex: 0 0 auto;
      gap: 0.5rem;

      ::slotted(a) {
        color: var(--ig-primary-500);
        text-decoration: none;
      }
    }

    [part='separator'] {
      &:dir(rtl) igc-icon,
      &:dir(rtl) ::slotted(igc-icon) {
        transform: rotateY(180deg);
      }
    }

    :host([current]) {
      ::slotted(a) {
        color: var(--ig-gray-900);
      }
    }

    :host(:last-of-type) [part='separator'] {
      display: none;
    }
  `;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcBreadcrumbComponent, IgcIconComponent);
  }

  private readonly _internals = addInternalsController(this, {
    initialARIA: { role: 'listitem' },
  });

  @property({ type: Boolean, reflect: true })
  public current = false;

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('current')) {
      this._internals.setARIA({ ariaCurrent: this.current ? 'page' : null });
    }
  }

  protected override render() {
    return html`
      <span part="label">
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </span>
      <span part="separator">
        <slot name="separator">
          <igc-icon name="tree_expand" collection="default"></igc-icon>
        </slot>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-breadcrumb': IgcBreadcrumbComponent;
  }
}
