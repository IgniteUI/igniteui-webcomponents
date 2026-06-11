import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { addAnimationController } from '../../animations/player.js';
import { growVerIn, growVerOut } from '../../animations/presets/grow/index.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcButtonComponent from '../button/button.js';
import { addCommandController } from '../common/controllers/command.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
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
 * A non-modal notification banner that displays important, concise messages
 * requiring user acknowledgement.
 *
 * The banner slides into view with an animated grow transition and renders
 * inline, pushing the surrounding page content rather than overlaying it.
 *
 * The component integrates with the
 * [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API):
 * an Ignite button or a native `<button>` with `command="--show"` / `"--hide"` /
 * `"--toggle"` and `commandfor` pointing to this element will call the
 * corresponding method declaratively without any JavaScript.
 *
 * @element igc-banner
 *
 * @fires igcClosing - Emitted just before the banner closes in response to the
 *   default action button being clicked. Cancelable — call
 *   `event.preventDefault()` to abort the closing sequence.
 * @fires igcClosed - Emitted after the banner has fully closed and its exit
 *   animation has completed.
 *
 * @slot - The banner message text content.
 * @slot prefix - An icon or illustration rendered to the left of the message.
 *   Useful for reinforcing the message type (info, warning, success, etc.).
 * @slot actions - Custom action elements rendered in the banner's action area.
 *   When provided, replaces the default "OK" dismiss button.
 *
 * @csspart base - The root wrapper element of the banner.
 * @csspart spacer - The inner wrapper that controls the spacing around the banner content.
 * @csspart message - The container that holds the illustration and text content.
 * @csspart illustration - The container for the prefix slot (icon/illustration).
 * @csspart content - The container for the default message slot.
 * @csspart actions - The container for the action buttons slot.
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

  private readonly _bannerRef = createRef<HTMLElement>();
  private readonly _player = addAnimationController(this, this._bannerRef);

  /**
   * Whether the banner is open.
   *
   * Setting this property programmatically will immediately show or hide the
   * banner without animation and without emitting close events.
   * Prefer the `show()`, `hide()`, and `toggle()` methods for animated
   * transitions.
   * @attr open
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  constructor() {
    super();

    addThemingController(this, all);
    addSlotController(this, { slots: setSlots('prefix', 'actions') });
    addInternalsController(this, {
      initialARIA: {
        role: 'status',
        ariaLive: 'polite',
      },
    });
    addCommandController(this)
      .set('--show', this.show)
      .set('--hide', this.hide)
      .set('--toggle', this.toggle);
  }

  private async _handleClick(): Promise<void> {
    if (this.emitEvent('igcClosing', { cancelable: true })) {
      await this.hide();
      this.emitEvent('igcClosed');
    }
  }

  /**
   * Opens the banner with an animated grow-in transition.
   *
   * Returns `true` when the banner was successfully opened, or `false` if
   * it was already open.
   */
  public async show(): Promise<boolean> {
    if (this.open) {
      return false;
    }

    this.open = true;
    return this._player.playExclusive(growVerIn());
  }

  /**
   * Closes the banner with an animated grow-out transition.
   *
   * Returns `true` when the banner was successfully closed, or `false` if
   * it was already closed.
   */
  public async hide(): Promise<boolean> {
    if (!this.open) {
      return false;
    }

    await this._player.playExclusive(growVerOut());
    this.open = false;
    return true;
  }

  /**
   * Toggles the banner open or closed depending on its current state.
   *
   * Equivalent to calling `show()` when closed and `hide()` when open.
   * Returns `true` when the transition completed successfully.
   */
  public async toggle(): Promise<boolean> {
    return this.open ? this.hide() : this.show();
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
                @click=${this._handleClick}
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
