import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { styles } from './avatar.material.css';

/**
 * An avatar component is used as a representation of a user identity
 * typically in a user profile.
 *
 * @element igc-avatar
 *
 * @slot - Renders an icon inside the default slot.
 *
 * @csspart base - The base wrapper of the avatar.
 * @csspart initials - The initials wrapper of the avatar.
 * @csspart image - The image wrapper of the avatar.
 * @csspart icon - The icon wrapper of the avatar.
 */
@customElement('igc-avatar')
export default class IgcAvatarComponent extends SizableMixin(LitElement) {
  /** @private */
  public static styles = [styles];

  /** The image source to use. */
  @property()
  public src!: string;

  @state()
  private hasError = false;

  /** Alternative text for the image. */
  @property()
  public alt!: string;

  /** Initials to use as a fallback when no image is available. */
  @property()
  public initials!: string;

  /** The shape of the avatar. */
  @property({ reflect: true })
  public shape: 'circle' | 'rounded' | 'square' = 'square';

  private get classes() {
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

  protected render() {
    return html`
      <div
        part="base"
        role="img"
        aria-label="avatar"
        aria-roledescription=${this.size + ' ' + this.shape}
        class=${classMap(this.classes)}
      >
        ${this.initials
          ? html`<span part="initials">${this.initials}</span>`
          : html` <slot></slot> `}
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

declare global {
  interface HTMLElementTagNameMap {
    'igc-avatar': IgcAvatarComponent;
  }
}
