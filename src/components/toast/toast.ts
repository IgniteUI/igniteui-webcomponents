import { html } from 'lit';
import { IgcBaseAlertLikeComponent } from '#internals/bases/alert.js';
import { registerComponent } from '#internals/definitions/register.js';
import { all } from '#themes/toast/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { styles as shared } from './themes/shared/toast.common.css.js';
import { styles } from './themes/toast.base.css.js';

/**
 * A toast component is used to show a brief, non-interactive notification.
 *
 * The component integrates with the
 * [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API):
 * an Ignite button or a native `<button>` with `command="--show"` / `"--hide"` /
 * `"--toggle"` and `commandfor` pointing to this element will call the
 * corresponding method declaratively without any JavaScript.
 *
 * @element igc-toast
 *
 * @slot - Default slot for the toast content.
 */
export default class IgcToastComponent extends IgcBaseAlertLikeComponent {
  public static readonly tagName = 'igc-toast';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcToastComponent);
  }

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override render() {
    return html`<slot .inert=${!this.open}></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-toast': IgcToastComponent;
  }
}
