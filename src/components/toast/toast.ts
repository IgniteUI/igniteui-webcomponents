import { html } from 'lit';

import { addAnimationController } from '../../animations/player.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcBaseAlertLikeComponent } from '../common/mixins/alert.js';
import { styles as shared } from './themes/shared/toast.common.css.js';
import { all } from './themes/themes.js';
import { styles } from './themes/toast.base.css.js';

/**
 * A toast component is used to show a notification
 *
 * @element igc-toast
 *
 * @csspart base - The base wrapper of the toast.
 */
export default class IgcToastComponent extends IgcBaseAlertLikeComponent {
  public static readonly tagName = 'igc-toast';
  public static override styles = [styles, shared];

  protected override _animationPlayer: ReturnType<
    typeof addAnimationController
  > = addAnimationController(this);

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
