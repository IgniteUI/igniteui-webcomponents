import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { breadcrumbsContext } from '#internals/context.js';
import { createAsyncContext } from '#internals/controllers/async-consumer.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { registerComponent } from '#internals/definitions/register.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcIconComponent from '../icon/icon.js';
import { styles } from './themes/breadcrumb.base.css.js';
import { styles as shared } from './themes/shared/breadcrumb.common.css.js';
import { all } from './themes/themes.js';

/**
 * A single item within a breadcrumb navigation trail.
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
  public static override styles = [styles, shared];

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

  constructor() {
    super();
    addThemingController(this, all);
  }

  //#region Public properties

  /**
   * Marks this breadcrumb as representing the current page.
   * Sets `aria-current="page"` on the element when active.
   *
   * @attr current
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public current = false;

  /**
   * Sets the disabled state of the breadcrumb.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  //#endregion

  //#region Lit lifecycle

  protected override update(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('current')) {
      this._internals.setARIA({ ariaCurrent: this.current ? 'page' : null });
    }
    super.update(changedProperties);
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
