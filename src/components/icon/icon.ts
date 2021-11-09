import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { alternateName, blazorInclude } from '../common/decorators';
import { SizableMixin } from '../common/mixins/sizable.js';
import { styles } from './icon.material.css';
import {
  IconsRegistry,
  registerIcon as registerIcon_impl,
  registerIconFromText as registerIconFromText_impl,
} from './icon.registry.js';

/**
 * Icon component
 *
 * @element igc-icon
 *
 *
 */
@customElement('igc-icon')
export default class IgcIconComponent extends SizableMixin(LitElement) {
  /** @private */
  public static tagName = 'igc-icon';

  /**
   * @private
   */
  public static styles = styles;

  @state() private svg = '';

  private _name = '';

  private _collection = 'default';

  @property()
  @alternateName('iconName')
  public set name(value: string) {
    if (this._name !== value) {
      this._name = value;
      this.getIcon();
    }
  }

  /**
   * The name of the icon glyph to draw.
   *
   * @attr [name=""]
   */
  public get name(): string {
    return this._name;
  }

  public set collection(value: string) {
    if (this._collection !== value) {
      this._collection = value;
      this.getIcon();
    }
  }

  /**
   * The name of the registered collection for look up of icons.
   * Defaults to `default`.
   *
   * @attr [collection=default]
   */
  @property()
  public get collection(): string {
    return this._collection;
  }

  /**
   * Whether to flip the icon. Useful for RTL layouts.
   */
  @property({ type: Boolean, reflect: true })
  public mirrored = false;

  constructor() {
    super();
    this.size = 'medium';
  }

  public connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'img');
    IconsRegistry.instance().subscribe(this.iconLoaded);
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    IconsRegistry.instance().unsubscribe(this.iconLoaded);
  }

  private iconLoaded = (name: string, collection: string) => {
    if (this.name === name && this.collection === collection) {
      this.getIcon();
    }
  };

  private getIcon() {
    const svg =
      this._name && this._collection
        ? IconsRegistry.instance().getIcon(this._name, this._collection)
        : '';
    this.svg = svg ?? '';
  }

  protected render() {
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
