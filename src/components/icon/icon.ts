import { html, LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import { addThemingController } from '../../theming/theming-controller.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { blazorInclude } from '../common/decorators/blazorInclude.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  getIconRegistry,
  registerIcon as registerIcon_impl,
  registerIconFromText as registerIconFromText_impl,
  setIconRef as setIconRef_impl,
} from './icon.registry.js';
import type { IconCallback, IconMeta } from './registry/types.js';
import { styles } from './themes/icon.base.css.js';
import { styles as shared } from './themes/shared/icon.common.css.js';
import { all } from './themes/themes.js';

/**
 * The icon component allows visualizing collections of pre-registered SVG icons.
 *
 * @element igc-icon
 *
 * @remarks
 * The icon component renders SVG icons from registered icon collections. Icons can be:
 * - Loaded from the internal collection (built-in icons)
 * - Registered dynamically using `registerIcon` or `registerIconFromText`
 * - Referenced by aliases that resolve differently based on the active theme
 *
 * Icons automatically adapt to the current theme when used within an `igc-theme-provider`.
 * The component subscribes to the icon registry and updates automatically when icons
 * are registered or references are updated.
 *
 * @example
 * ```html
 * <!-- Use a built-in icon -->
 * <igc-icon name="star"></igc-icon>
 *
 * <!-- Use an icon from a specific collection -->
 * <igc-icon name="search" collection="material"></igc-icon>
 *
 * <!-- Mirror the icon for RTL layouts -->
 * <igc-icon name="arrow-forward" mirrored></igc-icon>
 * ```
 *
 * @example
 * ```typescript
 * // Register a custom icon
 * import { registerIconFromText } from 'igniteui-webcomponents';
 *
 * const customIconSvg = '<svg viewBox="0 0 24 24">...</svg>';
 * registerIconFromText('custom-icon', customIconSvg, 'my-collection');
 * ```
 */
export default class IgcIconComponent extends LitElement {
  public static readonly tagName = 'igc-icon';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcIconComponent);
  }

  private readonly _internals = addInternalsController(this, {
    initialARIA: { role: 'img' },
  });

  private readonly _theming = addThemingController(this, all, {
    themeChange: this._getIcon,
  });

  private _boundIconLoaded?: IconCallback;

  @state()
  private _svg = '';

  /* alternateName: iconName */
  /**
   * The name of the icon glyph to draw.
   *
   * @attr name
   *
   * @remarks
   * The icon name can be:
   * - A direct reference to a registered icon in the specified collection
   * - An alias that resolves to different icons based on the current theme
   *
   * When the icon name or collection changes, the component automatically
   * fetches and renders the new icon.
   */
  @property()
  public name = '';

  /**
   * The name of the registered collection for look up of icons.
   *
   * @attr collection
   * @default "default"
   *
   * @remarks
   * Collections allow organizing icons into logical groups. The "default"
   * collection is used for most icons.
   * Custom collections can be created by registering icons with a specific collection name.
   */
  @property()
  public collection = 'default';

  /**
   * Whether to flip the icon horizontally. Useful for RTL (right-to-left) layouts.
   *
   * @attr mirrored
   * @default false
   *
   * @remarks
   * When true, the icon is flipped horizontally using CSS transform.
   * This is particularly useful for directional icons (arrows, chevrons)
   * in right-to-left language contexts.
   */
  @property({ type: Boolean, reflect: true })
  public mirrored = false;

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this._boundIconLoaded = this._iconLoaded.bind(this);
    getIconRegistry().subscribe(this._boundIconLoaded);
  }

  /** @internal */
  public override disconnectedCallback(): void {
    if (this._boundIconLoaded) {
      getIconRegistry().unsubscribe(this._boundIconLoaded);
    }
    super.disconnectedCallback();
  }

  protected override update(props: PropertyValues<this>): void {
    if (props.has('name') || props.has('collection')) {
      this._getIcon();
    }

    super.update(props);
  }

  /**
   * Callback invoked when an icon is registered or updated in the registry.
   * Re-fetches the icon if it matches this component's name and collection.
   *
   * @param name - The name of the registered icon
   * @param collection - The collection of the registered icon
   */
  private _iconLoaded(name: string, collection: string): void {
    if (this.name === name && this.collection === collection) {
      this._getIcon();
    }
  }

  /**
   * Fetches and updates the icon from the registry.
   *
   * @remarks
   * This method:
   * 1. Resolves the icon reference based on the current theme
   * 2. Retrieves the SVG content from the registry
   * 3. Updates the component's rendered SVG
   * 4. Sets the appropriate ARIA label from the icon's title
   *
   */
  private _getIcon(): void {
    const { name, collection } = getIconRegistry().getIconRef(
      this.name,
      this.collection,
      this._theming.theme
    );
    const { svg = '', title = null } =
      getIconRegistry().get(name, collection) ?? {};

    this._svg = svg;
    this._internals.setARIA({ ariaLabel: title });
  }

  protected override render() {
    return html`${unsafeSVG(this._svg)}`;
  }

  /* c8 ignore next 8 */
  @blazorInclude()
  protected async registerIcon(
    name: string,
    url: string,
    collection = 'default'
  ) {
    await registerIcon_impl(name, url, collection);
  }

  /* c8 ignore next 8 */
  @blazorInclude()
  protected registerIconFromText(
    name: string,
    iconText: string,
    collection = 'default'
  ) {
    registerIconFromText_impl(name, iconText, collection);
  }

  /* c8 ignore next 4 */
  @blazorInclude()
  protected setIconRef(name: string, collection: string, icon: IconMeta) {
    setIconRef_impl(name, collection, icon);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-icon': IgcIconComponent;
  }
}
