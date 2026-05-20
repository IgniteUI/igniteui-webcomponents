import { html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcButtonComponent from '../button/button.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcBaseAlertLikeComponent } from '../common/mixins/alert.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { styles as shared } from './themes/shared/snackbar.common.css.js';
import { styles } from './themes/snackbar.base.css.js';
import { all } from './themes/themes.js';

export interface IgcSnackbarComponentEventMap {
  igcAction: CustomEvent<void>;
}

/**
 * A snackbar component is used to provide feedback about an operation
 * by showing a brief message at the bottom of the screen.
 *
 * The component integrates with the
 * [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API):
 * an `igc-button` or a native `<button>` with `command="--show"` / `"--hide"` /
 * `"--toggle"` and `commandfor` pointing to this element will call the
 * corresponding method declaratively without any JavaScript.
 *
 * @element igc-snackbar
 *
 * @slot - Default slot to render the snackbar content.
 * @slot action - Renders the action part of the snackbar. Usually an interactive element (button).
 *
 * @fires igcAction - Emitted when the snackbar action button is clicked.
 *
 * @csspart base - The base wrapper of the snackbar component.
 * @csspart message - The snackbar message.
 * @csspart action - The default snackbar action button.
 * @csspart action-container - The area holding the actions.
 *
 * @example
 * <!-- Basic usage with programmatic control -->
 * <igc-button onclick="snackbar.show()">Show</igc-button>
 * <igc-snackbar id="snackbar" keep-open>Your changes have been saved.</igc-snackbar>
 *
 * @example
 * <!-- Declarative control via the Invoker Commands API -->
 * <igc-button command="--show" commandfor="status-snackbar">Show</igc-button>
 * <igc-snackbar id="status-snackbar" keep-open>Your changes have been saved.</igc-snackbar>
 */
export default class IgcSnackbarComponent extends EventEmitterMixin<
  IgcSnackbarComponentEventMap,
  AbstractConstructor<IgcBaseAlertLikeComponent>
>(IgcBaseAlertLikeComponent) {
  public static readonly tagName = 'igc-snackbar';
  public static styles = [styles, shared];

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
          ${this.actionText
            ? html`
                <igc-button type="button" part="action" variant="flat">
                  ${this.actionText}
                </igc-button>
              `
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
