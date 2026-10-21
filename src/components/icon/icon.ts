import { html, isServer, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { blazorInclude } from '#internals/decorators/blazorInclude.js';
import { registerComponent } from '#internals/definitions/register.js';
import { HostAriaMixin } from '#internals/mixins/host-aria.js';
import { HydrationMixin } from '#internals/mixins/hydration.js';
import { all } from '#themes/icon/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import {
  getIconRegistry,
  registerIcon as registerIcon_impl,
  registerIconFromText as registerIconFromText_impl,
  setIconRef as setIconRef_impl,
} from './icon.registry.js';
import type { IconMeta } from './registry/types.js';
import { styles } from './themes/icon.base.css.js';
import { styles as shared } from './themes/shared/icon.common.css.js';

/**
 * Shows an SVG icon from a collection of registered icons.
 *
 * @element igc-icon
 *
 * @remarks
 * The icon component renders SVG icons from registered icon collections. Icons can be:
 * - The internal icons that the library components use
 * - Registered dynamically using `registerIcon` or `registerIconFromText`
 * - Referenced by aliases that resolve differently based on the active theme
 *
 * An alias resolves for the active theme, also inside a theme provider.
 * The component subscribes to the icon registry and updates automatically when icons
 * are registered or references are updated.
 *
 * @example
 * ```html
 * <!-- Use an icon registered in the default collection -->
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
export default class IgcIconComponent extends HydrationMixin(
  HostAriaMixin(LitElement)
) {
  public static readonly tagName = 'igc-icon';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcIconComponent);
  }

  private readonly _internals = addInternalsController(this);

  private readonly _theming = addThemingController(this, all, {
    themeChange: this._getIcon,
  });

  private readonly _onRegistryChange = (): void => this._getIcon();

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
   * When the icon name or collection changes, the component looks up
   * and renders the new icon in the registry.
   */
  @property()
  public name = '';

  /**
   * The registered collection to look the icon up in.
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
   * Whether the icon is flipped horizontally, for example for RTL layouts.
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
    getIconRegistry().subscribe(this._onRegistryChange);
  }

  /** An author label applies at once, without a render. @internal */
  protected override _handleHostAriaChange(): void {
    this._getIcon();
  }

  /** @internal */
  public override disconnectedCallback(): void {
    getIconRegistry().unsubscribe(this._onRegistryChange);
    super.disconnectedCallback();
  }

  protected override update(props: PropertyValues): void {
    if (props.has('name') || props.has('collection')) {
      this._getIcon();
    }

    super.update(props);

    if (props.has('_svg')) {
      // The host carries any name, so the SVG is decorative.
      this.renderRoot.querySelector('svg')?.setAttribute('aria-hidden', 'true');
    }
  }

  protected override _onHydrated(): void {
    // Named, so the update treats the withheld SVG as a change.
    if (this._svg) {
      this.requestUpdate('_svg');
    }
  }

  private _getIcon(): void {
    const registry = getIconRegistry();
    const { name, collection } = registry.getIconRef(
      this.name,
      this.collection,
      this._theming.theme
    );
    const { svg = '', title } = registry.get(name, collection) ?? {};

    // An unnamed icon is decorative, and an unnamed `img` is only noise.
    const labelled =
      Boolean(title) ||
      this.hasAttribute('aria-label') ||
      this.hasAttribute('aria-labelledby');

    this._svg = svg;
    this._internals.setARIA({
      role: labelled ? 'img' : null,
      ariaLabel: title ?? null,
    });
  }

  protected override render() {
    return isServer || this._hydrating
      ? nothing
      : html`${unsafeSVG(this._svg)}`;
  }

  /* c8 ignore next 8 */
  @blazorInclude()
  protected async registerIcon(
    name: string,
    url: string,
    collection = 'default',
    stripMeta = false
  ) {
    await registerIcon_impl(name, url, { collection, stripMeta });
  }

  /* c8 ignore next 8 */
  @blazorInclude()
  protected registerIconFromText(
    name: string,
    iconText: string,
    collection = 'default',
    stripMeta = false
  ) {
    registerIconFromText_impl(name, iconText, { collection, stripMeta });
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
