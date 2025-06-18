import { html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { createRef, type Ref, ref } from 'lit/directives/ref.js';

import { addAnimationController } from '../../animations/player.js';
import { themes } from '../../theming/theming-decorator.js';
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
@themes(all)
export default class IgcSnackbarComponent extends EventEmitterMixin<
  IgcSnackbarComponentEventMap,
  AbstractConstructor<IgcBaseAlertLikeComponent>
>(IgcBaseAlertLikeComponent) {
  public static readonly tagName = 'igc-snackbar';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSnackbarComponent, IgcButtonComponent);
  }

  protected contentRef: Ref<HTMLElement> = createRef();
  protected override _animationPlayer: ReturnType<
    typeof addAnimationController
  > = addAnimationController(this, this.contentRef);

  /**
   * The snackbar action button.
   * @attr action-text
   */
  @property({ attribute: 'action-text' })
  public actionText!: string;

  private handleClick() {
    this.emitEvent('igcAction');
  }

  protected override render() {
    return html`
      <div ${ref(this.contentRef)} part="base" .inert=${!this.open}>
        <span part="message">
          <slot></slot>
        </span>

        <slot name="action" part="action-container" @click=${this.handleClick}>
          ${this.actionText
            ? html`<igc-button type="button" part="action" variant="flat">
                ${this.actionText}
              </igc-button>`
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
