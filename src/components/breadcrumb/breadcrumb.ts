import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { breadcrumbsContext } from '#internals/context.js';
import { createAsyncContext } from '#internals/controllers/async-consumer.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { addSlotController, DefaultSlot } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcIconComponent from '../icon/icon.js';
import { styles } from './themes/breadcrumb.base.css.js';
import { styles as shared } from './themes/shared/breadcrumb.common.css.js';
import { all } from './themes/themes.js';

const TabbableSelector =
  'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

/** Returns `root` itself, when tabbable, followed by its tabbable descendants. */
function getTabbables(root: HTMLElement): HTMLElement[] {
  const descendants = root.querySelectorAll<HTMLElement>(TabbableSelector);
  return root.matches(TabbableSelector)
    ? [root, ...descendants]
    : [...descendants];
}

/**
 * A single item within a breadcrumb navigation trail.
 *
 * @element igc-breadcrumb
 *
 * @slot - The main content of the breadcrumb, typically an anchor (`<a>`) element.
 * @slot prefix - Renders content before the main breadcrumb content.
 * @slot suffix - Renders content after the main breadcrumb content.
 * @slot separator - Overrides the default separator icon rendered after the breadcrumb item.
 * The separator is hidden from assistive technology.
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

  private readonly _slots = addSlotController(this, {
    slots: [DefaultSlot],
    onChange: this._syncTabbable,
  });

  /** Slotted tabbables taken out of the tab sequence, keyed to their original `tabindex`. */
  private readonly _suppressedTabbables = new Map<HTMLElement, string | null>();

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
   * Sets `aria-disabled="true"` on the element and removes the slotted
   * content from the tab sequence while active.
   *
   * @attr disabled
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  //#endregion

  //#region Lit lifecycle

  protected override update(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('current')) {
      this._internals.setARIA({ ariaCurrent: this.current ? 'page' : null });
    }

    if (changedProperties.has('disabled')) {
      this._internals.setARIA({
        ariaDisabled: this.disabled ? 'true' : null,
      });
      this._syncTabbable();
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
      <span part="separator" aria-hidden="true">
        <slot name="separator">
          <igc-icon name="${this._separator}" collection="default"></igc-icon>
        </slot>
      </span>
    `;
  }

  //#endregion

  //#region Internal API

  /**
   * Keeps the slotted focusable elements out of the tab sequence while the
   * breadcrumb is disabled. `pointer-events: none` alone still leaves a
   * disabled link reachable with Tab.
   */
  private _syncTabbable(): void {
    this._restoreTabbables();

    if (this.disabled) {
      this._suppressTabbables();
    }
  }

  private _suppressTabbables(): void {
    const assigned = this._slots.getAssignedElements<HTMLElement>(DefaultSlot);

    for (const element of assigned.flatMap(getTabbables)) {
      this._suppressedTabbables.set(element, element.getAttribute('tabindex'));
      element.tabIndex = -1;
    }
  }

  private _restoreTabbables(): void {
    for (const [element, tabindex] of this._suppressedTabbables) {
      if (tabindex === null) {
        element.removeAttribute('tabindex');
      } else {
        element.setAttribute('tabindex', tabindex);
      }
    }

    this._suppressedTabbables.clear();
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-breadcrumb': IgcBreadcrumbComponent;
  }
}
