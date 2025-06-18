import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { themes } from '../../theming/theming-decorator.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { AvatarShape } from '../types.js';
import { styles } from './themes/avatar.base.css.js';
import { styles as shared } from './themes/shared/avatar.common.css.js';
import { all } from './themes/themes.js';

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
@themes(all)
export default class IgcAvatarComponent extends LitElement {
  public static readonly tagName = 'igc-avatar';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcAvatarComponent);
  }

  private __internals: ElementInternals;

  @state()
  private hasError = false;

  /**
   * The image source to use.
   * @attr
   */
  @property()
  public src!: string;

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
  public shape: AvatarShape = 'square';

  constructor() {
    super();

    this.__internals = this.attachInternals();
    this.__internals.role = 'img';
    this.__internals.ariaLabel = 'avatar';
  }

  @watch('initials')
  @watch('alt')
  protected roleDescriptionChange() {
    this.__internals.ariaRoleDescription = this.alt ?? this.initials;
  }

  @watch('src')
  protected handleErrorState() {
    this.hasError = false;
  }

  protected handleError() {
    this.hasError = true;
  }

  protected override render() {
    return html`
      <div part="base">
        ${this.initials
          ? html`<span part="initials">${this.initials}</span>`
          : html`<slot></slot>`}
        ${this.src && !this.hasError
          ? html`
              <img
                part="image"
                alt=${ifDefined(this.alt)}
                src=${ifDefined(this.src)}
                @error=${this.handleError}
              />
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-avatar': IgcAvatarComponent;
  }
}
