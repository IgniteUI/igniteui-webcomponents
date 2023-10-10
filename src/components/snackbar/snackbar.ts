import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { AnimationPlayer } from '../../animations/player.js';
import { fadeIn, fadeOut } from '../../animations/presets/fade/index.js';
import { themes } from '../../theming/theming-decorator.js';
import IgcButtonComponent from '../button/button.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { styles } from './themes/snackbar.base.css.js';
import { all } from './themes/themes.js';

defineComponents(IgcButtonComponent);

export interface IgcSnackbarEventMap {
  igcAction: CustomEvent<void>;
}

@themes(all, true)
/**
 * A snackbar component is used to provide feedback about an operation
 * by showing a brief message at the bottom of the screen.
 *
 * @element igc-snackbar
 *
 * @slot - Renders the snackbar content.
 *
 * @fires igcAction - Emitted when the snackbar action button is clicked.
 *
 * @csspart base - The base wrapper of the snackbar component.
 * @csspart message - The snackbar message.
 * @csspart action - The snackbar action button.
 */
export default class IgcSnackbarComponent extends EventEmitterMixin<
  IgcSnackbarEventMap,
  Constructor<LitElement>
>(LitElement) {
  /** @private */
  public static tagName = 'igc-snackbar';

  /** @private */
  public static styles = styles;

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
  @property({ type: Boolean, attribute: 'keep-open' })
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

  protected override firstUpdated() {
    this.animationPlayer = new AnimationPlayer(this.content);
  }

  private async toggleAnimation(dir: 'open' | 'close') {
    const animation = dir === 'open' ? fadeIn : fadeOut;

    const [_, event] = await Promise.all([
      this.animationPlayer.stopAll(),
      this.animationPlayer.play(animation()),
    ]);

    return event.type === 'finish';
  }

  /** Opens the snackbar. */
  public show() {
    if (this.open) {
      return;
    }

    this.toggleAnimation('open');
    this.open = true;

    clearTimeout(this.autoHideTimeout);
    if (this.open && !this.keepOpen) {
      this.autoHideTimeout = window.setTimeout(
        () => this.hide(),
        this.displayTime
      );
    }
  }

  /** Closes the snackbar. */
  public async hide() {
    if (!this.open) {
      return;
    }

    await this.toggleAnimation('close');
    this.open = false;
    clearTimeout(this.autoHideTimeout);
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
      <div part="base">
        <span part="message">
          <slot></slot>
        </span>
        ${this.actionText
          ? html`
              <igc-button
                variant="flat"
                part="action"
                size="small"
                @click=${this.handleClick}
              >
                ${ifDefined(this.actionText)}
              </igc-button>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-snackbar': IgcSnackbarComponent;
  }
}
