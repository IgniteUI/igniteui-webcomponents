import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { styles } from './icon.material.css';
import { IconsRegistry } from './icon.registry.js';

// @customElement('igc-icon')
export class IgcIconComponent extends SizableMixin(LitElement) {
  static styles = styles;

  @state() private svg = '';

  private _name: string | undefined;

  set name(value: string | undefined) {
    if (this._name !== value) {
      this._name = value;
      this.getIcon();
    }
  }
  @property()
  get name(): string | undefined {
    return this._name;
  }

  private _collection = 'default';

  set collection(value: string) {
    if (this._collection !== value) {
      this._collection = value;
      this.getIcon();
    }
  }
  @property()
  get collection(): string {
    return this._collection;
  }

  @property({ type: Boolean, reflect: true })
  mirrored = false;

  constructor() {
    super();
    this.size = 'medium';
  }

  connectedCallback() {
    super.connectedCallback();

    this.setAttribute('role', 'img');

    IconsRegistry.instance().subscribe(this.iconLoaded);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    IconsRegistry.instance().unsubscribe(this.iconLoaded);
  }

  private iconLoaded = (name: string, set: string) => {
    if (this.name === name && this.collection === set) {
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

  render() {
    return html` ${unsafeSVG(this.svg)} `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-icon': IgcIconComponent;
  }
}
