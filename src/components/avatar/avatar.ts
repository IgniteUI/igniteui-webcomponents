import { html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcBaseComponent } from '../common/component-base.js';
import { styles } from './avatar.material.css';

export class IgcAvatarComponent extends IgcBaseComponent {
  static styles = [styles];

  @property()
  src?: string;

  @state()
  private hasError = false;

  @property()
  alt?: string;

  @property()
  initials?: string;

  @property()
  shape: 'circle' | 'rounded' | 'square' = 'square';

  protected get classes() {
    const { size, shape } = this;

    return {
      circle: shape === 'circle',
      rounded: shape === 'rounded',
      square: shape === 'square',
      small: size === 'small',
      medium: size === 'medium',
      large: size === 'large',
    };
  }

  constructor() {
    super();
    this.size = 'small';
  }

  render() {
    return html`
      <div
        part="native"
        role="img"
        aria-label="avatar"
        aria-roledescription=${this.size + ' ' + this.shape}
        class=${classMap(this.classes)}
      >
        ${this.initials
          ? html`<span part="initials">${this.initials}</span>`
          : html`
              <span part="icon">
                <slot name="icon"></slot>
              </span>
            `}
        ${this.src && !this.hasError
          ? html`
              <img
                part="image"
                alt=${ifDefined(this.alt)}
                src=${ifDefined(this.src)}
                @error="${() => (this.hasError = true)}"
              />
            `
          : ''}
      </div>
    `;
  }
}
