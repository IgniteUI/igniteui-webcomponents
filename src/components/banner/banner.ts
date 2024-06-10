import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { type Ref, createRef, ref } from 'lit/directives/ref.js';

import { addAnimationController } from '../../animations/player.js';
import { growVerIn, growVerOut } from '../../animations/presets/grow/index.js';
import { themes } from '../../theming/theming-decorator.js';
import IgcButtonComponent from '../button/button.js';
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

@themes(all)
export default class IgcBannerComponent extends EventEmitterMixin<
  IgcBannerComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-banner';
  public static styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcBannerComponent, IgcButtonComponent);
  }

  private _internals: ElementInternals;
  private _bannerRef: Ref<HTMLElement> = createRef();
  private _animationPlayer = addAnimationController(this, this._bannerRef);

  /**
   * Determines whether the banner is being shown/hidden.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  constructor() {
    super();
    this._internals = this.attachInternals();

    this._internals.role = 'status';
    this._internals.ariaLive = 'polite';
  }

  /** Shows the banner if not already shown. */
  public show(): void {
    if (this.open) {
      return;
    }

    this.open = true;
    this.toggleAnimation('open');
  }

  /** Hides the banner if not already hidden. */
  public hide(): void {
    if (!this.open) {
      return;
    }

    this.toggleAnimation('close');
    this.open = false;
  }

  /** Toggles between shown/hidden state. */
  public toggle(): void {
    this.open ? this.hide() : this.show();
  }

  private async toggleAnimation(dir: 'open' | 'close') {
    const animation = dir === 'open' ? growVerIn : growVerOut;

    const [_, event] = await Promise.all([
      this._animationPlayer.stopAll(),
      this._animationPlayer.play(animation()),
    ]);

    return event.type === 'finish';
  }

  private handleClick() {
    if (this.emitEvent('igcClosing', { cancelable: true })) {
      this.hide();
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
