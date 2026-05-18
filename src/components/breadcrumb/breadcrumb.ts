import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { breadcrumbsContext } from '../common/context.js';
import { createAsyncContext } from '../common/controllers/async-consumer.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcIconComponent from '../icon/icon.js';
import { styles } from './themes/breadcrumb.base.css.js';

/**
 * A single breadcrumb item within an `igc-breadcrumbs` list.
 *
 * @element igc-breadcrumb
 *
 * @slot - The main content of the breadcrumb, typically an anchor (`<a>`) element.
 * @slot prefix - Renders content before the main breadcrumb content.
 * @slot suffix - Renders content after the main breadcrumb content.
 * @slot separator - Overrides the default separator icon rendered after the breadcrumb item.
 *
 * @csspart label - The container wrapping the prefix, default, and suffix slots.
 * @csspart separator - The container wrapping the separator slot content.
 *
 * @cssproperty --ig-breadcrumb-link-color - The color of the breadcrumb link. Defaults to `--ig-primary-500`.
 * @cssproperty --ig-breadcrumb-link-color-hover - The hover color of the breadcrumb link. Defaults to `--ig-primary-700`.
 * @cssproperty --ig-breadcrumb-current-color - The color of the active (current) breadcrumb link. Defaults to `--ig-gray-900`.
 * @cssproperty --ig-breadcrumb-separator-color - The color of the separator. Defaults to `--ig-gray-500`.
 *
 * @example
 * ```html
 * <igc-breadcrumbs>
 *   <igc-breadcrumb>
 *     <a href="/home">Home</a>
 *   </igc-breadcrumb>
 *   <igc-breadcrumb>
 *     <a href="/products">Products</a>
 *   </igc-breadcrumb>
 *   <igc-breadcrumb current>
 *     <a href="/products/laptop">Laptop</a>
 *   </igc-breadcrumb>
 * </igc-breadcrumbs>
 * ```
 */
export default class IgcBreadcrumbComponent extends LitElement {
  public static readonly tagName = 'igc-breadcrumb';
  public static override styles = [styles];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcBreadcrumbComponent, IgcIconComponent);
  }

  //#region Internal state

  private readonly _internals = addInternalsController(this, {
    initialARIA: { role: 'listitem' },
  });

  private readonly _separatorConsumer = createAsyncContext(
    this,
    breadcrumbsContext
  );

  private get _separator(): string {
    return this._separatorConsumer.value ?? 'tree_expand';
  }

  //#endregion

  //#region Public properties

  /**
   * Marks this breadcrumb as representing the current page.
   * Sets `aria-current="page"` on the element when active.
   *
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public current = false;

  //#endregion

  //#region Lit lifecycle

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
          <igc-icon name="${this._separator}" collection="default"></igc-icon>
        </slot>
      </span>
    `;
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-breadcrumb': IgcBreadcrumbComponent;
  }
}
