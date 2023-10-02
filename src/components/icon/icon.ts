import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { alternateName } from '../common/decorators/alternateName.js';
import { blazorInclude } from '../common/decorators/blazorInclude.js';
import { watch } from '../common/decorators/watch.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './icon.base.css.js';
import { styles as material } from './light/icon.material.css.js';
import { styles as bootstrap } from './light/icon.bootstrap.css.js';
import { styles as fluent } from './light/icon.fluent.css.js';
import { styles as indigo } from './light/icon.indigo.css.js';
import {
  IconsRegistry,
  registerIcon as registerIcon_impl,
  registerIconFromText as registerIconFromText_impl,
} from './icon.registry.js';

@themes({
  light: { material, bootstrap, fluent, indigo },
  dark: { material, bootstrap, fluent, indigo },
})
/**
 * Icon component
 *
 * @element igc-icon
 *
 *
 */
export default class IgcIconComponent extends SizableMixin(LitElement) {
  public static readonly tagName = 'igc-icon';

  public static override styles = styles;

  @state() private svg = '';

  /**
   * The name of the icon glyph to draw.
   * @attr
   */
  @property()
  @alternateName('iconName')
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
    this.size = 'medium';
  }

  public override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'img');
    }
    IconsRegistry.instance().subscribe(this.iconLoaded);
  }

  public override disconnectedCallback() {
    IconsRegistry.instance().unsubscribe(this.iconLoaded);
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
    const svg =
      this.name && this.collection
        ? IconsRegistry.instance().getIcon(this.name, this.collection)
        : '';
    this.svg = svg ?? '';
  }

  protected override render() {
    return html` ${unsafeSVG(this.svg)} `;
  }

  @blazorInclude()
  protected async registerIcon(
    name: string,
    url: string,
    collection = 'default'
  ) {
    await registerIcon_impl(name, url, collection);
  }

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
