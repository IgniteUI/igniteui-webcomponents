import { LitElement, html } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { addKeyboardFocusRing } from '../common/controllers/focus-ring.js';
import { registerComponent } from '../common/definitions/register.js';
import { partNameMap } from '../common/util.js';
import { styles } from './themes/carousel-indicator-container.base.css.js';
import { all } from './themes/indicator.js';
import { styles as shared } from './themes/shared/indicator/indicator.common.css.js';

@themes(all)
export default class IgcCarouselIndicatorContainerComponent extends LitElement {
  public static readonly tagName = 'igc-carousel-indicator-container';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcCarouselIndicatorContainerComponent);
  }

  private _kbFocus = addKeyboardFocusRing(this);

  private handleFocusOut(event: FocusEvent) {
    if (this.contains(event.relatedTarget as Node)) {
      return;
    }
    this._kbFocus.reset();
  }

  protected override render() {
    return html`
      <div
        part=${partNameMap({
          base: true,
          focused: this._kbFocus.focused,
        })}
        @click=${this._kbFocus.reset}
        @focusout=${this.handleFocusOut}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-carousel-indicator-container': IgcCarouselIndicatorContainerComponent;
  }
}
