import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { createRef, type Ref, ref } from 'lit/directives/ref.js';

import { addAnimationController } from '../../animations/player.js';
import { growVerIn, growVerOut } from '../../animations/presets/grow/index.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcButtonComponent from '../button/button.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { styles } from './themes/banner.base.css.js';
import { all } from './themes/themes.js';

export interface IgcBannerComponentEventMap {
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

/**
 * The `igc-banner` component displays important and concise message(s) for a user to address, that is specific to a page or feature.
 *
 * @element igc-banner
 *
 * @slot - Renders the text content of the banner message.
 * @slot prefix - Renders additional content at the start of the message block.
 * @slot actions - Renders any action elements.
 *
 * @fires igcClosing - Emitted before closing the banner - when a user interacts (click) with the default action of the banner.
 * @fires igcClosed - Emitted after the banner is closed - when a user interacts (click) with the default action of the banner.
 *
 * @csspart base - The base wrapper of the banner component.
 * @csspart spacer - The inner wrapper that sets the space around the banner.
 * @csspart message - The part that holds the text and the illustration.
 * @csspart illustration - The part that holds the banner icon/illustration.
 * @csspart content - The part that holds the banner text content.
 * @csspart actions - The part that holds the banner action buttons.
 */

export default class IgcBannerComponent extends EventEmitterMixin<
  IgcBannerComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-banner';
  public static styles = [styles];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcBannerComponent, IgcButtonComponent);
  }

  private readonly _bannerRef: Ref<HTMLElement> = createRef();
  private readonly _animationPlayer = addAnimationController(
    this,
    this._bannerRef
  );

  /**
   * Determines whether the banner is being shown/hidden.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  constructor() {
    super();

    addThemingController(this, all);

    addInternalsController(this, {
      initialARIA: {
        role: 'status',
        ariaLive: 'polite',
      },
    });
  }

  /** Shows the banner if not already shown. Returns `true` when the animation has completed. */
  public async show(): Promise<boolean> {
    if (this.open) {
      return false;
    }

    this.open = true;
    return await this.toggleAnimation('open');
  }

  /** Hides the banner if not already hidden. Returns `true` when the animation has completed. */
  public async hide(): Promise<boolean> {
    if (!this.open) {
      return false;
    }

    await this.toggleAnimation('close');
    this.open = false;
    return true;
  }

  /** Toggles between shown/hidden state. Returns `true` when the animation has completed. */
  public async toggle(): Promise<boolean> {
    return this.open ? await this.hide() : await this.show();
  }

  private async toggleAnimation(dir: 'open' | 'close') {
    const animation = dir === 'open' ? growVerIn : growVerOut;

    const [_, event] = await Promise.all([
      this._animationPlayer.stopAll(),
      this._animationPlayer.play(animation()),
    ]);

    return event.type === 'finish';
  }

  private async handleClick() {
    if (this.emitEvent('igcClosing', { cancelable: true })) {
      await this.hide();
      this.emitEvent('igcClosed');
    }
  }

  protected override render() {
    return html`
      <div ${ref(this._bannerRef)} part="base" .inert=${!this.open}>
        <div part="spacer">
          <div part="message">
            <div part="illustration">
              <slot name="prefix"></slot>
            </div>
            <div part="content">
              <slot></slot>
            </div>
          </div>
          <div part="actions">
            <slot name="actions">
              <igc-button
                type="button"
                variant="flat"
                @click=${this.handleClick}
                >OK</igc-button
              >
            </slot>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-banner': IgcBannerComponent;
  }
}
