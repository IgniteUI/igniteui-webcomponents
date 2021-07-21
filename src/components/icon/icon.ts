import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { styles } from './icon.material.css';
import { IconsRegistry } from './icon.registry.js';

// @customElement('igc-icon')
export class IgcIconComponent extends LitElement {
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

  private _set = 'default';

  set set(value: string) {
    if (this._set !== value) {
      this._set = value;
      this.getIcon();
    }
  }
  @property()
  get set(): string {
    return this._set;
  }

  connectedCallback() {
    super.connectedCallback();
    IconsRegistry.instance().subscribe(this.iconLoaded);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    IconsRegistry.instance().unsubscribe(this.iconLoaded);
  }

  private iconLoaded = (name: string, set: string) => {
    if (this.name === name && this.set === set) {
      this.getIcon();
    }
  };

  private getIcon() {
    const svg =
      this._name && this._set
        ? IconsRegistry.instance().getIcon(this._name, this._set)
        : '';
    this.svg = svg ?? '';
  }

  render() {
    return html` <div part="base">${unsafeSVG(this.svg)}</div> `;
  }
}
