import { LitElement, html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';

import { styles } from './themes/snackbar.base.css.js';
import { all } from './themes/themes.js';
import { AnimationPlayer } from '../../animations/player.js';
import { fadeIn, fadeOut } from '../../animations/presets/fade/index.js';
import { themes } from '../../theming/theming-decorator.js';
import IgcButtonComponent from '../button/button.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';

export interface IgcSnackbarEventMap {
  igcAction: CustomEvent<void>;
}

/**
 * A snackbar component is used to provide feedback about an operation
 * by showing a brief message at the bottom of the screen.
 *
 * @element igc-snackbar
 *
 * @slot - Default slot to render the snackbar content.
 * @slot action - Renders the action part of the snackbar. Usually an interactive element (button)
 *
 * @fires igcAction - Emitted when the snackbar action button is clicked.
 *
 * @csspart base - The base wrapper of the snackbar component.
 * @csspart message - The snackbar message.
 * @csspart action - The default snackbar action button.
 * @csspart action-container - The area holding the actions.
 */
@themes(all, true)
export default class IgcSnackbarComponent extends EventEmitterMixin<
  IgcSnackbarEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-snackbar';
  public static styles = styles;

  public static register() {
    registerComponent(this, IgcButtonComponent);
  }

  private _internals: ElementInternals;
  private autoHideTimeout!: number;
  private animationPlayer!: AnimationPlayer;

  @query('[part~="base"]', true)
  protected content!: HTMLElement;

  /**
   * Determines whether the snackbar is opened.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /**
   * Determines the duration in ms in which the snackbar will be visible.
   * @attr display-time
   */
  @property({ type: Number, attribute: 'display-time' })
  public displayTime = 4000;

  /**
   * Determines whether the snackbar should close after the displayTime is over.
   * @attr keep-open
   */
  @property({ type: Boolean, attribute: 'keep-open', reflect: true })
  public keepOpen = false;

  /**
   * Sets the position of the snackbar.
   * @attr position
   */
  @property({ reflect: true, attribute: 'position' })
  public position: 'bottom' | 'middle' | 'top' = 'bottom';

  /**
   * The snackbar action button.
   * @attr action-text
   */
  @property({ attribute: 'action-text' })
  public actionText!: string;

  @watch('displayTime', { waitUntilFirstUpdate: true })
  protected displayTimeChange() {
    this.setAutoHideTimer();
  }

  @watch('keepOpen', { waitUntilFirstUpdate: true })
  protected keepOpenChange() {
    clearTimeout(this.autoHideTimeout);
  }

  private async toggleAnimation(dir: 'open' | 'close') {
    const animation = dir === 'open' ? fadeIn : fadeOut;

    const [_, event] = await Promise.all([
      this.animationPlayer.stopAll(),
      this.animationPlayer.play(animation()),
    ]);

    return event.type === 'finish';
  }

  private setAutoHideTimer() {
    clearTimeout(this.autoHideTimeout);
    if (this.open && this.displayTime > 0 && !this.keepOpen) {
      this.autoHideTimeout = window.setTimeout(
        () => this.hide(),
        this.displayTime
      );
    }
  }

  constructor() {
    super();
    this._internals = this.attachInternals();

    this._internals.role = 'status';
    this._internals.ariaLive = 'polite';
  }

  protected override firstUpdated() {
    this.animationPlayer = new AnimationPlayer(this.content);
  }

  /** Opens the snackbar. */
  public async show() {
    if (this.open) {
      return;
    }

    this.open = true;
    await this.toggleAnimation('open');

    this.setAutoHideTimer();
  }

  /** Closes the snackbar. */
  public async hide() {
    if (!this.open) {
      return;
    }

    clearTimeout(this.autoHideTimeout);

    await this.toggleAnimation('close');
    this.open = false;
  }

  /** Toggles the open state of the component. */
  public toggle() {
    this.open ? this.hide() : this.show();
  }

  private handleClick() {
    this.emitEvent('igcAction');
  }

  protected override render() {
    return html`
      <div part="base" .inert=${!this.open}>
        <span part="message">
          <slot></slot>
        </span>

        <slot name="action" part="action-container" @click=${this.handleClick}>
          ${this.actionText
            ? html`<igc-button
                type="button"
                part="action"
                variant="flat"
                size="small"
                >${this.actionText}</igc-button
              >`
            : nothing}
        </slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-snackbar': IgcSnackbarComponent;
  }
}
