import { ContextProvider } from '@lit/context';
import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { breadcrumbsContext } from '../common/context.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcBreadcrumbComponent from './breadcrumb.js';
import { styles } from './themes/breadcrumbs.base.css.js';

/**
 * A breadcrumb navigation component that renders an ordered list of breadcrumb items.
 *
 * @remarks
 * Wrap `igc-breadcrumb` elements inside this component to build a navigable breadcrumb
 * trail. The component sets the ARIA `list` role on the host element. Wrap it in a
 * `<nav aria-label="...">` element to provide an accessible navigation landmark —
 * the label belongs on the `<nav>`, not the list, per the ARIA breadcrumb pattern.
 *
 * @element igc-breadcrumbs
 *
 * @slot - Default slot for `igc-breadcrumb` items.
 *
 * @cssproperty --ig-breadcrumbs-gap - The gap between breadcrumb items. Defaults to `0.5rem`.
 *
 * @example
 * ```html
 * <!-- Default separator (tree_expand icon) -->
 * <nav aria-label="Breadcrumb">
 *   <igc-breadcrumbs>
 *     <igc-breadcrumb>
 *       <a href="/home">Home</a>
 *     </igc-breadcrumb>
 *     <igc-breadcrumb>
 *       <a href="/category">Category</a>
 *     </igc-breadcrumb>
 *     <igc-breadcrumb current>
 *       <a href="/category/item">Item</a>
 *     </igc-breadcrumb>
 *   </igc-breadcrumbs>
 * </nav>
 *
 * <!-- Custom separator icon -->
 * <igc-breadcrumbs separator="chevron_right">
 *   <igc-breadcrumb><a href="/home">Home</a></igc-breadcrumb>
 *   <igc-breadcrumb current><a href="/item">Item</a></igc-breadcrumb>
 * </igc-breadcrumbs>
 * ```
 */
export default class IgcBreadcrumbsComponent extends LitElement {
  public static readonly tagName = 'igc-breadcrumbs';
  public static override styles = [styles];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcBreadcrumbsComponent, IgcBreadcrumbComponent);
  }

  //#region Internal state

  private readonly _separatorContext = new ContextProvider(this, {
    context: breadcrumbsContext,
    initialValue: 'tree_expand',
  });

  //#endregion

  //#region Public properties

  /**
   * The icon name used as the default separator between breadcrumb items.
   * Can be overridden per-item using the `separator` slot on `igc-breadcrumb`.
   *
   * @attr
   * @default 'tree_expand'
   */
  @property({ reflect: true })
  public separator = 'tree_expand';

  //#endregion

  //#region Lit lifecycle

  constructor() {
    super();

    addInternalsController(this, {
      initialARIA: {
        role: 'list',
      },
    });
  }

  protected override update(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('separator')) {
      this._separatorContext.setValue(this.separator, true);
    }
    super.update(changedProperties);
  }

  protected override render() {
    return html`<slot></slot>`;
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-breadcrumbs': IgcBreadcrumbsComponent;
  }
}
