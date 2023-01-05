import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { themes } from '../../theming/theming-decorator.js';
import { watch } from '../common/decorators/watch.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { registerComponent } from '../common/util.js';
import { styles } from './themes/avatar.base.css.js';
import { styles as bootstrap } from './themes/avatar.bootstrap.css.js';

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
@themes({ bootstrap })
export default class IgcAvatarComponent extends SizableMixin(LitElement) {
  public static readonly tagName = 'igc-avatar';
  public static override styles = styles;

  public static register() {
    registerComponent(this);
  }

  /**
   * The image source to use.
   * @attr
   */
  @property()
  public src!: string;

  @state()
  private hasError = false;

  /**
   * Alternative text for the image.
   * @attr
   */
  @property()
  public alt!: string;

  /**
   * Initials to use as a fallback when no image is available.
   * @attr
   */
  @property()
  public initials!: string;

  /**
   * The shape of the avatar.
   * @attr
   */
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

  @watch('src')
  protected handleErrorState() {
    this.hasError = false;
  }

  protected override render() {
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
