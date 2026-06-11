import { html } from 'lit';
import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcBaseAlertLikeComponent } from '../common/mixins/alert.js';
import { styles as shared } from './themes/shared/toast.common.css.js';
import { all } from './themes/themes.js';
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
 *
 * @csspart base - The base wrapper of the toast.
 */
export default class IgcToastComponent extends IgcBaseAlertLikeComponent {
  public static readonly tagName = 'igc-toast';
  public static override styles = [styles, shared];

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
