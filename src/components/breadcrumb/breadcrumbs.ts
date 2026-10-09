import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { breadcrumbsContext } from '#internals/context.js';
import { addContextProvider } from '#internals/controllers/context-provider.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { registerComponent } from '#internals/definitions/register.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcBreadcrumbComponent from './breadcrumb.js';
import { styles } from './themes/breadcrumbs.base.css.js';
import { all } from './themes/themes.js';

/**
 * A breadcrumb navigation component that renders an ordered list of breadcrumb items.
 *
 * @remarks
 * Wrap breadcrumb items inside this component to build a navigable breadcrumb
 * trail. The component sets the ARIA `list` role on the host element. Wrap it in a
 * `<nav aria-label="...">` element to provide an accessible navigation landmark —
 * the label belongs on the `<nav>`, not the list, per the ARIA breadcrumb pattern.
 *
 * @element igc-breadcrumbs
 *
 * @slot - Default slot for the breadcrumb items.
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
  public static override styles = [componentBase, styles];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcBreadcrumbsComponent, IgcBreadcrumbComponent);
  }

  //#region Public properties

  /**
   * The icon name used as the default separator between breadcrumb items.
   * Can be overridden per-item using the `separator` slot on an individual breadcrumb item.
   *
   * @attr separator
   * @default 'tree_expand'
   */
  @property({ reflect: true })
  public separator = 'tree_expand';

  //#endregion

  //#region Lit lifecycle

  constructor() {
    super();

    addThemingController(this, all);
    addContextProvider(this, {
      context: breadcrumbsContext,
      watch: ['separator'],
      value: () => this.separator,
    });
    addInternalsController(this, {
      initialARIA: {
        role: 'list',
      },
    });
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
