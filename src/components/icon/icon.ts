import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import { themes } from '../../theming/theming-decorator.js';
import { blazorInclude } from '../common/decorators/blazorInclude.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import {
  getIconRegistry,
  registerIconFromText as registerIconFromText_impl,
  registerIcon as registerIcon_impl,
} from './icon.registry.js';
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
@themes(all)
export default class IgcIconComponent extends SizableMixin(LitElement) {
  public static readonly tagName = 'igc-icon';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(this);
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
    this.size = 'medium';
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
    const { svg, title } =
      getIconRegistry().get(this.name, this.collection) ?? {};

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
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-icon': IgcIconComponent;
  }
}
