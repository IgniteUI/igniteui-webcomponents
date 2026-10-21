import { html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { IgcBaseAlertLikeComponent } from '#internals/bases/alert.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { all } from '#themes/snackbar/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcButtonComponent from '../button/button.js';
import { styles as shared } from './themes/shared/snackbar.common.css.js';
import { styles } from './themes/snackbar.base.css.js';

export interface IgcSnackbarComponentEventMap {
  igcAction: CustomEvent<void>;
}

/**
 * Shows a brief message about an operation, with an optional action.
 *
 * The component supports the
 * [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API).
 * A button with `command="--show"`, `"--hide"` or `"--toggle"` and a
 * `commandfor` that points to this element calls the matching method.
 *
 * @element igc-snackbar
 *
 * @slot - The content of the snackbar.
 * @slot action - The action of the snackbar, usually a button. Replaces the default action button.
 *
 * @fires igcAction - Emitted when the user clicks the default action button or the content of the `action` slot.
 *
 * @csspart base - The base wrapper of the snackbar component.
 * @csspart message - The snackbar message.
 * @csspart action - The default snackbar action button.
 * @csspart action-container - The area holding the actions.
 */
export default class IgcSnackbarComponent extends EventEmitterMixin<
  IgcSnackbarComponentEventMap,
  typeof IgcBaseAlertLikeComponent
>(IgcBaseAlertLikeComponent) {
  public static readonly tagName = 'igc-snackbar';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcSnackbarComponent, IgcButtonComponent);
  }

  /**
   * The text of the action button.
   * @attr action-text
   */
  @property({ attribute: 'action-text' })
  public actionText?: string;

  constructor() {
    super();
    addThemingController(this, all);
  }

  private _handleClick(): void {
    this.emitEvent('igcAction');
  }

  protected override render() {
    return html`
      <div part="base" .inert=${!this.open}>
        <span part="message">
          <slot></slot>
        </span>

        <slot name="action" part="action-container" @click=${this._handleClick}>
          ${
            this.actionText
              ? html`
                  <igc-button type="button" part="action" variant="flat">
                    ${this.actionText}
                  </igc-button>
                `
              : nothing
          }
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
