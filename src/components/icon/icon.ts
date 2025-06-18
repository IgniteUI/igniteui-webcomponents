import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import { getThemeController, themes } from '../../theming/theming-decorator.js';
import { blazorInclude } from '../common/decorators/blazorInclude.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  getIconRegistry,
  registerIcon as registerIcon_impl,
  registerIconFromText as registerIconFromText_impl,
  setIconRef as setIconRef_impl,
} from './icon.registry.js';
import type { IconMeta } from './registry/types.js';
import { styles } from './themes/icon.base.css.js';
import { styles as shared } from './themes/shared/icon.common.css.js';
import { all } from './themes/themes.js';

/**
 * The icon component allows visualizing collections of pre-registered SVG icons.
 *
 * @element igc-icon
 *
 *
 */
@themes(all, { exposeController: true })
export default class IgcIconComponent extends LitElement {
  public static readonly tagName = 'igc-icon';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcIconComponent);
  }

  private __internals: ElementInternals;

  @state()
  private svg = '';

  /* alternateName: iconName */
  /**
   * The name of the icon glyph to draw.
   * @attr
   */
  @property()
  public name = '';

  /**
   * The name of the registered collection for look up of icons.
   * Defaults to `default`.
   * @attr
   */
  @property()
  public collection = 'default';

  /**
   * Whether to flip the icon. Useful for RTL layouts.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public mirrored = false;

  constructor() {
    super();
    this.__internals = this.attachInternals();
    this.__internals.role = 'img';

    getThemeController(this)!.onThemeChanged = (theme) =>
      getIconRegistry().setRefsByTheme(theme);
  }

  public override connectedCallback() {
    super.connectedCallback();
    getIconRegistry().subscribe(this.iconLoaded);
  }

  public override disconnectedCallback() {
    getIconRegistry().unsubscribe(this.iconLoaded);
    super.disconnectedCallback();
  }

  @watch('name')
  @watch('collection')
  protected iconChanged(prev: string, curr: string) {
    if (prev !== curr) {
      this.getIcon();
    }
  }

  private iconLoaded = (name: string, collection: string) => {
    if (this.name === name && this.collection === collection) {
      this.getIcon();
    }
  };

  private getIcon() {
    const { name, collection } = getIconRegistry().getIconRef(
      this.name,
      this.collection
    );
    const { svg, title } = getIconRegistry().get(name, collection) ?? {};

    this.svg = svg ?? '';
    this.__internals.ariaLabel = title ?? null;
  }

  protected override render() {
    return html`${unsafeSVG(this.svg)}`;
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
