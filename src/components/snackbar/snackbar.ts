import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { themes } from '../../theming';
import { styles } from './themes/snackbar.base.css';
import { styles as bootstrap } from './themes/snackbar.bootstrap.css';
import { styles as fluent } from './themes/snackbar.fluent.css';
import { styles as indigo } from './themes/snackbar.indigo.css';

export interface IgcSnackbarEventMap {
  igcAction: CustomEvent<void>;
}

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
@themes({ bootstrap, fluent, indigo })
export default class IgcSnackbarComponent extends EventEmitterMixin<
  IgcSnackbarEventMap,
  Constructor<LitElement>
>(LitElement) {
  /** @private */
  public static tagName = 'igc-snackbar';

  /** @private */
  public static styles = styles;

  private autoHideTimeout!: number;

  /** Determines whether the snackbar is opened. */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /** Determines the duration in ms in which the snackbar will be visible. */
  @property({ type: Number, attribute: 'display-time' })
  public displayTime!: number;

  /** Determines whether the snackbar should close after the displayTime is over. */
  @property({ type: Boolean, attribute: 'keep-open' })
  public keepOpen = false;

  /** The snackbar action button. */
  @property({ attribute: 'action-text' })
  public actionText!: string;

  /** Opens the snackbar. */
  public show() {
    if (this.open) {
      return;
    }

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
  public hide() {
    if (!this.open) {
      return;
    }

    this.open = false;
    clearTimeout(this.autoHideTimeout);
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
